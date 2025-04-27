import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const DiseaseAlertList = () => {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        region: '',
        status: '',
        crop_type: ''
    });
    const [regions, setRegions] = useState([]);
    const [cropTypes, setCropTypes] = useState([]);

    useEffect(() => {
        fetchAlerts();
        fetchRegions();
        fetchCropTypes();
    }, [filters]);

    const fetchAlerts = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.region) params.append('region', filters.region);
            if (filters.status) params.append('status', filters.status);
            if (filters.crop_type) params.append('crop_type', filters.crop_type);

            const response = await axios.get(`http://localhost:8000/api/disease-alerts?${params}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setAlerts(response.data.data);
        } catch (error) {
            console.error('Error fetching disease alerts:', error);
            setError(error.response?.data?.message || 'Failed to fetch disease alerts');
        } finally {
            setLoading(false);
        }
    };

    const fetchRegions = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/disease-alerts/regions');
            setRegions(response.data.data);
        } catch (error) {
            console.error('Error fetching regions:', error);
        }
    };

    const fetchCropTypes = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/disease-alerts/crop-types');
            setCropTypes(response.data.data);
        } catch (error) {
            console.error('Error fetching crop types:', error);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
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

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Disease Alerts</h2>
                <Link
                    to="/disease-alerts/create"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    Report New Disease
                </Link>
            </div>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                        Filter by Region
                    </label>
                    <select
                        id="region"
                        name="region"
                        value={filters.region}
                        onChange={handleFilterChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    >
                        <option value="">All Regions</option>
                        {regions.map((region, index) => (
                            <option key={index} value={region}>
                                {region}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Filter by Status
                    </label>
                    <select
                        id="status"
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="crop_type" className="block text-sm font-medium text-gray-700">
                        Filter by Crop Type
                    </label>
                    <select
                        id="crop_type"
                        name="crop_type"
                        value={filters.crop_type}
                        onChange={handleFilterChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    >
                        <option value="">All Crop Types</option>
                        {cropTypes.map((type, index) => (
                            <option key={index} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {alerts.map((alert) => (
                        <li key={alert.id}>
                            <Link to={`/disease-alerts/${alert.id}`} className="block hover:bg-gray-50">
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <p className="text-sm font-medium text-green-600 truncate">
                                                {alert.title}
                                            </p>
                                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(alert.status)}`}>
                                                {alert.status}
                                            </span>
                                        </div>
                                        <div className="ml-2 flex-shrink-0 flex">
                                            <p className="text-sm text-gray-500">
                                                {new Date(alert.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500">
                                                {alert.crop_type}
                                            </p>
                                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                {alert.disease_name}
                                            </p>
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                            <p>
                                                {alert.location}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {alerts.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No disease alerts found.</p>
                </div>
            )}
        </div>
    );
};

export default DiseaseAlertList; 