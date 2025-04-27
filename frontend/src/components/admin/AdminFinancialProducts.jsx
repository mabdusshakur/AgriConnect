import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const AdminFinancialProducts = () => {
    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'loan',
        interest_rate: '',
        min_amount: '',
        max_amount: '',
        min_term_months: '',
        max_term_months: '',
        requirements: [],
        benefits: [],
        is_active: true,
        display_order: 0
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8000/api/admin/financial-products', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            console.log("token" + localStorage.getItem('token'));
            setProducts(response.data.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching financial products:', err);
            setError('Failed to load financial products');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleArrayInputChange = (e, field) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            [field]: value.split(',').map(item => item.trim()).filter(Boolean)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (editingProduct) {
                await axios.put(
                    `http://localhost:8000/api/admin/financial-products/${editingProduct.id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
            } else {
                await axios.post(
                    'http://localhost:8000/api/admin/financial-products',
                    formData,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
            }
            fetchProducts();
            resetForm();
            setError(null);
        } catch (err) {
            console.error('Error saving financial product:', err);
            setError(err.response?.data?.message || 'Failed to save financial product');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            type: product.type,
            interest_rate: product.interest_rate || '',
            min_amount: product.min_amount || '',
            max_amount: product.max_amount || '',
            min_term_months: product.min_term_months || '',
            max_term_months: product.max_term_months || '',
            requirements: product.requirements || [],
            benefits: product.benefits || [],
            is_active: product.is_active,
            display_order: product.display_order
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this financial product?')) return;

        try {
            setLoading(true);
            await axios.delete(`http://localhost:8000/api/admin/financial-products/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchProducts();
            setError(null);
        } catch (err) {
            console.error('Error deleting financial product:', err);
            setError('Failed to delete financial product');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            type: 'loan',
            interest_rate: '',
            min_amount: '',
            max_amount: '',
            min_term_months: '',
            max_term_months: '',
            requirements: [],
            benefits: [],
            is_active: true,
            display_order: 0
        });
    };

    if (loading && products.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                    {editingProduct ? 'Edit Financial Product' : 'Add New Financial Product'}
                </h1>
                {editingProduct && (
                    <button
                        onClick={resetForm}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        >
                            <option value="loan">Loan</option>
                            <option value="insurance">Insurance</option>
                            <option value="investment">Investment</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
                        <input
                            type="number"
                            name="interest_rate"
                            value={formData.interest_rate}
                            onChange={handleInputChange}
                            min="0"
                            max="100"
                            step="0.01"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Minimum Amount</label>
                        <input
                            type="number"
                            name="min_amount"
                            value={formData.min_amount}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Maximum Amount</label>
                        <input
                            type="number"
                            name="max_amount"
                            value={formData.max_amount}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Minimum Term (months)</label>
                        <input
                            type="number"
                            name="min_term_months"
                            value={formData.min_term_months}
                            onChange={handleInputChange}
                            min="1"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Maximum Term (months)</label>
                        <input
                            type="number"
                            name="max_term_months"
                            value={formData.max_term_months}
                            onChange={handleInputChange}
                            min="1"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Display Order</label>
                        <input
                            type="number"
                            name="display_order"
                            value={formData.display_order}
                            onChange={handleInputChange}
                            min="0"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">Active</label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows="4"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Requirements (comma-separated)</label>
                    <input
                        type="text"
                        value={formData.requirements.join(', ')}
                        onChange={(e) => handleArrayInputChange(e, 'requirements')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        placeholder="e.g. Valid ID, Proof of Income, Bank Statement"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Benefits (comma-separated)</label>
                    <input
                        type="text"
                        value={formData.benefits.join(', ')}
                        onChange={(e) => handleArrayInputChange(e, 'benefits')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        placeholder="e.g. Low Interest Rate, Flexible Repayment, No Early Payment Fee"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-black text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                </div>
            </form>

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Existing Financial Products</h2>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {products.map((product) => (
                            <li key={product.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-medium text-gray-900 truncate">{product.name}</h3>
                                        <p className="mt-1 text-sm text-gray-500">{product.description}</p>
                                        <div className="mt-2 flex items-center text-sm text-gray-500">
                                            <span className="mr-4">Type: {product.type}</span>
                                            {product.interest_rate && (
                                                <span className="mr-4">Interest Rate: {product.interest_rate}%</span>
                                            )}
                                            <span>Status: {product.is_active ? 'Active' : 'Inactive'}</span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="px-3 py-1 text-sm text-primary hover:text-primary-dark"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminFinancialProducts; 