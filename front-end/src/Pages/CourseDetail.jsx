import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { AppContext } from '../context/AppContext';

const CourseDetail = () => {
    const { courseId } = useParams();
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const { courses } = useContext(AppContext);
    const [course, setCourse] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [progress, setProgress] = useState(0);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [showCertificate, setShowCertificate] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // State for adding new lessons
    const [showAddLessonForm, setShowAddLessonForm] = useState(false);
    const [newLessonTitle, setNewLessonTitle] = useState('');
    const [newLessonContent, setNewLessonContent] = useState('');
    const [newLessonDuration, setNewLessonDuration] = useState('30'); // Default duration
    const [isAddingLesson, setIsAddingLesson] = useState(false);

    // State for editing lessons
    const [showEditLessonModal, setShowEditLessonModal] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [editLessonTitle, setEditLessonTitle] = useState('');
    const [editLessonContent, setEditLessonContent] = useState('');
    const [editLessonDuration, setEditLessonDuration] = useState(30);
    const [editLessonContentType, setEditLessonContentType] = useState('text');
    const [editLessonVideoUrl, setEditLessonVideoUrl] = useState('');
    const [isSavingLesson, setIsSavingLesson] = useState(false);

    // State for adding new lessons with video support
    const [newLessonContentType, setNewLessonContentType] = useState('text'); // 'text' or 'video'
    const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('');

    // Add state for completion date fetched from backend
    const [completionDate, setCompletionDate] = useState(null);

    const certificateRef = useRef(null);

    // Simple notification function
    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await fetch(`/api/courses/${courseId}`);
                const data = await response.json();
                setCourse(data);

                // Check if the user is already enrolled and get progress and completion date
                if (isLoaded && user && data.enrolledStudents) {
                    const studentEnrollment = data.enrolledStudents.find(
                        (student) => student.studentId === user.id
                    );
                    if (studentEnrollment) {
                        setIsEnrolled(true);
                        setProgress(studentEnrollment.progress);
                        setCompletedLessons(studentEnrollment.completedLessons || []);
                         // Set completion date from fetched data
                        setCompletionDate(studentEnrollment.completionDate ? new Date(studentEnrollment.completionDate) : null);
                    }
                }

                if (data.lessons && data.lessons.length > 0) {
                    setSelectedLesson(data.lessons[0]);
                }
            } catch (error) {
                console.error('Error fetching course:', error);
                showNotification('Failed to load course details', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId, isLoaded, user]);

    const handleEnroll = async () => {
        if (!isLoaded || !user) {
            showNotification('Please sign in to enroll in a course', 'error');
            return;
        }

        setIsEnrolling(true);

        try {
            const token = await getToken();

            const response = await fetch(`/api/courses/${courseId}/enroll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Failed to enroll in course');
            }

            showNotification('Successfully enrolled in course!');
            setIsEnrolled(true);
            setProgress(0);
            setCompletedLessons([]);

        } catch (err) {
            console.error('Enrollment error:', err);
            showNotification(err.message, 'error');
        } finally {
            setIsEnrolling(false);
        }
    };

    const handleLessonComplete = async (lessonId) => {
        if (!isEnrolled) return;

        try {
            const token = await getToken();
            const response = await fetch(`/api/courses/${courseId}/progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ lessonId }),
            });

            if (response.ok) {
                setCompletedLessons([...completedLessons, lessonId]);
                const newProgress = ((completedLessons.length + 1) / course.lessons.length) * 100;
                setProgress(newProgress);
                showNotification('Lesson marked as complete!');
                
                // Check if course is completed
                if (newProgress === 100) {
                    setCompletionDate(new Date()); // Set frontend state as well
                    showNotification('Congratulations! You have completed the course!');
                }
            }
        } catch (error) {
            console.error('Error updating progress:', error);
            showNotification('Failed to update lesson progress', 'error');
        }
    };

    // Handle certificate download
    const handleDownloadCertificate = async () => {
        if (!isLoaded || !user) {
            showNotification('Please sign in to download the certificate.', 'error');
            return;
        }
        if (!courseId || !isEnrolled || progress !== 100 || completionDate === null) {
            showNotification('Course not completed or enrollment status not clear.', 'error');
            return;
        }

        try {
            // Import required libraries dynamically
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = await import('jspdf');
            
            // Create a temporary div for PDF generation
            const tempDiv = document.createElement('div');
            tempDiv.style.width = '800px';
            tempDiv.style.padding = '40px';
            tempDiv.style.backgroundColor = '#ffffff';
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '-9999px';
            
            // Add certificate content with basic styling
            tempDiv.innerHTML = `
                <div style="text-align: center; font-family: Arial, sans-serif; background: linear-gradient(135deg, #f6f8fa 0%, #ffffff 100%); padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <div style="border: 2px solid #e2e8f0; padding: 30px; border-radius: 8px; background-color: white;">
                        <h1 style="font-size: 36px; color: #2563eb; margin-bottom: 20px; font-weight: bold;">Certificate of Completion</h1>
                        <p style="font-size: 18px; color: #4b5563; margin-bottom: 30px;">
                            This is to certify that
                        </p>
                        <h2 style="font-size: 28px; color: #1e40af; margin-bottom: 20px; font-weight: bold;">
                            ${user?.fullName || user?.username || 'Student'}
                        </h2>
                        <p style="font-size: 18px; color: #4b5563; margin-bottom: 30px;">
                            has successfully completed the course
                        </p>
                        <h3 style="font-size: 24px; color: #1e40af; margin-bottom: 30px; font-weight: bold;">
                            "${course?.title}"
                        </h3>
                        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                            <p style="font-size: 16px; color: #4b5563; margin: 0;">
                                Completion Rate: <span style="color: #059669; font-weight: bold;">${Math.round(progress)}%</span>
                            </p>
                        </div>
                        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
                            <p style="font-size: 16px; color: #4b5563;">
                                Issued on <span style="color: #1e40af; font-weight: bold;">${new Date(completionDate).toLocaleDateString()}</span>
                            </p>
                        </div>
                    </div>
                </div>
            `;
            
            // Add to document temporarily
            document.body.appendChild(tempDiv);

            // Generate canvas from the temporary div
            const canvas = await html2canvas(tempDiv, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
            });

            // Remove temporary div
            document.body.removeChild(tempDiv);

            // Calculate dimensions to fit on A4
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Create PDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // Add the image to the PDF
            pdf.addImage(
                canvas.toDataURL('image/png'),
                'PNG',
                0,
                0,
                imgWidth,
                imgHeight
            );

            // Save the PDF
            pdf.save(`${course?.title || 'certificate'}-${user?.fullName || 'student'}.pdf`);
            
            showNotification('Certificate downloaded successfully!', 'success');

        } catch (error) {
            console.error('Error generating certificate:', error);
            showNotification('Failed to generate certificate', 'error');
        }
    };

    // Handle adding a new lesson
    const handleAddLesson = async (e) => {
        e.preventDefault();

        // Update validation: either title and content (text) OR title and videoUrl (video) are required
        if (!newLessonTitle || (newLessonContentType === 'text' && !newLessonContent) || (newLessonContentType === 'video' && !newLessonVideoUrl)) {
            showNotification(`Lesson title and ${newLessonContentType === 'text' ? 'content' : 'video URL'} are required.`, 'error');
            return;
        }

        setIsAddingLesson(true);

        try {
            const token = await getToken();
            const response = await fetch(`/api/courses/${courseId}/lessons`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: newLessonTitle,
                    content: newLessonContentType === 'text' ? newLessonContent : '', // Send content only for text type
                    duration: parseInt(newLessonDuration, 10) || 30,
                    contentType: newLessonContentType, // Include content type
                    videoUrl: newLessonContentType === 'video' ? newLessonVideoUrl : '', // Include video URL only for video type
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add lesson');
            }

            const addedLesson = await response.json();

            // Update the course state with the new lesson
            setCourse(prevCourse => ({
                ...prevCourse,
                lessons: [...prevCourse.lessons, addedLesson]
            }));

            showNotification('Lesson added successfully!');
            // Clear the form and hide it
            setNewLessonTitle('');
            setNewLessonContent('');
            setNewLessonDuration('30');
            setNewLessonContentType('text'); // Reset content type
            setNewLessonVideoUrl(''); // Clear video URL
            setShowAddLessonForm(false);

        } catch (error) {
            console.error('Error adding lesson:', error);
            showNotification(error.message, 'error');
        } finally {
            setIsAddingLesson(false);
        }
    };

    // Handle deleting a lesson
    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm('Are you sure you want to delete this lesson?')) {
            return;
        }

        try {
            const token = await getToken();
            const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Failed to delete lesson');
            }

            // Remove the deleted lesson from the state
            setCourse(prevCourse => ({
                ...prevCourse,
                lessons: prevCourse.lessons.filter(lesson => lesson._id !== lessonId)
            }));

            showNotification('Lesson deleted successfully!');
            // If the selected lesson was deleted, clear the selection
            if (selectedLesson?._id === lessonId) {
                 setSelectedLesson(null);
            }

        } catch (error) {
            console.error('Error deleting lesson:', error);
            showNotification(error.message, 'error');
        }
    };

    // Handle clicking the Edit Lesson button
    const handleEditLessonClick = (lesson) => {
        setEditingLesson(lesson);
        setEditLessonTitle(lesson.title);
        // Set content/video URL based on type
        if (lesson.content.type === 'text') {
             setEditLessonContentType('text');
             setEditLessonContent(lesson.content.text.content || '');
             setEditLessonVideoUrl('');
        } else if (lesson.content.type === 'video') {
             setEditLessonContentType('video');
             setEditLessonVideoUrl(lesson.content.video.url || '');
             setEditLessonContent('');
        } else {
             // Default for other types or if type is missing (shouldn't happen with validation)
             setEditLessonContentType('text');
             setEditLessonContent(lesson.content || ''); // Fallback to old structure if necessary
             setEditLessonVideoUrl('');
        }
        setEditLessonDuration(lesson.duration || 30);
        setShowEditLessonModal(true);
    };

    // Handle saving the edited lesson
    const handleSaveLesson = async (e) => {
        e.preventDefault();

        if (!editingLesson) return; // Should not happen if modal is shown correctly

        // Basic validation
        if (!editLessonTitle || (editLessonContentType === 'text' && !editLessonContent) || (editLessonContentType === 'video' && !editLessonVideoUrl)) {
             showNotification(`Lesson title and ${editLessonContentType === 'text' ? 'content' : 'video URL'} are required.`, 'error');
             return;
        }

        setIsSavingLesson(true);

        try {
            const token = await getToken();
            const updatedLessonData = {
                title: editLessonTitle.trim(),
                duration: parseInt(editLessonDuration, 10) || 30,
                contentType: editLessonContentType,
                // Construct content object based on type
                content: {
                    type: editLessonContentType,
                    text: editLessonContentType === 'text' ? { content: editLessonContent.trim() } : undefined,
                    video: editLessonContentType === 'video' ? { url: editLessonVideoUrl.trim(), duration: parseInt(editLessonDuration, 10) || 30 } : undefined,
                    // Add other content types here if needed
                },
            };

            const response = await fetch(`/api/courses/${courseId}/lessons/${editingLesson._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updatedLessonData),
            });

            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Failed to save lesson changes');
            }

            const updatedLesson = await response.json();

            // Update the course state with the updated lesson
            setCourse(prevCourse => ({
                ...prevCourse,
                lessons: prevCourse.lessons.map(lesson => 
                    lesson._id === updatedLesson._id ? updatedLesson : lesson
                )
            }));

            showNotification('Lesson updated successfully!');
            setShowEditLessonModal(false); // Close modal on success
            setEditingLesson(null); // Clear editing state

        } catch (error) {
             console.error('Error saving lesson:', error);
             showNotification(error.message, 'error');
        } finally {
             setIsSavingLesson(false);
        }
    };

    // Handle deleting the course
    const handleDeleteCourse = async () => {
        if (!window.confirm('Are you sure you want to delete this entire course? This action cannot be undone.')) {
            return;
        }

        try {
            const token = await getToken();
            const response = await fetch(`/api/courses/${courseId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Failed to delete course');
            }

            showNotification('Course deleted successfully!');
            // Redirect to dashboard or course list after deletion
            // You might want to import useHistory or useNavigate from react-router-dom
            // history.push('/dashboard'); or navigate('/courses');
            // For now, just a simple alert and stay on page (will likely show Course not found)
            alert('Course deleted. Redirecting...');
            // TODO: Implement actual redirection

        } catch (error) {
             console.error('Error deleting course:', error);
             showNotification(error.message, 'error');
        }
    };

    const calculateCourseDuration = () => {
        if (!course?.lessons) return '0 hours';
        const totalMinutes = course.lessons.reduce((acc, lesson) => acc + (lesson.duration || 30), 0);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes}m`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-red-600">Course not found</h1>
            </div>
        );
    }

    // Check if the logged-in user is the instructor of this course
    const isInstructor = isLoaded && user && course && user.id === course.instructor;

    // Determine if the current lesson is the last one
    const isLastLesson = selectedLesson && course?.lessons && course.lessons.length > 0 && 
                         course.lessons.indexOf(selectedLesson) === course.lessons.length - 1;

    // Determine if the course is completed (check both progress and completionDate)
    const isCourseCompleted = isEnrolled && progress === 100 && completionDate !== null;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Notification */}
            {notification.show && (
                <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
                    notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                } text-white`}>
                    {notification.message}
                </div>
            )}

            {/* Course Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold mb-4">{course?.title}</h1>
                        <p className="text-gray-600 mb-4">{course?.description}</p>
                        
                        {/* Instructor Information */}
                        {course?.instructorDetails && (
                            <div className="flex items-center mb-4">
                                {course.instructorDetails.imageUrl && (
                                    <img 
                                        src={course.instructorDetails.imageUrl}
                                        alt={`${course.instructorDetails.fullName} profile`} 
                                        className="w-10 h-10 rounded-full mr-3"
                                    />
                                )}
                                <div>
                                    <p className="text-sm text-gray-500">Instructor:</p>
                                    <p className="font-semibold">{course.instructorDetails.fullName}</p>
                                </div>
                            </div>
                        )}
                        
                        {/* Course Metadata */}
                        <div className="flex gap-4 mb-4 text-sm text-gray-600">
                            <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {calculateCourseDuration()}
                            </span>
                            <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {course?.level}
                            </span>
                            <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                {course?.category}
                            </span>
                        </div>

                        {/* Course Overview */}
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold mb-2">Course Overview</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-medium mb-2">What you'll learn</h3>
                                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                                        {course?.objectives?.map((objective, index) => (
                                            <li key={index}>{objective}</li>
                                        )) || <li>Course objectives will be added soon</li>}
                                    </ul>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-medium mb-2">Prerequisites</h3>
                                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                                        {course?.prerequisites?.map((prereq, index) => (
                                            <li key={index}>{prereq}</li>
                                        )) || <li>No prerequisites required</li>}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar (if enrolled) */}
                        {isEnrolled && (
                            <div className="mb-4">
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Course Progress</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <Link
                            to={`/course/${courseId}/discussions`}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            View Discussions
                        </Link>
                        {/* Enroll Button */}
                        {isLoaded && user && !isEnrolled && (
                            <button
                                onClick={handleEnroll}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                                disabled={isEnrolling}
                            >
                                {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                            </button>
                        )}
                        {/* Message if already enrolled */}
                        {isLoaded && user && isEnrolled && (
                            <div className="flex items-center gap-4">
                                <span className="text-green-600 font-semibold flex items-center">
                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Enrolled
                                </span>
                                {isCourseCompleted && ( // Use isCourseCompleted check
                                    <button
                                        onClick={() => setShowCertificate(true)}
                                        className="text-blue-600 hover:text-blue-700 flex items-center"
                                    >
                                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        View Certificate
                                    </button>
                                )}
                            </div>
                        )}
                        {/* Message if not logged in */}
                        {(!isLoaded || !user) && (
                            <span className="text-sm text-gray-500">Sign in to Enroll</span>
                        )}
                    </div>
                </div>

                {/* Add Lesson Button (Instructor Only) */}
                {isInstructor && (
                    <button 
                        onClick={() => setShowAddLessonForm(true)}
                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 mt-4 mr-4"
                    >
                        Add New Lesson
                    </button>
                )}

                {/* Delete Course Button (Instructor Only) */}
                {isInstructor && (
                    <button
                        onClick={handleDeleteCourse}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mt-4"
                    >
                        Delete Course
                    </button>
                )}
            </div>
            
            {/* Add Lesson Form Modal (Instructor Only) */}
            {isInstructor && showAddLessonForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">Add New Lesson</h2>
                        <form onSubmit={handleAddLesson}>
                            <div className="mb-4">
                                <label htmlFor="lessonTitle" className="block text-gray-700 font-semibold mb-2">Lesson Title</label>
                                <input 
                                    type="text"
                                    id="lessonTitle"
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    value={newLessonTitle}
                                    onChange={(e) => setNewLessonTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">Content Type</label>
                                <div className="flex items-center gap-4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            value="text"
                                            checked={newLessonContentType === 'text'}
                                            onChange={() => setNewLessonContentType('text')}
                                            className="form-radio text-blue-600"
                                        />
                                        <span className="ml-2">Text</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            value="video"
                                            checked={newLessonContentType === 'video'}
                                            onChange={() => setNewLessonContentType('video')}
                                            className="form-radio text-blue-600"
                                        />
                                        <span className="ml-2">Video</span>
                                    </label>
                                </div>
                            </div>
                            {newLessonContentType === 'text' ? (
                                <div className="mb-4">
                                    <label htmlFor="lessonContent" className="block text-gray-700 font-semibold mb-2">Content</label>
                                    <textarea
                                        id="lessonContent"
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 h-32"
                                        value={newLessonContent}
                                        onChange={(e) => setNewLessonContent(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                            ) : (
                                <div className="mb-4">
                                    <label htmlFor="lessonVideoUrl" className="block text-gray-700 font-semibold mb-2">Video URL</label>
                                    <input
                                        type="url"
                                        id="lessonVideoUrl"
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        value={newLessonVideoUrl}
                                        onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                            <div className="mb-4">
                                <label htmlFor="lessonDuration" className="block text-gray-700 font-semibold mb-2">Duration (minutes)</label>
                                <input 
                                    type="number"
                                    id="lessonDuration"
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    value={newLessonDuration}
                                    onChange={(e) => setNewLessonDuration(e.target.value)}
                                    min="1"
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowAddLessonForm(false)}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                                    disabled={isAddingLesson}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    disabled={isAddingLesson}
                                >
                                    {isAddingLesson ? 'Adding...' : 'Add Lesson'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Lesson Modal (Instructor Only) */}
            {isInstructor && showEditLessonModal && editingLesson && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">Edit Lesson</h2>
                        <form onSubmit={handleSaveLesson}>
                            <div className="mb-4">
                                <label htmlFor="editLessonTitle" className="block text-gray-700 font-semibold mb-2">Lesson Title</label>
                                <input 
                                    type="text"
                                    id="editLessonTitle"
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    value={editLessonTitle}
                                    onChange={(e) => setEditLessonTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">Content Type</label>
                                <div className="flex items-center gap-4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            value="text"
                                            checked={editLessonContentType === 'text'}
                                            onChange={() => setEditLessonContentType('text')}
                                            className="form-radio text-blue-600"
                                        />
                                        <span className="ml-2">Text</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            value="video"
                                            checked={editLessonContentType === 'video'}
                                            onChange={() => setEditLessonContentType('video')}
                                            className="form-radio text-blue-600"
                                        />
                                        <span className="ml-2">Video</span>
                                    </label>
                                </div>
                            </div>
                            {editLessonContentType === 'text' ? (
                                <div className="mb-4">
                                    <label htmlFor="editLessonContent" className="block text-gray-700 font-semibold mb-2">Content</label>
                                    <textarea
                                        id="editLessonContent"
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 h-32"
                                        value={editLessonContent}
                                        onChange={(e) => setEditLessonContent(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                            ) : (
                                <div className="mb-4">
                                    <label htmlFor="editLessonVideoUrl" className="block text-gray-700 font-semibold mb-2">Video URL</label>
                                    <input
                                        type="url"
                                        id="editLessonVideoUrl"
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        value={editLessonVideoUrl}
                                        onChange={(e) => setEditLessonVideoUrl(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                            <div className="mb-4">
                                <label htmlFor="editLessonDuration" className="block text-gray-700 font-semibold mb-2">Duration (minutes)</label>
                                <input 
                                    type="number"
                                    id="editLessonDuration"
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    value={editLessonDuration}
                                    onChange={(e) => setEditLessonDuration(parseInt(e.target.value, 10) || 0)}
                                    min="0"
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button 
                                    type="button"
                                    onClick={() => { setShowEditLessonModal(false); setEditingLesson(null); }}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                                    disabled={isSavingLesson}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    disabled={isSavingLesson}
                                >
                                    {isSavingLesson ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Course Content Sidebar */}
                <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-xl font-bold mb-4">Course Content</h2>
                    <div className="space-y-2">
                        {course.lessons?.map((lesson, index) => (
                            <div
                                key={lesson._id}
                                onClick={() => setSelectedLesson(lesson)}
                                className={`w-full text-left p-3 rounded-lg cursor-pointer transition-colors ${
                                    selectedLesson?._id === lesson._id
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'hover:bg-gray-100'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="font-medium">Lesson {index + 1}:</span> {lesson.title}
                                        {/* Display duration based on the new nested structure */}
                                        {lesson.content && lesson.content.type === 'video' && lesson.content.video && typeof lesson.content.video.duration === 'number' ? (
                                             <span className="text-sm text-gray-500 ml-2">
                                                ({Math.floor(lesson.content.video.duration / 60)}h {lesson.content.video.duration % 60}m)
                                            </span>
                                        ) : lesson.duration ? (
                                            // Fallback for old lessons or if duration is stored directly
                                            <span className="text-sm text-gray-500 ml-2">
                                                ({Math.floor(lesson.duration / 60)}h {lesson.duration % 60}m)
                                            </span>
                                        ) : null}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isEnrolled && completedLessons.includes(lesson._id) && (
                                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                        {/* Instructor Controls */}
                                        {isInstructor && (
                                            <>
                                                {/* Edit Icon */}
                                                <button
                                                    className="text-gray-500 hover:text-blue-600 p-1 rounded"
                                                    onClick={(e) => { e.stopPropagation(); handleEditLessonClick(lesson); }}
                                                    title="Edit Lesson"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                </button>
                                                {/* Delete Icon */}
                                                <button
                                                    className="text-gray-500 hover:text-red-600 p-1 rounded"
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson._id); }}
                                                    title="Delete Lesson"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                    </svg>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    {selectedLesson ? (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h1 className="text-3xl font-bold mb-4">{selectedLesson.title}</h1>
                            {/* Conditional Rendering for Text or Video Content */}
                            {selectedLesson.content && selectedLesson.content.type === 'video' && selectedLesson.content.video && selectedLesson.content.video.url ? (
                                <div className="mb-4 aspect-video">
                                     {/* Use an iframe for YouTube videos for better compatibility */}
                                     <iframe
                                        width="100%"
                                        height="100%"
                                        // Improved logic to handle different YouTube URL formats
                                        src={selectedLesson.content.video.url ? 
                                                (selectedLesson.content.video.url.includes('youtu.be/') ? 
                                                    `https://www.youtube.com/embed/${selectedLesson.content.video.url.split('youtu.be/')[1].split(/[?#]/)[0]}?rel=0` : 
                                                    `https://www.youtube.com/embed/${selectedLesson.content.video.url.split('watch?v=')[1].split(/[&?#]/)[0]}?rel=0`)
                                                : '' // Fallback to empty string if no URL
                                        }
                                        title={selectedLesson.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        className="rounded-lg"
                                    ></iframe>
                                </div>
                            ) : selectedLesson.content && selectedLesson.content.type === 'text' && selectedLesson.content.text && selectedLesson.content.text.content ? (
                                <div className="prose max-w-none">
                                    {/* Render HTML content if format is html, otherwise plain text or markdown (requires a library) */}
                                    {selectedLesson.content.text.format === 'html' ? (
                                         <div dangerouslySetInnerHTML={{ __html: selectedLesson.content.text.content }}></div>
                                    ) : (
                                        <p>{selectedLesson.content.text.content}</p> // Basic rendering for plain text/markdown
                                    )}
                                </div>
                            ) : (
                                 <div className="prose max-w-none text-gray-500 italic">
                                     <p>No content available for this lesson.</p>
                                 </div>
                            )}
                            
                            {/* Lesson Navigation and Completion */}
                            <div className="mt-8 flex justify-between items-center">
                                <button
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                                    onClick={() => {
                                        const currentIndex = course.lessons.findIndex(
                                            lesson => lesson._id === selectedLesson._id
                                        );
                                        if (currentIndex > 0) {
                                            setSelectedLesson(course.lessons[currentIndex - 1]);
                                        }
                                    }}
                                    disabled={course.lessons.indexOf(selectedLesson) === 0}
                                >
                                    Previous Lesson
                                </button>

                                {isEnrolled && !completedLessons.includes(selectedLesson._id) && (
                                    <button
                                        onClick={() => handleLessonComplete(selectedLesson._id)}
                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                    >
                                        Mark as Complete
                                    </button>
                                )}

                                {!isLastLesson && (
                                    <button
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                        onClick={() => {
                                            const currentIndex = course.lessons.findIndex(
                                                lesson => lesson._id === selectedLesson._id
                                            );
                                            if (currentIndex < course.lessons.length - 1) {
                                                setSelectedLesson(course.lessons[currentIndex + 1]);
                                            }
                                        }}
                                    >
                                        Next Lesson
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h1 className="text-2xl font-bold text-gray-600">Select a lesson to begin</h1>
                        </div>
                    )}
                </div>
            </div>

            {/* Certificate Modal */}
            {showCertificate && course && user && completionDate && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
                        <div className="text-center" ref={certificateRef}>
                            <h2 className="text-3xl font-bold mb-4 text-gray-800">Course Completion Certificate</h2>
                            <p className="text-gray-600 mb-6">
                                This is to certify that {user?.fullName} has successfully completed the course
                                "{course.title}" with a completion rate of {Math.round(progress)}%.
                            </p>
                            <div className="border-2 border-gray-300 p-6 rounded-lg mb-6 bg-white">
                                <div className="text-4xl font-bold text-blue-600 mb-4">Certificate of Completion</div>
                                <div className="text-xl mb-2 text-gray-800">{user?.fullName || user?.username || 'Student'}</div>
                                <div className="text-gray-600 mb-4">has successfully completed</div>
                                <div className="text-2xl font-semibold mb-4 text-gray-800">{course.title}</div>
                                <div className="text-gray-600">Issued on {new Date(completionDate).toLocaleDateString()}</div>
                            </div>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={handleDownloadCertificate}
                                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                                >
                                    Download Certificate
                                </button>
                                <button
                                    onClick={() => setShowCertificate(false)}
                                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDetail; 