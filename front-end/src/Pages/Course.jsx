import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { Link } from 'react-router-dom'; // Import Link for navigation

const Course = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL;
                const response = await fetch(`${apiUrl}/api/courses`);
                if (!response.ok) {
                    throw new Error('Failed to fetch courses');
                }
                const data = await response.json();
                setCourses(data);
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('Failed to load courses.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []); // Empty dependency array means this runs once on mount

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen px-2 sm:px-4">
                <div className="animate-spin rounded-full h-24 w-24 sm:h-32 sm:w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-2 sm:px-4 py-8">
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-red-600">{error}</h1>
            </div>
        );
    }

  return (
        <div className='flex flex-col items-center justify-center md:pb-16 pb-12 pt-6 px-2 sm:px-4' style={{ backgroundImage: `url(${assets.BG_Course})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <h1 className='text-2xl sm:text-3xl md:text-4xl text-blue-700 font-extrabold underline md:underline-offset-10 underline-offset-6 md:mb-8 mb-5 text-center'>All Courses</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-2 sm:p-4 w-full max-w-screen-xl mx-auto">
                {courses.length > 0 ? (
                    courses.map((course) => (
                        <Link
                            key={course._id}
                            to={`/course/${course._id}`}
                            className="max-w-sm w-full bg-white border border-gray-200 rounded-xl shadow-md hover:scale-105 transition-transform duration-300 flex flex-col h-[420px] sm:h-[440px] mx-auto"
                        >
                            {/* Course Image */}
                            {course.imageUrl ? (
                                <img 
                                    src={course.imageUrl}
                                    alt={`Cover image for ${course.title}`}
                                    className="w-full h-40 sm:h-48 object-cover rounded-t-xl"
                                />
                            ) : (
                                <div className="w-full h-40 sm:h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-semibold rounded-t-xl">
                                    No Image Available
                                </div>
                            )}

                            <div className="flex flex-col flex-grow justify-between py-4 px-3 sm:px-5 h-full">
                                <div>
                                    <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-1">{course.title}</h1>
                                    <p className="text-xs sm:text-sm md:text-base text-gray-500 mb-2">{course.category}</p>
                                    <p className="text-xs sm:text-sm md:text-base text-gray-500 mb-4">Level: {course.level}</p>
                                </div>
                                <p className="text-gray-600 text-xs sm:text-sm md:text-base flex-grow overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'}}>{course.description.substring(0, 150)}{course.description.length > 150 ? '...' : ''}</p>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No courses available at the moment.</p>
                    </div>
                )}
            </div>
        </div>
  );
};

export default Course;
