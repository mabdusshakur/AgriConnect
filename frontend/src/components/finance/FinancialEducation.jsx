import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FinancialEducation = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/financial-education');
            setResources(response.data.data);
        } catch (error) {
            setError('Failed to load financial education resources');
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { id: 'all', name: 'All Resources' },
        { id: 'budgeting', name: 'Budgeting' },
        { id: 'saving', name: 'Saving' },
        { id: 'investing', name: 'Investing' },
        { id: 'debt', name: 'Debt Management' },
        { id: 'tax', name: 'Tax Planning' }
    ];

    const filteredResources = selectedCategory === 'all'
        ? resources
        : resources.filter(resource => resource.category === selectedCategory);

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
            <h2 className="text-2xl font-bold mb-6">Financial Education Resources</h2>

            {/* Category Filter */}
            <div className="mb-8">
                <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium ${
                                selectedCategory === category.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map(resource => (
                    <div
                        key={resource.id}
                        className="bg-white rounded-lg shadow overflow-hidden"
                    >
                        {resource.thumbnail && (
                            <img
                                src={resource.thumbnail}
                                alt={resource.title}
                                className="w-full h-48 object-cover"
                            />
                        )}
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-blue-600">
                                    {resource.category}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {resource.read_time} min read
                                </span>
                            </div>
                            <h3 className="text-lg font-medium mb-2">
                                {resource.title}
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {resource.description}
                            </p>
                            <div className="flex items-center justify-between">
                                <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Read More
                                </a>
                                {resource.type === 'video' && (
                                    <span className="text-sm text-gray-500">
                                        Video Content
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredResources.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">
                        No resources found in this category.
                    </p>
                </div>
            )}
        </div>
    );
};

export default FinancialEducation; 