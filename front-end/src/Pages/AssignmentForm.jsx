import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const AssignmentForm = () => {
    const { courseId, assignmentId } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        totalPoints: 100,
        rubric: [{ criteria: '', points: 0, description: '' }]
    });

    useEffect(() => {
        if (assignmentId) {
            const fetchAssignment = async () => {
                try {
                    const response = await fetch(`/api/assignments/${assignmentId}`);
                    const data = await response.json();
                    setFormData({
                        ...data,
                        dueDate: new Date(data.dueDate).toISOString().split('T')[0]
                    });
                } catch (error) {
                    console.error('Error fetching assignment:', error);
                }
            };
            fetchAssignment();
        }
    }, [assignmentId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRubricChange = (index, field, value) => {
        const newRubric = [...formData.rubric];
        newRubric[index] = {
            ...newRubric[index],
            [field]: value
        };
        setFormData(prev => ({
            ...prev,
            rubric: newRubric
        }));
    };

    const addRubricItem = () => {
        setFormData(prev => ({
            ...prev,
            rubric: [...prev.rubric, { criteria: '', points: 0, description: '' }]
        }));
    };

    const removeRubricItem = (index) => {
        setFormData(prev => ({
            ...prev,
            rubric: prev.rubric.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = assignmentId
                ? `/api/assignments/${assignmentId}`
                : '/api/assignments';
            
            const method = assignmentId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    course: courseId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save assignment');
            }

            navigate(`/course/${courseId}/assignments`);
        } catch (error) {
            console.error('Error saving assignment:', error);
            alert('Failed to save assignment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">
                {assignmentId ? 'Edit Assignment' : 'Create Assignment'}
            </h1>

            <form onSubmit={handleSubmit} className="max-w-2xl">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Due Date
                        </label>
                        <input
                            type="date"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total Points
                        </label>
                        <input
                            type="number"
                            name="totalPoints"
                            value={formData.totalPoints}
                            onChange={handleChange}
                            required
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium text-gray-900">Rubric</h2>
                            <button
                                type="button"
                                onClick={addRubricItem}
                                className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                            >
                                Add Criteria
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.rubric.map((item, index) => (
                                <div key={index} className="flex gap-4 items-start">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={item.criteria}
                                            onChange={(e) => handleRubricChange(index, 'criteria', e.target.value)}
                                            placeholder="Criteria"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="w-24">
                                        <input
                                            type="number"
                                            value={item.points}
                                            onChange={(e) => handleRubricChange(index, 'points', e.target.value)}
                                            placeholder="Points"
                                            min="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeRubricItem(index)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate(`/course/${courseId}/assignments`)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Assignment'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AssignmentForm; 