import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminLoanReview = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [processingAction, setProcessingAction] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/admin/loan-applications');
            setApplications(response.data.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setError('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const handleApplicationSelect = (application) => {
        setSelectedApplication(application);
        setReviewNotes(application.admin_notes || '');
        setRejectionReason(application.rejection_reason || '');
    };

    const handleStatusUpdate = async (status) => {
        if (!selectedApplication) return;

        setProcessingAction(true);
        setError(null);

        try {
            const payload = {
                status,
                admin_notes: reviewNotes
            };

            // Add rejection_reason if status is rejected
            if (status === 'rejected') {
                if (!rejectionReason.trim()) {
                    setError('Rejection reason is required when rejecting an application');
                    setProcessingAction(false);
                    return;
                }
                payload.rejection_reason = rejectionReason;
            }

            await axios.put(
                `http://localhost:8000/api/admin/loan-applications/${selectedApplication.id}/status`,
                payload
            );

            // Update the local state
            setApplications(prev =>
                prev.map(app =>
                    app.id === selectedApplication.id
                        ? {
                              ...app,
                              status,
                              admin_notes: reviewNotes,
                              rejection_reason: status === 'rejected' ? rejectionReason : app.rejection_reason,
                              ...(status === 'approved' && { approved_at: new Date().toISOString() }),
                              ...(status === 'rejected' && { rejected_at: new Date().toISOString() })
                          }
                        : app
                )
            );

            setSelectedApplication(prev => ({
                ...prev,
                status,
                admin_notes: reviewNotes,
                rejection_reason: status === 'rejected' ? rejectionReason : prev.rejection_reason,
                ...(status === 'approved' && { approved_at: new Date().toISOString() }),
                ...(status === 'rejected' && { rejected_at: new Date().toISOString() })
            }));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update application status');
        } finally {
            setProcessingAction(false);
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
            <h2 className="text-2xl font-bold mb-6">Loan Application Review</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Applications List */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-4 border-b">
                            <h3 className="text-lg font-medium">Applications</h3>
                        </div>
                        <div className="divide-y">
                            {applications.map(application => (
                                <button
                                    key={application.id}
                                    onClick={() => handleApplicationSelect(application)}
                                    className={`w-full p-4 text-left hover:bg-gray-50 ${
                                        selectedApplication?.id === application.id
                                            ? 'bg-blue-50'
                                            : ''
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium">
                                                {application.user?.name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {application.financial_product?.name}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                application.status
                                            )}`}
                                        >
                                            {application.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Applied on {formatDate(application.created_at)}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Application Details */}
                <div className="md:col-span-2">
                    {selectedApplication ? (
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-lg font-medium">
                                            Application Details
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            ID: {selectedApplication.id}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                            selectedApplication.status
                                        )}`}
                                    >
                                        {selectedApplication.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-600">
                                            Applicant
                                        </h4>
                                        <p className="mt-1">{selectedApplication.user?.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {selectedApplication.user?.email}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-600">
                                            Financial Product
                                        </h4>
                                        <p className="mt-1">
                                            {selectedApplication.financial_product?.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {selectedApplication.financial_product?.type}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-600">
                                        Loan Details
                                    </h4>
                                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Amount</p>
                                            <p className="font-medium">
                                                ${selectedApplication.amount}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Purpose</p>
                                            <p className="font-medium">
                                                {selectedApplication.purpose}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {selectedApplication.documents && (
                                    <div className="mb-6">
                                        <h4 className="text-sm font-medium text-gray-600">
                                            Documents
                                        </h4>
                                        <ul className="mt-2 space-y-2">
                                            {selectedApplication.documents.map(doc => (
                                                <li
                                                    key={doc.id}
                                                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                                >
                                                    <span className="text-sm">
                                                        {doc.document_type}
                                                    </span>
                                                    <a
                                                        href={`http://localhost:8000/storage/${doc.file_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        View
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-600">
                                        Admin Notes
                                    </h4>
                                    <textarea
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        rows="3"
                                        value={reviewNotes}
                                        onChange={(e) => setReviewNotes(e.target.value)}
                                        placeholder="Add notes about this application..."
                                    ></textarea>
                                </div>

                                {selectedApplication.status === 'rejected' && (
                                    <div className="mb-6">
                                        <h4 className="text-sm font-medium text-gray-600">
                                            Rejection Reason
                                        </h4>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {selectedApplication.rejection_reason || 'No reason provided'}
                                        </p>
                                    </div>
                                )}

                                {selectedApplication.status === 'pending' && (
                                    <div className="mb-6">
                                        <h4 className="text-sm font-medium text-gray-600">
                                            Rejection Reason
                                        </h4>
                                        <textarea
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            rows="2"
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="Reason for rejection (required if rejecting)"
                                        ></textarea>
                                    </div>
                                )}

                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => handleStatusUpdate('approved')}
                                        disabled={processingAction || selectedApplication.status === 'approved'}
                                        className={`px-4 py-2 rounded-md text-white ${
                                            processingAction || selectedApplication.status === 'approved'
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-green-600 hover:bg-green-700'
                                        }`}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('rejected')}
                                        disabled={processingAction || selectedApplication.status === 'rejected'}
                                        className={`px-4 py-2 rounded-md text-white ${
                                            processingAction || selectedApplication.status === 'rejected'
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                            Select an application to review
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminLoanReview; 