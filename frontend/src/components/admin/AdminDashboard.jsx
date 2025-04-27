import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    HomeIcon,
    FolderIcon,
    UsersIcon,
    ChartBarIcon,
    CogIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    ShoppingCartIcon,
    CubeIcon,
    ArrowRightOnRectangleIcon,
    TagIcon,
    CurrencyDollarIcon,
    AcademicCapIcon,
    BanknotesIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import CategoryForm from './CategoryForm';
import AdminFinancialProducts from './AdminFinancialProducts';
import AdminLoanReview from '../finance/AdminLoanReview';

import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [dashboardStats, setDashboardStats] = useState({
        totalCategories: 0,
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0
    });

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Categories', href: '/admin/categories', icon: FolderIcon },
        { name: 'Users', href: '/admin/users', icon: UsersIcon },
        { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
        { name: 'Finance', href: '/admin/finance', icon: CurrencyDollarIcon },
        { name: 'Disease Alerts', href: '/admin/disease-alerts', icon: ExclamationTriangleIcon },
        { name: 'Settings', href: '/admin/settings', icon: CogIcon },
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    useEffect(() => {
        if (location.pathname === '/admin/categories') {
            fetchCategories();
        } else if (location.pathname === '/admin') {
            fetchDashboardStats();
        }
    }, [location.pathname]);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8000/api/dashboard-stats');
            setDashboardStats(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            setError('Failed to load dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8000/api/admin/categories');
            setCategories(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySubmit = async (formData) => {
        try {
            if (editingCategory) {
                await axios.put(`http://localhost:8000/api/admin/categories/${editingCategory.id}`, formData);
            } else {
                await axios.post('http://localhost:8000/api/admin/categories', formData);
            }
            fetchCategories();
            setShowCategoryForm(false);
            setEditingCategory(null);
        } catch (err) {
            console.error('Error saving category:', err);
            setError('Failed to save category');
        }
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setShowCategoryForm(true);
    };

    const handleDeleteCategory = async (category) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        try {
            await axios.delete(`http://localhost:8000/api/admin/categories/${category.id}`);
            fetchCategories();
        } catch (err) {
            console.error('Error deleting category:', err);
            setError('Failed to delete category');
        }
    };

    const handleCancel = () => {
        setShowCategoryForm(false);
        setEditingCategory(null);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const CategoryManagement = () => {
        if (loading) return <div>Loading...</div>;
        if (error) return <div className="text-red-500">{error}</div>;

        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
                    <button
                        onClick={() => {
                            setShowCategoryForm(true);
                            setEditingCategory(null);
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Add Category
                    </button>
                </div>

                {showCategoryForm && (
                    <CategoryForm
                        editingCategory={editingCategory}
                        onSubmit={handleCategorySubmit}
                        onCancel={handleCancel}
                    />
                )}

                {/* Categories Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Display Order
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {categories.map((category) => (
                                <tr key={category.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {category.icon && (
                                                <span className="mr-2">{category.icon}</span>
                                            )}
                                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-500">{category.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{category.display_order}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                category.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {category.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEditCategory(category)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(category)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const AdminHome = () => {
        if (loading) return <div>Loading...</div>;
        if (error) return <div className="text-red-500">{error}</div>;

        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Stats cards */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <FolderIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Categories</dt>
                                        <dd className="flex items-baseline">
                                            <div className="text-2xl font-semibold text-gray-900">{dashboardStats.totalCategories}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <UsersIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                                        <dd className="flex items-baseline">
                                            <div className="text-2xl font-semibold text-gray-900">{dashboardStats.totalUsers}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <CubeIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                                        <dd className="flex items-baseline">
                                            <div className="text-2xl font-semibold text-gray-900">{dashboardStats.totalProducts}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ShoppingCartIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                                        <dd className="flex items-baseline">
                                            <div className="text-2xl font-semibold text-gray-900">{dashboardStats.totalOrders}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
                <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
                    <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                        <div className="flex flex-shrink-0 items-center px-4">
                            <span className="text-xl font-bold text-green-600">Admin Dashboard</span>
                        </div>
                        <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                        isActive(item.href)
                                            ? 'bg-green-50 text-green-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <item.icon
                                        className={`mr-3 h-6 w-6 flex-shrink-0 ${
                                            isActive(item.href)
                                                ? 'text-green-600'
                                                : 'text-gray-400 group-hover:text-gray-500'
                                        }`}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
                        <button
                            onClick={handleLogout}
                            className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                        >
                            <ArrowRightOnRectangleIcon
                                className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                            />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className="flex flex-1 flex-col md:pl-64">
                <div className="sticky top-0 z-10 bg-white pl-1 pt-1 sm:pl-3 sm:pt-3 md:hidden">
                    <button
                        type="button"
                        className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
                    >
                        <span className="sr-only">Open sidebar</span>
                        <HomeIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>

                {/* Main content */}
                <main className="flex-1">
                    <div className="py-6">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                            <Routes>
                                <Route path="/" element={<AdminHome />} />
                                <Route path="/categories" element={<CategoryManagement />} />
                                <Route path="/users" element={<div>Users Management (Coming Soon)</div>} />
                                <Route path="/analytics" element={<div>Analytics (Coming Soon)</div>} />
                                <Route path="/settings" element={<div>Settings (Coming Soon)</div>} />
                                <Route path="/finance" element={
                                    <div className="space-y-6">
                                        <h1 className="text-3xl font-bold text-gray-900 mb-6">
                                            Financial Management
                                        </h1>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <div className="bg-white p-6 rounded-lg shadow">
                                                <h2 className="text-xl font-semibold mb-2">Loan Applications</h2>
                                                <p className="text-gray-600 mb-4">Review and manage loan applications</p>
                                                <Link
                                                    to="/admin/finance/loan-review"
                                                    className="text-green-600 hover:text-green-800"
                                                >
                                                    Review Applications →
                                                </Link>
                                            </div>
                                            <div className="bg-white p-6 rounded-lg shadow">
                                                <h2 className="text-xl font-semibold mb-2">Financial Products</h2>
                                                <p className="text-gray-600 mb-4">Manage financial products and services</p>
                                                <Link
                                                    to="/admin/finance/products"
                                                    className="text-green-600 hover:text-green-800"
                                                >
                                                    Manage Products →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                } />
                                <Route path="/finance/products" element={<AdminFinancialProducts />} />
                                <Route path="/finance/loan-review" element={<AdminLoanReview />} />
                                <Route path="/disease-alerts" element={<DiseaseAlertManagement />} />
                            </Routes>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

const DiseaseAlertManagement = () => {
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
            const response = await axios.get('http://localhost:8000/api/disease-alerts', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setAlerts(response.data.data.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching disease alerts:', err);
            setError('Failed to load disease alerts');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (alertId, newStatus) => {
        try {
            await axios.put(`http://localhost:8000/api/disease-alerts/${alertId}`, {
                status: newStatus
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            fetchAlerts(); // Refresh the list
        } catch (err) {
            console.error('Error updating alert status:', err);
            setError('Failed to update alert status');
        }
    };

    const handleViewDetails = (alert) => {
        setSelectedAlert(alert);
        setShowModal(true);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Disease Alert Management</h1>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Crop Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Disease
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Location
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Region
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {alerts.map((alert) => (
                            <tr key={alert.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{alert.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{alert.crop_type}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{alert.disease_name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{alert.location}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{alert.region}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        alert.status === 'verified' ? 'bg-green-100 text-green-800' :
                                        alert.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {alert.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleViewDetails(alert)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        View Details
                                    </button>
                                    {alert.status === 'pending' && (
                                        <button
                                            onClick={() => handleStatusChange(alert.id, 'verified')}
                                            className="text-green-600 hover:text-green-900 mr-4"
                                        >
                                            Verify
                                        </button>
                                    )}
                                    {alert.status === 'verified' && (
                                        <button
                                            onClick={() => handleStatusChange(alert.id, 'rejected')}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Reject
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
                                        <h3 className="text-sm font-medium text-gray-500">Region</h3>
                                        <p className="mt-1 text-sm text-gray-900">{selectedAlert.region}</p>
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

export default AdminDashboard; 