import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const ApplicationStatus = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/loan-applications');
            setApplications(response.data.data);
        } catch (err) {
            setError('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'in_review':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-600 p-4">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Loan Applications</h2>
            
            {applications.length === 0 ? (
                <div className="text-center text-gray-500 p-8">
                    <p>No loan applications found.</p>
                    <a
                        href="/finance/apply"
                        className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Apply for a Loan
                    </a>
                </div>
            ) : (
                <div className="space-y-4">
                    {applications.map(application => (
                        <div
                            key={application.id}
                            className="bg-white rounded-lg shadow p-6"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-medium">
                                        {application.financial_product?.name}
                                    </h3>
                                    <p className="text-gray-600">
                                        Applied on {formatDate(application.created_at)}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                </span>
                            </div>
                            
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Amount</p>
                                    <p className="font-medium">${application.amount}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Purpose</p>
                                    <p className="font-medium">{application.purpose}</p>
                                </div>
                            </div>

                            {application.admin_notes && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-600">Admin Notes</p>
                                    <p className="mt-1">{application.admin_notes}</p>
                                </div>
                            )}

                            {application.status === 'approved' && (
                                <div className="mt-4 p-4 bg-green-50 rounded">
                                    <p className="text-green-800">
                                        Approved on {formatDate(application.approved_at)}
                                    </p>
                                </div>
                            )}

                            {application.status === 'rejected' && (
                                <div className="mt-4 p-4 bg-red-50 rounded">
                                    <p className="text-red-800">
                                        Rejected on {formatDate(application.rejected_at)}
                                    </p>
                                    {application.rejection_reason && (
                                        <p className="mt-2 text-red-700">
                                            Reason: {application.rejection_reason}
                                        </p>
                                    )}
                                </div>
                            )}

                            {application.documents && application.documents.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-600">Documents</h4>
                                    <ul className="mt-2 space-y-2">
                                        {application.documents.map(doc => (
                                            <li key={doc.id} className="flex items-center">
                                                <svg
                                                    className="h-5 w-5 text-gray-400 mr-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                                <span className="text-sm">{doc.document_type}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ApplicationStatus; 