import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';

const DiscussionList = () => {
    const { courseId } = useParams();
    const { user } = useUser();
    const { getToken } = useAuth();
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                const token = await getToken();

                const response = await fetch(`/api/discussions/course/${courseId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                     const errorData = await response.json();
                     throw new Error(errorData.message || 'Failed to fetch threads');
                }
                
                const data = await response.json();
                setThreads(data);
            } catch (error) {
                console.error('Error fetching threads:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchThreads();
    }, [courseId, getToken]);

    const filteredThreads = threads.filter(thread => {
        const matchesFilter = filter === 'all' || thread.category === filter;
        const matchesSearch = thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            thread.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

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
                <h1 className="text-3xl font-bold">Discussions</h1>
                <Link
                    to={`/course/${courseId}/discussion/new`}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    New Discussion
                </Link>
            </div>

            {/* Filters and Search */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search discussions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All</option>
                        <option value="general">General</option>
                        <option value="question">Questions</option>
                        <option value="discussion">Discussions</option>
                        <option value="announcement">Announcements</option>
                    </select>
                </div>
            </div>

            {/* Threads List */}
            <div className="space-y-4">
                {filteredThreads.map(thread => (
                    <div
                        key={thread._id}
                        className={`bg-white rounded-lg shadow-md p-6 ${
                            thread.isPinned ? 'border-l-4 border-blue-500' : ''
                        }`}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    {thread.isPinned && (
                                        <span className="text-blue-500">📌</span>
                                    )}
                                    <h2 className="text-xl font-semibold">
                                        <Link
                                            to={`/course/${courseId}/discussion/${thread._id}`}
                                            className="hover:text-blue-600"
                                        >
                                            {thread.title}
                                        </Link>
                                    </h2>
                                    <span className={`px-2 py-1 text-sm rounded ${
                                        thread.category === 'question' ? 'bg-green-100 text-green-800' :
                                        thread.category === 'announcement' ? 'bg-red-100 text-red-800' :
                                        thread.category === 'discussion' ? 'bg-purple-100 text-purple-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {thread.category}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    {thread.content.substring(0, 200)}...
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>👤 {thread.author}</span>
                                    <span>💬 {thread.replies.length} replies</span>
                                    <span>👁️ {thread.views} views</span>
                                    <span>🕒 {new Date(thread.lastActivity).toLocaleDateString()}</span>
                                </div>
                            </div>
                            {thread.isLocked && (
                                <span className="text-red-500">🔒</span>
                            )}
                        </div>
                    </div>
                ))}

                {filteredThreads.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No discussions found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiscussionList; 