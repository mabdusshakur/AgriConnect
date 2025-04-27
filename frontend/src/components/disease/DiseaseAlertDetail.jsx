import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const DiseaseAlertDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAlertDetails();
        fetchComments();
    }, [id]);

    const fetchAlertDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/disease-alerts/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setAlert(response.data.data);
        } catch (error) {
            console.error('Error fetching disease alert:', error);
            setError(error.response?.data?.message || 'Failed to fetch disease alert');
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/disease-alerts/${id}/comments`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setComments(response.data.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setSubmitting(true);
        try {
            await axios.post(
                `http://localhost:8000/api/disease-alerts/${id}/comments`,
                { content: comment },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            setComment('');
            fetchComments();
        } catch (error) {
            console.error('Error posting comment:', error);
            setError(error.response?.data?.message || 'Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!user?.isAdmin) return;

        try {
            await axios.patch(
                `http://localhost:8000/api/disease-alerts/${id}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            fetchAlertDetails();
        } catch (error) {
            console.error('Error updating status:', error);
            setError(error.response?.data?.message || 'Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'verified':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
            </div>
        );
    }

    if (!alert) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Disease alert not found.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="text-green-600 hover:text-green-800"
                >
                    ← Back to Alerts
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                {alert.title}
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Reported on {new Date(alert.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(alert.status)}`}>
                            {alert.status}
                        </span>
                    </div>
                </div>

                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Crop Type</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{alert.crop_type}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Disease Name</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{alert.disease_name}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Location</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{alert.location}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Description</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{alert.description}</dd>
                        </div>
                    </dl>
                </div>

                {alert.images && alert.images.length > 0 && (
                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                        <h4 className="text-sm font-medium text-gray-500 mb-4">Images</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {alert.images.map((image, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={`http://localhost:8000/storage/${image.path}`}
                                        alt={image.caption || 'Disease alert image'}
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                    {image.caption && (
                                        <p className="mt-2 text-sm text-gray-500">{image.caption}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {user?.isAdmin && (
                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                        <h4 className="text-sm font-medium text-gray-500 mb-4">Admin Actions</h4>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => handleStatusUpdate('verified')}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                Verify Alert
                            </button>
                            <button
                                onClick={() => handleStatusUpdate('rejected')}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                Reject Alert
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Comments</h3>
                <form onSubmit={handleCommentSubmit} className="mb-6">
                    <div>
                        <label htmlFor="comment" className="sr-only">
                            Add a comment
                        </label>
                        <textarea
                            id="comment"
                            rows={3}
                            className="shadow-sm block w-full focus:ring-green-500 focus:border-green-500 sm:text-sm border border-gray-300 rounded-md"
                            placeholder="Add a comment..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>
                    <div className="mt-3">
                        <button
                            type="submit"
                            disabled={submitting || !comment.trim()}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                            {submitting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>
                </form>

                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment.id} className="bg-white shadow sm:rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium text-gray-900">
                                                {comment.user.name}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {new Date(comment.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-700">{comment.content}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DiseaseAlertDetail; 