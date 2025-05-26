const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// Get all assignments for a course
router.get('/course/:courseId', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const assignments = await Assignment.find({ course: req.params.courseId });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific assignment
router.get('/:id', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new assignment
router.post('/', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const course = await Course.findById(req.body.course);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructor !== req.auth.userId) {
            return res.status(403).json({ message: 'Not authorized to create assignments for this course' });
        }

        const assignment = new Assignment({
            ...req.body,
            status: 'published',
            createdBy: req.auth.userId
        });
        const newAssignment = await assignment.save();
        res.status(201).json(newAssignment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update an assignment
router.put('/:id', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const course = await Course.findById(assignment.course);
        if (course.instructor !== req.auth.userId) {
            return res.status(403).json({ message: 'Not authorized to update this assignment' });
        }

        Object.assign(assignment, req.body);
        const updatedAssignment = await assignment.save();
        res.json(updatedAssignment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete an assignment
router.delete('/:id', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const course = await Course.findById(assignment.course);
        if (course.instructor !== req.auth.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this assignment' });
        }

        await assignment.remove();
        res.json({ message: 'Assignment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Submit an assignment
router.post('/:id/submit', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        if (assignment.status === 'closed') {
            return res.status(400).json({ message: 'Assignment is closed' });
        }

        const course = await Course.findById(assignment.course);
        const isEnrolled = course.enrolledStudents.some(student => student.studentId === req.auth.userId);
        if (!isEnrolled) {
            return res.status(403).json({ message: 'Not enrolled in this course' });
        }

        const existingSubmissionIndex = assignment.submissions.findIndex(
            sub => sub.studentId === req.auth.userId
        );

        const newSubmissionData = {
            studentId: req.auth.userId,
            ...req.body,
            submittedAt: new Date()
        };

        if (existingSubmissionIndex > -1) {
            // Update existing submission
            assignment.submissions[existingSubmissionIndex] = { ...assignment.submissions[existingSubmissionIndex], ...newSubmissionData };
        } else {
            // Add new submission
            assignment.submissions.push(newSubmissionData);
        }

        await assignment.save();
        res.json({ message: 'Assignment submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Grade an assignment submission
router.post('/:assignmentId/submissions/:submissionId/grade', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const course = await Course.findById(assignment.course);
        if (course.instructor !== req.auth.userId) {
            return res.status(403).json({ message: 'Not authorized to grade this assignment' });
        }

        const submission = assignment.submissions.id(req.params.submissionId);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        submission.mark = {
            grade: req.body.grade,
            feedback: req.body.feedback,
            gradedBy: req.auth.userId,
            gradedAt: new Date()
        };

        await assignment.save();
        res.json({ message: 'Submission graded successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get student's submissions
router.get('/student/submissions', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const submissions = await Assignment.find({
            'submissions.studentId': req.auth.userId
        }).select('title course submissions.$');
        
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 