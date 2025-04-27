import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ExclamationTriangleIcon,
    MapPinIcon,
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

const PublicDiseaseAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8000/api/disease-alerts-public');
            // Handle different possible response structures
            const alertsData = Array.isArray(response.data) 
                ? response.data 
                : Array.isArray(response.data.data) 
                    ? response.data.data 
                    : [];
            setAlerts(alertsData);
            setError(null);
        } catch (err) {
            console.error('Error fetching disease alerts:', err);
            setError('Failed to load disease alerts');
            setAlerts([]); // Ensure alerts is always an array
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (alert) => {
        setSelectedAlert(alert);
        setShowModal(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'verified':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'verified':
                return <CheckCircleIcon className="h-5 w-5" />;
            case 'pending':
                return <ClockIcon className="h-5 w-5" />;
            case 'rejected':
                return <XCircleIcon className="h-5 w-5" />;
            default:
                return <ExclamationTriangleIcon className="h-5 w-5" />;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Disease Alerts</h1>
                <p className="text-xl text-gray-600">Stay informed about crop diseases in your area</p>
            </div>

            {/* Alerts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {alerts.map((alert) => (
                    <div key={alert.id} className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">{alert.title}</h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                                    {getStatusIcon(alert.status)}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-gray-500">
                                    <MapPinIcon className="h-4 w-4 mr-2" />
                                    {alert.location}
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <CalendarIcon className="h-4 w-4 mr-2" />
                                    {new Date(alert.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-gray-600 line-clamp-2">{alert.description}</p>
                            </div>
                            <div className="mt-6">
                                <button
                                    onClick={() => handleViewDetails(alert)}
                                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Alert Details Modal */}
            {showModal && selectedAlert && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">{selectedAlert.title}</h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <span className="sr-only">Close</span>
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Crop Type</h3>
                                        <p className="mt-1 text-sm text-gray-900">{selectedAlert.crop_type}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Disease Name</h3>
                                        <p className="mt-1 text-sm text-gray-900">{selectedAlert.disease_name}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Location</h3>
                                        <p className="mt-1 text-sm text-gray-900">{selectedAlert.location}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Description</h3>
                                        <p className="mt-1 text-sm text-gray-900">{selectedAlert.description}</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-4">Images</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedAlert.images?.map((image, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={`http://localhost:8000/storage/${image.image_path}`}
                                                    alt={`Disease alert image ${index + 1}`}
                                                    className="w-full h-48 object-cover rounded-lg"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicDiseaseAlerts; 