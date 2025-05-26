import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const CreateCourse = () => {
    const { getToken } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [level, setLevel] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const courseData = {
            title,
            description,
            category,
            level: level.toLowerCase(),
            imageUrl,
            // Instructor will be set on the backend using the authenticated user's ID
        };

        try {
            const token = await getToken();
            const response = await fetch('/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(courseData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create course');
            }

            const newCourse = await response.json();
            setSuccess(true);
            // Optionally redirect to the new course detail page
            navigate(`/course/${newCourse._id}`);

        } catch (err) {
            console.error('Error creating course:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Create New Course</h1>
            <div className="bg-white rounded-lg shadow-md p-6">
                {error && <div className="text-red-600 mb-4">Error: {error}</div>}
                {success && <div className="text-green-600 mb-4">Course created successfully!</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-gray-700 font-semibold mb-2">Course Title</label>
                        <input 
                            type="text"
                            id="title"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">Description</label>
                        <textarea
                            id="description"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 h-32"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="category" className="block text-gray-700 font-semibold mb-2">Category</label>
                         <input 
                            type="text"
                            id="category"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="level" className="block text-gray-700 font-semibold mb-2">Level</label>
                         <input 
                            type="text"
                            id="level"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="imageUrl" className="block text-gray-700 font-semibold mb-2">Course Image URL (Optional)</label>
                        <input 
                            type="text"
                            id="imageUrl"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit"
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Course'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateCourse; 