import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { Link } from 'react-router-dom'; // Import Link for navigation

// Define static courses data (Same as in AllCourses.jsx)
const staticCourses = [
  {
        _id: 'static-course-1',
        title: 'Introduction to React',
        description: 'Learn the fundamentals of React.js for building modern user interfaces.',
        imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        category: 'Web Development',
        level: 'beginner',
    },
    {
        _id: 'static-course-2',
        title: 'Node.js for Beginners',
        description: 'Get started with backend development using Node.js and Express.',
        imageUrl: 'https://images.unsplash.com/photo-1616251100426-c22206d63455?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        category: 'Backend Development',
        level: 'beginner',
  },
  {
        _id: 'static-course-3',
        title: 'Data Structures and Algorithms',
        description: 'Master essential data structures and algorithms for problem-solving.',
        imageUrl: 'https://images.unsplash.com/photo-1507149824380-b676da9ed57?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        category: 'Computer Science',
        level: 'intermediate',
  },
  {
        _id: 'static-course-4',
        title: 'Python for Data Science',
        description: 'Learn Python and its libraries for data analysis, visualization, and machine learning.',
        imageUrl: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG00b3RvLXBhZ2V8fHx8ZW58MHx8fHx8A%3D%3D',
        category: 'Data Science',
        level: 'intermediate',
  },
  {
        _id: 'static-course-5',
        title: 'Digital Marketing Fundamentals',
        description: 'Understand the core concepts of digital marketing, SEO, and social media.',
        imageUrl: 'https://images.unsplash.com/photo-1557835312-d8d57e3e1168?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        category: 'Marketing',
        level: 'beginner',
    },
    {
        _id: 'static-course-6',
        title: 'Introduction to UI/UX Design',
        description: 'Learn the principles of user interface and user experience design.',
        imageUrl: 'https://images.unsplash.com/photo-1628139933519-d9c141044975?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        category: 'Design',
        level: 'beginner',
  },
  {
         _id: 'static-course-7',
         title: 'Cloud Computing with AWS',
         description: 'Explore the basics of cloud computing and Amazon Web Services.',
         imageUrl: 'https://images.unsplash.com/photo-1518770660439-4068ff8cc614?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
         category: 'Cloud Computing',
         level: 'intermediate',
  },
  {
         _id: 'static-course-8',
         title: 'Cybersecurity Essentials',
         description: 'Learn fundamental concepts and practices in cybersecurity.',
         imageUrl: 'https://images.unsplash.com/photo-1534972195860-c1fa87b01cdc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
         category: 'Cybersecurity',
         level: 'beginner',
  },
  {
         _id: 'static-course-9',
         title: 'Mobile App Development with React Native',
         description: 'Build cross-platform mobile applications using React Native.',
         imageUrl: 'https://images.unsplash.com/photo-1587620964481-9c1c9c879e58?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
         category: 'Mobile Development',
         level: 'intermediate',
     },
     {
         _id: 'static-course-10',
         title: 'Artificial Intelligence Concepts',
         description: 'An introduction to the core concepts and applications of AI.',
         imageUrl: 'https://images.unsplash.com/photo-1518458026617-969a0a70c22f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
         category: 'Artificial Intelligence',
         level: 'advanced',
     }
];

const Course = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('/api/courses'); // Fetch courses from backend
                if (!response.ok) {
                    throw new Error('Failed to fetch courses');
                }
                const data = await response.json();
                // Combine fetched courses with static courses (dynamic first)
                setCourses([...data, ...staticCourses]);
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
