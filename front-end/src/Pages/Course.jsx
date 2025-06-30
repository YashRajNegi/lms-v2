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
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-red-600">{error}</h1>
            </div>
        );
    }

  return (
        <div className='flex flex-col items-center justify-center md:pb-16 pb-12 pt-6' style={{ backgroundImage: `url(${assets.BG_Course})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <h1 className='md:text-4xl text-3xl text-blue-700 font-extrabold underline md:underline-offset-10 underline-offset-6 md:mb-8 mb-5'>All Courses</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 w-full max-w-screen-xl mx-auto">
                {courses.length > 0 ? (
                    courses.map((course) => (
                        <Link
                            key={course._id} // Use MongoDB _id as the key
                            to={`/course/${course._id}`} // Link to CourseDetail page
            className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
          >
                            {/* Course Image */}
                            {course.imageUrl ? (
                                <img 
                                    src={course.imageUrl}
                                    alt={`Cover image for ${course.title}`}
                                    className="w-full h-40 object-cover rounded-t-lg" // Added rounded-t-lg for top corners
                                />
            ) : (
                                // Placeholder if no imageUrl is provided
                                <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-semibold rounded-t-lg">
                                    No Image Available
                                </div>
                            )}

                            <div className="text-start py-4 px-5 flex flex-col flex-grow">
              <h1 className="text-xl font-semibold text-gray-800 mb-1">{course.title}</h1>
              <p className="text-sm text-gray-500 mb-2">{course.category}</p>
                                <p className="text-sm text-gray-500 mb-4">Level: {course.level}</p>
                                {/* Instructor name would go here - requires backend route to populate instructor */}
                                {/* <p className="text-gray-700 text-sm mb-4">Instructor: {course.instructor?.firstName} {course.instructor?.lastName}</p> */}
                                {/* <p className="text-gray-700 text-sm mt-4">Skills you'll gain: ...</p> */}
                                {/* <div className="flex items-center mt-2">Rating: ...</div> */}
                                {/* <p className="text-gray-700 text-sm mt-2">Duration: ...</p> */}
                                <p className="text-gray-600 text-sm flex-grow">{course.description.substring(0, 150)}{course.description.length > 150 ? '...' : ''}</p>
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
