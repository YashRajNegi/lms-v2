import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

// Define static courses data
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

const AllCourses = () => {
    const { user, isLoaded } = useUser();
    const location = useLocation(); // Get location object to access URL
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // State for search input

    // Read search term from URL query parameter on component mount
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const initialSearchTerm = params.get('search') || '';
        setSearchTerm(initialSearchTerm);
    }, [location.search]); // Re-run when the URL search string changes

    useEffect(() => {
        const fetchAllCourses = async () => {
            setLoading(true);
            try {
                const response = await fetch(import.meta.env.VITE_API_URL + '/api/courses'); // Fetch all courses
                if (!response.ok) {
                    throw new Error('Failed to fetch courses');
                }
                const data = await response.json();
                // Combine fetched courses with static courses (dynamic first)
                setAllCourses([...data, ...staticCourses]);
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('Failed to load courses.');
            } finally {
                setLoading(false);
            }
        };

        // Only fetch courses once on initial mount, the filtering happens separately
        if (allCourses.length === 0) { // Prevent refetching when only search term changes
            fetchAllCourses();
        }
    }, [allCourses.length]); // Dependency on allCourses.length to fetch only once initially

    const handleEnroll = async (courseId) => {
        if (!isLoaded || !user) {
            alert('Please sign in to enroll in a course.');
            return;
        }

        // Optimistically update UI
        setAllCourses(prevCourses =>
            prevCourses.map(course =>
                course._id === courseId ? { ...course, isEnrolling: true } : course
            )
        );

        try {
            const response = await fetch(import.meta.env.VITE_API_URL + `/api/courses/${courseId}/enroll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Failed to enroll in course');
            }

            alert('Successfully enrolled!');

            // Update state to reflect enrollment (maybe remove from this list or mark as enrolled)
             setAllCourses(prevCourses =>
                prevCourses.filter(course => course._id !== courseId)
            );

        } catch (err) {
            console.error('Enrollment error:', err);
            alert(err.message);
            // Revert optimistic update if enrollment failed
             setAllCourses(prevCourses =>
                prevCourses.map(course =>
                    course._id === courseId ? { ...course, isEnrolling: false } : course
                )
            );
        }
    };

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

    // Filter courses based on search term
    const filteredCourses = allCourses.filter(course => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const lowerCaseTitle = course.title.toLowerCase();
        const lowerCaseDescription = course.description.toLowerCase();
        const lowerCaseCategory = course.category ? course.category.toLowerCase() : '';
        const lowerCaseLevel = course.level ? course.level.toLowerCase() : '';

        // Prioritize title match, otherwise check other fields
        return lowerCaseTitle.includes(lowerCaseSearchTerm) ||
               lowerCaseDescription.includes(lowerCaseSearchTerm) ||
               lowerCaseCategory.includes(lowerCaseSearchTerm) ||
               lowerCaseLevel.includes(lowerCaseSearchTerm);
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Available Courses</h1>
            {/* Search Bar */}
            <div className="mb-6 relative">
                <input
                    type="text"
                    placeholder="Search courses..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-screen-xl mx-auto">
                {filteredCourses.length > 0 ? (
                    filteredCourses.map(course => (
                        <div 
                            key={course._id} 
                            className="bg-white rounded-lg shadow-md flex flex-col h-full hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                        >
                            {/* Course Image */}
                            {course.imageUrl ? (
                                <img 
                                    src={course.imageUrl}
                                    alt={`Cover image for ${course.title}`}
                                    className="w-full h-40 object-cover" // Use object-cover to maintain aspect ratio
                                />
                            ) : (
                                // Placeholder or default image if no imageUrl is provided
                                <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-semibold">
                                    No Image Available
                                </div>
                            )}

                            <div className="p-6 flex flex-col flex-grow">
                                {/* Make the main text area clickable */} 
                                <Link 
                                    to={`/course/${course._id}`}
                                    className="block flex-grow"
                                >
                                    <h3 className="text-xl font-semibold mb-2 text-blue-700">{course.title}</h3>
                                    <p className="text-gray-500 text-sm mb-2">Category: {course.category}</p>
                                    <p className="text-gray-500 text-sm mb-4">Level: {course.level}</p>
                                    
                                    {/* Instructor name would go here - requires backend route to populate instructor */}
                                    {/* <p className="text-gray-700 text-sm mb-4">Instructor: {course.instructor?.firstName} {course.instructor?.lastName}</p> */}

                                    <p className="text-gray-600 text-sm">{course.description.substring(0, 150)}{course.description.length > 150 ? '...' : ''}</p>

                                    {/* Skills, Ratings, Duration placeholders would go here as needed */}
                                    {/* Example: */}
                                    {/* <p className="text-gray-700 text-sm mt-4">Skills you'll gain: ...</p> */}
                                    {/* <div className="flex items-center mt-2">Rating: ...</div> */}
                                    {/* <p className="text-gray-700 text-sm mt-2">Duration: ...</p> */}

                                </Link>
                                
                                {/* Enrollment Button/Message (kept separate from the clickable link) */}
                                <div className="mt-4 flex justify-end items-center">
                                    {user ? (
                                        <button
                                            onClick={() => handleEnroll(course._id)}
                                            className={`px-4 py-2 rounded text-white text-sm ${course.isEnrolling ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                                            disabled={course.isEnrolling} // Disable while enrolling
                                        >
                                            {course.isEnrolling ? 'Enrolling...' : 'Enroll'}
                                        </button>
                                    ) : (
                                        <span className="text-sm text-gray-500">Sign in to Enroll</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4 md:col-span-3">
                        <p className="text-gray-500">No courses available at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllCourses; 