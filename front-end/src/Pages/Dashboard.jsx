import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
// import { AppContext } from '../context/AppContext'; // We will fetch enrolled courses directly

const Dashboard = () => {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCompletedLessons, setTotalCompletedLessons] = useState(0);
    const [overallAverageGrade, setOverallAverageGrade] = useState('N/A');

    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            if (!isLoaded || !user) {
                // Wait for user to be loaded
                return;
            }

            setLoading(true);
            try {
                const token = await getToken();

                const response = await fetch('/api/courses/enrolled', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch enrolled courses');
                }
                const data = await response.json();
                setEnrolledCourses(data);

                // Calculate total completed lessons
                const totalLessons = data.reduce((sum, course) => sum + course.completedLessons, 0);
                setTotalCompletedLessons(totalLessons);

                // Calculate overall average grade
                const gradedCourses = data.filter(course => course.averageGrade !== 'N/A');
                if (gradedCourses.length > 0) {
                    const totalGrades = gradedCourses.reduce((sum, course) => sum + course.averageGrade, 0);
                    setOverallAverageGrade((totalGrades / gradedCourses.length).toFixed(2) + '%');
                } else {
                    setOverallAverageGrade('N/A');
                }

            } catch (error) {
                console.error('Error fetching enrolled courses:', error);
                // Optionally set an error state to display a message to the user
            } finally {
                setLoading(false);
            }
        };

        fetchEnrolledCourses();

    }, [isLoaded, user, getToken]);

    if (loading || !isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Display a message if user is not signed in, although routes should handle this
    if (!user) {
        return (
             <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-red-600">Please sign in to view your dashboard.</h1>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Welcome, {user?.firstName || 'User'}!</h1>
            
            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-2">Enrolled Courses</h3>
                    <p className="text-3xl font-bold text-blue-600">{enrolledCourses.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-2">Completed Lessons</h3>
                    <p className="text-3xl font-bold text-green-600">{totalCompletedLessons}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-2">Average Grade</h3>
                    <p className="text-3xl font-bold text-purple-600">{overallAverageGrade}</p>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
                <div className="space-y-4">
                    {/* Activity items will be mapped here */}
                    <p className="text-gray-500">No recent activity</p>
                </div>
            </div>

            {/* Enrolled Courses */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-2xl font-bold">Your Courses</h2>
                      {/* Conditionally render Create New Course button based on user role */}
                      {isLoaded && user && user.publicMetadata && user.publicMetadata.role === 'instructor' && (
                        <Link 
                            to="/create-course"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Create New Course
                        </Link>
                     )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledCourses.length > 0 ? (
                        enrolledCourses.map(course => (
                            <Link 
                                key={course._id} 
                                to={`/course/${course._id}`}
                                className="block bg-gray-50 rounded-lg p-4 hover:shadow-lg transition-shadow"
                            >
                                <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                                <p className="text-gray-600 mb-4">{course.description.substring(0, 100)}...</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">
                                        Progress: {course.totalLessons > 0 ? Math.round((course.completedLessons / course.totalLessons) * 100) : 0}%
                                    </span>
                                    {course.averageGrade !== 'N/A' && (
                                         <span className="text-sm text-gray-500">
                                            Grade: {course.averageGrade}%
                                        </span>
                                    )}
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                        Continue Learning
                                    </button>
                                </div>
                            </Link>
                        ))
                    ) : (
                         <div className="text-center py-4 md:col-span-3">
                            <p className="text-gray-500">You are not enrolled in any courses yet.</p>
                             {isLoaded && user && (
                                <Link to="/courses" className="text-blue-600 hover:underline mt-2 inline-block">Browse available courses</Link>
                             )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 