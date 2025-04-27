import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    HomeIcon,
    CubeIcon,
    ShoppingCartIcon,
    CurrencyDollarIcon,
    ExclamationTriangleIcon,
    ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const FarmerDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const isActive = (path) => {
        return location.pathname === `/farmer${path}`;
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navigation = [
        { name: 'Overview', href: '/farmer', icon: HomeIcon },
        { name: 'Products', href: '/farmer/products', icon: CubeIcon },
        { name: 'Orders', href: '/farmer/orders', icon: ShoppingCartIcon },
        { name: 'Finance', href: '/farmer/finance', icon: CurrencyDollarIcon },
        { name: 'Disease Alerts', href: '/farmer/disease-alerts', icon: ExclamationTriangleIcon },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
                <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
                    <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                        <div className="flex flex-shrink-0 items-center px-4">
                            <span className="text-xl font-bold text-green-600">Farmer Dashboard</span>
                        </div>
                        <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                        isActive(item.href.replace('/farmer', ''))
                                            ? 'bg-green-50 text-green-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <item.icon
                                        className={`mr-3 h-6 w-6 flex-shrink-0 ${
                                            isActive(item.href.replace('/farmer', ''))
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
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FarmerDashboard; 