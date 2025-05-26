// import React from 'react'
// import Hero from '../Components/Hero'
// import Companies from '../Components/Companies'
// import Testimonial from '../Components/Testimonial'
// import Learn from '../Components/Learn'
// import Introduction from '../Components/Introduction'

// const Home = () => {
//   return (
//     <div className='flex flex-col items-center space-y-7 text-center'>
//       <Hero />
//       <Introduction />
//       <Companies />
//       <Testimonial />
//       <Learn />
//     </div>
//   )
// }

// export default Home

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';

const Home = () => {
    const { user } = useUser();
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        // Fetch courses from your API
        const fetchCourses = async () => {
            try {
                const response = await fetch('/api/courses'); // Adjust the API endpoint as needed
                const data = await response.json();
                setCourses(data);
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };

        fetchCourses();
    }, []);

    return (
        <div className="flex flex-col items-center space-y-7 text-center">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-500 text-white p-10 rounded-lg shadow-lg">
                <h1 className="text-4xl font-bold">Welcome to EduVerse!</h1>
                <p className="mt-4 text-lg">Transform the way you learn with next-gen E-Learning!</p>
                <button className="mt-6 px-6 py-2 bg-white text-purple-600 rounded-full shadow-md hover:bg-gray-200">
                    {user ? "View Your Courses" : "Sign Up Now"}
                </button>
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                <div className="p-4 border rounded-lg shadow-md">
                    <h2 className="font-bold text-xl">Interactive Learning</h2>
                    <p>Engage with interactive content and quizzes to enhance your learning experience.</p>
                </div>
                <div className="p-4 border rounded-lg shadow-md">
                    <h2 className="font-bold text-xl">Expert Instructors</h2>
                    <p>Learn from industry experts and gain insights from their experiences.</p>
                </div>
                <div className="p-4 border rounded-lg shadow-md">
                    <h2 className="font-bold text-xl">Flexible Schedule</h2>
                    <p>Access courses anytime, anywhere, and learn at your own pace.</p>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="p-6">
                <h2 className="text-2xl font-bold">What Our Users Say</h2>
                <p className="mt-4 italic">"EduVerse has transformed my learning experience!" - Happy Student</p>
            </div>

            {/* Course Previews Section */}
            <div className="p-6">
                <h2 className="text-2xl font-bold">Featured Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    {courses.slice(0, 3).map(course => (
                        <div key={course._id} className="border rounded-lg p-4 shadow-md transition-transform transform hover:scale-105 hover:shadow-lg relative">
                            <img src={course.imageUrl} alt={course.title} className="w-full h-32 object-cover rounded-lg" />
                            <h3 className="font-bold text-lg mt-2">{course.title}</h3>
                            <p className="mt-2 text-gray-600">{course.description}</p>
                            <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors">
                                Enroll Now
                            </button>
                            <div className="absolute top-2 right-2 text-yellow-500">
                                {/* Example star rating */}
                                <span>⭐⭐⭐⭐⭐</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;