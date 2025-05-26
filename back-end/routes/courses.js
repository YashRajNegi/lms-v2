const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const { ClerkExpressRequireAuth, clerkClient } = require('@clerk/clerk-sdk-node');
const mongoose = require('mongoose');


// Get all courses
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().select('-lessons.content');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get enrolled courses and progress for a specific user
router.get('/enrolled', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const userId = req.auth.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Find courses where the user is in the enrolledStudents array
        const enrolledCourses = await Course.find({
            'enrolledStudents.studentId': userId
        }, 'title description enrolledStudents lessons.title').lean(); 

        const coursesWithDetails = await Promise.all(enrolledCourses.map(async (course) => {
            const studentEnrollment = course.enrolledStudents.find(student => student.studentId === userId);
            const completedLessonCount = studentEnrollment ? studentEnrollment.completedLessons.length : 0;
            const totalLessonCount = course.lessons ? course.lessons.length : 0;

            // Fetch assignments for this course and then find the user's submission
            const courseAssignments = await Assignment.find({ course: course._id }).lean(); // Fetch all assignments for the course

            let totalGrade = 0;
            let gradedSubmissionsCount = 0;

            courseAssignments.forEach(assignment => {
                // Find the specific submission for the current user within this assignment
                 const submission = assignment.submissions.find(sub => sub.studentId === userId);
                 if (submission && submission.mark && submission.mark.grade !== undefined && submission.mark.grade !== null) {
                    totalGrade += submission.mark.grade;
                    gradedSubmissionsCount++;
                 }
            });

            const averageGrade = gradedSubmissionsCount > 0 ? (totalGrade / gradedSubmissionsCount) : null; // Use null to indicate no graded assignments

            return {
                _id: course._id,
                title: course.title,
                description: course.description,
                completedLessons: completedLessonCount,
                totalLessons: totalLessonCount,
                averageGrade: averageGrade !== null ? parseFloat(averageGrade.toFixed(2)) : 'N/A', // Format to 2 decimal places
                // Potentially add recent activity data here later
            };
        }));

        res.json(coursesWithDetails);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific course
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).lean();
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Fetch instructor details if instructor ID exists and looks like a Clerk ID
        if (course.instructor && typeof course.instructor === 'string' && course.instructor.startsWith('user_')) {
            try {
                const instructorUser = await clerkClient.users.getUser(course.instructor);
                // Add instructor details to the course object
                course.instructorDetails = {
                    fullName: instructorUser.fullName || instructorUser.username || 'N/A',
                    imageUrl: instructorUser.imageUrl,
                    // Add other relevant fields as needed
                };
            } catch (clerkError) {
                console.error('Error fetching instructor details from Clerk:', clerkError);
                // Optionally, set instructorDetails to null or an error object if Clerk fetching fails
                course.instructorDetails = null; 
            }
        } else if (course.instructor) {
             // If instructor exists but doesn't look like a Clerk ID
             console.warn(`Course ${course._id} has an instructor ID (${course.instructor}) that doesn't appear to be a Clerk User ID.`);
             course.instructorDetails = { fullName: 'Unknown Instructor' }; // Provide a fallback
        } else {
            // If no instructor is set for the course
             course.instructorDetails = { fullName: 'No Instructor Assigned' };
        }

        res.json(course);
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create a new course
router.post('/', async (req, res) => {
    console.log('Request Body:', req.body);
    const apiKey = req.headers['x-api-key'];
    const expectedApiKey = process.env.COURSE_CREATION_API_KEY;
    const authHeader = req.headers['authorization'];

    console.log('Received X-API-Key:', apiKey);
    console.log('Expected API Key:', expectedApiKey);
    console.log('API Key match:', apiKey && apiKey === expectedApiKey);
    console.log('Authorization Header:', authHeader);

    let instructorId = null;

    if (apiKey && apiKey === expectedApiKey) {
        console.log('Using API Key authentication.');
        instructorId = req.body.instructor;
       
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
        console.log('Attempting Clerk authentication from Authorization header.');
        const token = authHeader.substring(7);
        try {
            const decodedToken = await clerkClient.verifyToken(token);
            instructorId = decodedToken.sub;
             console.log('Clerk authentication successful. userId:', instructorId);
        } catch (clerkError) {
            console.error('Clerk token verification failed:', clerkError);
            return res.status(401).json({ message: 'Authentication failed: Invalid Clerk token.' });
        }
    } else {
        console.error('Authentication failed: Neither API Key nor Authorization header found.');
        return res.status(401).json({ message: 'Authentication required: Provide a valid API Key or authenticate via Clerk.' });
    }

    // --- Core Course Creation Logic (executed only after authentication succeeds) ---
    console.log('Instructor ID after authentication determination:', instructorId);
    try {
        // Validate instructorId
        if (!instructorId) {
             console.error('Instructor ID is missing after authentication determination.');
             return res.status(400).json({ message: 'Instructor ID is required.' });
        }

        console.log('Instructor ID to use:', instructorId);

        const courseData = {
            title: req.body.title,
            description: req.body.description,
            imageUrl: req.body.imageUrl,
            instructor: instructorId,
            category: req.body.category,
            level: req.body.level,
            status: req.body.status || 'draft'
        };

        console.log('Course data for new Course:', courseData);

        const course = new Course(courseData);
        const newCourse = await course.save();
        console.log('Course created successfully:', newCourse._id);
        
        res.status(201).json(newCourse);

    } catch (error) {
        console.error('Error creating course:', error.message);
        
        if (error.name === 'ValidationError') {
             console.error('Mongoose Validation Errors:', error.errors);
             return res.status(400).json({ message: 'Course validation failed:' + error.message, details: error.errors });
        }

        return res.status(500).json({ message: 'Internal server error during course creation.' });
    }
});

// Update a course
router.put('/:id', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        if (course.instructor !== req.auth.userId) {
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }

        Object.assign(course, req.body);
        const updatedCourse = await course.save();
        res.json(updatedCourse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a course
router.delete('/:id', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructor !== req.auth.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this course' });
        }

        await course.deleteOne();
        res.json({ message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Enroll in a course
router.post('/:id/enroll', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const { userId } = req.auth;
        const isEnrolled = course.enrolledStudents.some(student => student.studentId === userId);
        
        if (isEnrolled) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        course.enrolledStudents.push({
            studentId: userId,
            progress: 0,
            completedLessons: [],
            lastAccessed: new Date()
        });

        await course.save();
        res.json({ message: 'Successfully enrolled in course' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update lesson progress
router.post('/:id/progress', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const { lessonId } = req.body;
        const course = await Course.findById(req.params.id);
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const studentIndex = course.enrolledStudents.findIndex(
            student => student.studentId === req.auth.userId
        );

        if (studentIndex === -1) {
            return res.status(400).json({ message: 'Not enrolled in this course' });
        }

        const student = course.enrolledStudents[studentIndex];
        
        if (!student.completedLessons.includes(lessonId)) {
            student.completedLessons.push(lessonId);
            // Calculate new progress based on the updated completedLessons array
            student.progress = (student.completedLessons.length / course.lessons.length) * 100;
            student.lastAccessed = new Date();

            // Check if the course is completed (progress is 100%)
            if (student.progress === 100) {
                student.completionDate = new Date(); // Set completion date
            }
        }

        await course.save();
        res.json({ message: 'Progress updated successfully' });
    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get user's enrolled courses
router.get('/user/enrolled', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const courses = await Course.find({
            'enrolledStudents.studentId': req.auth.userId
        }).select('-lessons.content');
        
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a new lesson to a course (New route)
router.post('/:courseId/lessons', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Basic authorization check: Only the instructor can add lessons
        if (course.instructor !== req.auth.userId) {
            return res.status(403).json({ message: 'Not authorized to add lessons to this course' });
        }

        // Extract necessary fields from the request body
        const { title, duration, contentType, content, videoUrl } = req.body; // Extract all relevant fields

        // Adjusted validation based on content type
        if (!title) {
            return res.status(400).json({ message: 'Lesson title is required.' });
        }

        if (contentType === 'text' && (!content || content.trim() === '')) {
            return res.status(400).json({ message: 'Lesson content is required for text lessons.' });
        }

        if (contentType === 'video' && (!videoUrl || videoUrl.trim() === '')) {
            return res.status(400).json({ message: 'Lesson video URL is required for video lessons.' });
        }

        // Add validation for other content types if needed in the future
        if (!['text', 'video', 'quiz', 'assignment', 'mixed'].includes(contentType)) {
             return res.status(400).json({ message: 'Invalid content type provided.' });
        }

        // --- Data Transformation for Existing Lessons ---
        // Ensure existing lessons conform to the updated schema before saving
        course.lessons = course.lessons.map(lesson => {
            // If the lesson already has the new content structure, keep it as is
            if (lesson.content && lesson.content.type) {
                return lesson;
            }

            // Otherwise, transform the old structure to the new one
            // Assuming old lessons had content as a simple string and were text type
            const transformedContent = {
                 type: 'text', // Assume old lessons were text
                 text: { content: lesson.content || '' } // Put old string content into nested text.content
                 // Note: Old lessons won't have video, quiz, etc. data in this structure
            };

            return {
                ...lesson.toObject(), // Convert Mongoose document to plain object for modification
                content: transformedContent,
                // Preserve original _id, title, duration, order, etc.
            };
        });
        // --- End Data Transformation ---

        // Determine the order for the new lesson
        const newLessonOrder = course.lessons.length; // Assign the next available order

        // Construct the lesson content object based on type for the NEW lesson
        let lessonContent = {};
        if (contentType === 'text') {
            lessonContent = {
                type: 'text',
                text: { content: content.trim() } // Save trimmed text content
            };
        } else if (contentType === 'video') {
             lessonContent = {
                type: 'video',
                video: { url: videoUrl.trim(), duration: duration || 30 } // Save trimmed video URL and duration
            };
        } else {
             // Handle other content types here if they become supported
              lessonContent = { type: contentType }; // Save just the type for now
        }

        const newLesson = {
            _id: new mongoose.Types.ObjectId(), // Generate a new ObjectId for the lesson
            title: title.trim(), // Trim title
            duration: duration || 30, // Default duration
            order: newLessonOrder,
            content: lessonContent, // Use the constructed content object for the NEW lesson
            createdAt: new Date(),
        };

        course.lessons.push(newLesson);

        await course.save();

        res.status(201).json(newLesson);

    } catch (error) {
        console.error('Error adding lesson:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete a lesson from a course (New route)
router.delete('/:courseId/lessons/:lessonId', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Authorization check: Only the instructor can delete lessons
        if (course.instructor !== req.auth.userId) {
            return res.status(403).json({ message: 'Not authorized to delete lessons from this course' });
        }

        // Find the index of the lesson to remove
        const lessonIndex = course.lessons.findIndex(lesson => lesson._id.toString() === req.params.lessonId);

        if (lessonIndex === -1) {
            return res.status(404).json({ message: 'Lesson not found in course' });
        }

        // Remove the lesson from the lessons array
        course.lessons.splice(lessonIndex, 1);

        // Optional: Re-sequence lesson order after deletion if desired
        // course.lessons.forEach((lesson, index) => { lesson.order = index; });

        await course.save();

        res.json({ message: 'Lesson deleted successfully' });

    } catch (error) {
        console.error('Error deleting lesson:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update a lesson in a course (New route)
router.put('/:courseId/lessons/:lessonId', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Authorization check: Only the instructor can update lessons
        if (course.instructor !== req.auth.userId) {
            return res.status(403).json({ message: 'Not authorized to update lessons in this course' });
        }

        // Find the specific lesson to update
        const lesson = course.lessons.id(req.params.lessonId); // Mongoose array.id() is useful here

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found in course' });
        }

        // Extract updated fields from the request body
        const { title, duration, contentType, content, videoUrl } = req.body; // Extract all relevant fields

         // Adjusted validation based on content type (similar to POST)
        if (!title) {
            return res.status(400).json({ message: 'Lesson title is required.' });
        }

        if (contentType === 'text' && (!content || content.trim() === '')) {
            return res.status(400).json({ message: 'Lesson content is required for text lessons.' });
        }

        if (contentType === 'video' && (!videoUrl || videoUrl.trim() === '')) {
            return res.status(400).json({ message: 'Lesson video URL is required for video lessons.' });
        }

        // Add validation for other content types if needed in the future
        if (!['text', 'video', 'quiz', 'assignment', 'mixed'].includes(contentType)) {
             return res.status(400).json({ message: 'Invalid content type provided.' });
        }

        // Update the lesson fields
        lesson.title = title.trim();
        lesson.duration = parseInt(duration, 10) || 30; // Ensure duration is a number

        // Update the content based on the new content type
        lesson.content = { // Construct the new content object
             type: contentType,
             text: contentType === 'text' ? { content: content.trim() } : undefined, // Set text content if type is text
             video: contentType === 'video' ? { url: videoUrl.trim(), duration: parseInt(duration, 10) || 30 } : undefined, // Set video details if type is video
             // Add other content types here
        };

        // Note: order and createdAt are typically not changed during edit

        await course.save(); // Save the parent course document to persist changes to the embedded lesson

        // Return the updated lesson object
        res.json(lesson);

    } catch (error) {
        console.error('Error updating lesson:', error);
        res.status(500).json({ message: error.message });
    }
});

// Generate Course Completion Certificate (New Route)
router.get('/:courseId/certificate', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const { courseId } = req.params;
        const { userId } = req.auth; // Get the authenticated user's ID

        // 1. Fetch Course Details
        const course = await Course.findById(courseId).lean();
        if (!course) {
            return res.status(404).json({ message: 'Course not found.' });
        }

        // 2. Find Student Enrollment and Check Completion
        const studentEnrollment = course.enrolledStudents.find(student => student.studentId === userId);
        if (!studentEnrollment || !studentEnrollment.completionDate) {
            // If student not enrolled or completionDate is not set
            return res.status(403).json({ message: 'Course not completed or not enrolled.' });
        }

        // 3. Fetch User Details from Clerk
        let userDetails = null;
        try {
            const clerkUser = await clerkClient.users.getUser(userId);
            userDetails = { // Extract relevant user info
                fullName: clerkUser.fullName || clerkUser.username || 'Student',
                // Add other details needed for the certificate if available/necessary
            };
        } catch (clerkError) {
            console.error('Error fetching user details from Clerk for certificate:', clerkError);
            // Continue without full user details, maybe use just the userId or a placeholder
             userDetails = { fullName: 'Student' }; // Fallback
        }

        // 4. Prepare Data for Certificate
        const certificateData = {
            studentName: userDetails.fullName,
            courseTitle: course.title,
            completionDate: studentEnrollment.completionDate,
            // Add other data like instructor name, course duration, etc., if available and needed
        };

        // 5. --- Certificate Generation Logic (TODO) ---
        // This is where you would use a library (like pdfmake, html-pdf, etc.)
        // to generate the certificate document (e.g., a PDF or image) using the certificateData.
        // Example (pseudocode): const pdfDoc = generateCertificatePdf(certificateData);

        console.log('Certificate data prepared:', certificateData);
        // For now, we'll just send the data as JSON as a placeholder response
        // In a real implementation, you'd set response headers for file download
        // and pipe the generated document stream to res.
        
        // Example response headers for PDF download:
        // res.setHeader('Content-Type', 'application/pdf');
        // res.setHeader('Content-Disposition', `attachment; filename="${course.title}-certificate.pdf"`);
        // pdfDoc.pipe(res);

        // Temporary JSON response
        res.status(200).json({ message: 'Certificate data fetched (generation not implemented)', data: certificateData });

    } catch (error) {
        console.error('Error generating certificate:', error);
        res.status(500).json({ message: 'Error generating certificate.' });
    }
});

module.exports = router; 