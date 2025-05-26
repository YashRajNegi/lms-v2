import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const DiscussionDetail = () => {
    const { courseId, threadId } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const [thread, setThread] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');

    useEffect(() => {
        const fetchThread = async () => {
            try {
                const response = await fetch(`/api/discussions/${threadId}`);
                const data = await response.json();
                setThread(data);
            } catch (error) {
                console.error('Error fetching thread:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchThread();
    }, [threadId]);

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        try {
            const response = await fetch(`/api/discussions/${threadId}/replies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: replyContent
                })
            });

            if (!response.ok) {
                throw new Error('Failed to post reply');
            }

            const updatedThread = await response.json();
            setThread(updatedThread);
            setReplyContent('');
        } catch (error) {
            console.error('Error posting reply:', error);
            alert('Failed to post reply. Please try again.');
        }
    };

    const handleReaction = async (replyId, type) => {
        try {
            const response = await fetch(`/api/discussions/${threadId}/replies/${replyId}/reactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type })
            });

            if (!response.ok) {
                throw new Error('Failed to add reaction');
            }

            const updatedThread = await response.json();
            setThread(updatedThread);
        } catch (error) {
            console.error('Error adding reaction:', error);
        }
    };

    const handleAcceptAnswer = async (replyId) => {
        try {
            const response = await fetch(`/api/discussions/${threadId}/replies/${replyId}/accept`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Failed to accept answer');
            }

            const updatedThread = await response.json();
            setThread(updatedThread);
        } catch (error) {
            console.error('Error accepting answer:', error);
        }
    };

    const handleEditReply = async (replyId) => {
        try {
            const response = await fetch(`/api/discussions/${threadId}/replies/${replyId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: editContent })
            });

            if (!response.ok) {
                throw new Error('Failed to edit reply');
            }

            const updatedThread = await response.json();
            setThread(updatedThread);
            setIsEditing(false);
            setEditContent('');
        } catch (error) {
            console.error('Error editing reply:', error);
        }
    };

    const handleDeleteThread = async () => {
        try {
            const response = await fetch(`/api/discussions/${threadId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete thread');
            }

            // Redirect to discussions list after successful deletion
            navigate(`/course/${courseId}/discussions`);
        } catch (error) {
            console.error('Error deleting thread:', error);
            alert('Failed to delete thread. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!thread) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-red-600">Thread not found</h1>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Thread Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold mb-4">{thread.title}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                            <span>👤 {thread.author}</span>
                            <span>👁️ {thread.views} views</span>
                            <span>🕒 {new Date(thread.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    {thread.author === user?.id && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate(`/course/${courseId}/discussion/${threadId}/edit`)}
                                className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this thread?')) {
                                        handleDeleteThread();
                                    }
                                }}
                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
                <div className="prose max-w-none">
                    {thread.content}
                </div>
            </div>

            {/* Replies */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Replies ({thread.replies.length})</h2>
                
                {thread.replies.map(reply => (
                    <div
                        key={reply._id}
                        className={`bg-white rounded-lg shadow-md p-6 ${reply.isAcceptedAnswer ? 'border-l-4 border-green-500' : ''}`}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium">{reply.author}</span>
                                    {reply.isAcceptedAnswer && (
                                        <span className="text-green-600">✓ Accepted Answer</span>
                                    )}
                                </div>
                                {isEditing === reply._id ? (
                                    <div className="mb-4">
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows="4"
                                        />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setEditContent('');
                                                }}
                                                className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleEditReply(reply._id)}
                                                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="prose max-w-none mb-4">
                                        {reply.content}
                                    </div>
                                )}
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleReaction(reply._id, 'like')}
                                        className={`text-gray-500 hover:text-blue-600 ${reply.reactions.some(r => r.user === user?.id && r.type === 'like') ? 'text-blue-600' : ''}`}
                                    >
                                        👍 {reply.reactions.filter(r => r.type === 'like').length}
                                    </button>
                                    <button
                                        onClick={() => handleReaction(reply._id, 'helpful')}
                                        className={`text-gray-500 hover:text-green-600 ${reply.reactions.some(r => r.user === user?.id && r.type === 'helpful') ? 'text-green-600' : ''}`}
                                    >
                                        ✅ {reply.reactions.filter(r => r.type === 'helpful').length}
                                    </button>
                                    {thread.author === user?.id && !reply.isAcceptedAnswer && (
                                        <button
                                            onClick={() => handleAcceptAnswer(reply._id)}
                                            className="text-gray-500 hover:text-green-600"
                                        >
                                            Accept Answer
                                        </button>
                                    )}
                                    {reply.author === user?.id && (
                                        <button
                                            onClick={() => {
                                                setIsEditing(reply._id);
                                                setEditContent(reply.content);
                                            }}
                                            className="text-gray-500 hover:text-blue-600"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Reply Form */}
            {!thread.isLocked && (
                <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-bold mb-4">Post a Reply</h3>
                    <form onSubmit={handleReply}>
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                            rows="4"
                            placeholder="Write your reply..."
                            required
                        />
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Post Reply
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default DiscussionDetail; 