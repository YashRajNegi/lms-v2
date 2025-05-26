import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const AssignmentList = () => {
    const { courseId } = useParams();
    const { user } = useUser();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isInstructor, setIsInstructor] = useState(false);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const response = await fetch(`/api/assignments/course/${courseId}`);
                const data = await response.json();
                setAssignments(data);
                
                // Check if user is instructor
                const courseResponse = await fetch(`/api/courses/${courseId}`);
                const courseData = await courseResponse.json();
                setIsInstructor(courseData.instructor === user?.id);
            } catch (error) {
                console.error('Error fetching assignments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, [courseId, user?.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Assignments</h1>
                {isInstructor && (
                    <Link
                        to={`/course/${courseId}/assignment/new`}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Create Assignment
                    </Link>
                )}
            </div>

            <div className="grid gap-6">
                {assignments.map(assignment => (
                    <div key={assignment._id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-semibold mb-2">{assignment.title}</h2>
                                <p className="text-gray-600 mb-4">{assignment.description}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                    <span>Points: {assignment.totalPoints}</span>
                                    <span>Status: {assignment.status}</span>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                {isInstructor ? (
                                    <>
                                        <Link
                                            to={`/course/${courseId}/assignment/${assignment._id}/edit`}
                                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                                        >
                                            Edit
                                        </Link>
                                        <Link
                                            to={`/course/${courseId}/assignment/${assignment._id}/submissions`}
                                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                        >
                                            View Submissions
                                        </Link>
                                    </>
                                ) : (
                                    <Link
                                        to={`/course/${courseId}/assignment/${assignment._id}`}
                                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                    >
                                        {assignment.submissions?.some(sub => sub.studentId === user?.id)
                                            ? 'View Submission'
                                            : 'Submit Assignment'}
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {assignments.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No assignments available</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssignmentList; 