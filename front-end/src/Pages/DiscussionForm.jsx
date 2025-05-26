import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const DiscussionForm = () => {
    const { courseId, threadId } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('general');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const isEditing = !!threadId;

    useEffect(() => {
        if (isEditing) {
            const fetchThread = async () => {
                setLoading(true);
                try {
                    const response = await fetch(`/api/discussions/${threadId}`);
                    const data = await response.json();
                    if (response.ok) {
                        setTitle(data.title);
                        setContent(data.content);
                        setCategory(data.category);
                        setTags(data.tags.join(', '));
                    } else {
                        setError(data.message || 'Failed to fetch thread');
                    }
                } catch (err) {
                    setError('Error fetching thread:' + err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchThread();
        }
    }, [threadId, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `/api/discussions/${threadId}` : '/api/discussions';

        const threadData = {
            title,
            content,
            course: courseId, // Include courseId for new threads
            category,
            tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        };
        
        // Remove course property if editing
        if (isEditing) {
            delete threadData.course;
        }

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(threadData),
            });

            const data = await response.json();

            if (response.ok) {
                navigate(`/course/${courseId}/discussion/${data._id || threadId}`);
            } else {
                setError(data.message || 'Failed to save thread');
            }
        } catch (err) {
            setError('Error saving thread:' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-red-600">Error: {error}</h1>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">{isEditing ? 'Edit Discussion' : 'New Discussion'}</h1>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4">
                    <label htmlFor="title" className="block text-gray-700 font-bold mb-2">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="content" className="block text-gray-700 font-bold mb-2">Content</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="8"
                        required
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label htmlFor="category" className="block text-gray-700 font-bold mb-2">Category</label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="general">General</option>
                        <option value="question">Question</option>
                        <option value="discussion">Discussion</option>
                        <option value="announcement">Announcement</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label htmlFor="tags" className="block text-gray-700 font-bold mb-2">Tags (comma-separated)</label>
                    <input
                        type="text"
                        id="tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., react, javascript, help"
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        disabled={loading}
                    >
                        {isEditing ? 'Save Changes' : 'Create Discussion'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DiscussionForm; 