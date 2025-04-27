import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const BudgetCalculator = () => {
    const [budgets, setBudgets] = useState([]);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        monthly_income: '',
        monthly_expenses: '',
        savings_goal: '',
        start_date: '',
        end_date: '',
        is_active: true
    });

    useEffect(() => {
        fetchBudgets();
    }, []);

    const fetchBudgets = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/budgets');
            console.log(response.data.data);
            setBudgets(response.data.data);
            if (response.data.data.length > 0) {
                setSelectedBudget(response.data.data[0]);
            }
        } catch (error) {
            console.error('Error fetching budgets:', error);
            setError('Failed to load budgets');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('http://localhost:8000/api/budgets', formData);
            setBudgets(prev => [...prev, response.data.data]);
            setSelectedBudget(response.data.data);
            setFormData({
                name: '',
                description: '',
                monthly_income: '',
                monthly_expenses: '',
                savings_goal: '',
                start_date: '',
                end_date: '',
                is_active: true
            });
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create budget');
        } finally {
            setLoading(false);
        }
    };

    const handleBudgetSelect = (budget) => {
        setSelectedBudget(budget);
    };

    const calculateTotalIncome = () => {
        if (!selectedBudget) return 0;
        
        // If there are no items, use the monthly_income value
        if (!selectedBudget.items || selectedBudget.items.length === 0) {
            return parseFloat(selectedBudget.monthly_income) || 0;
        }
        
        return selectedBudget.items
            .filter(item => item.type === 'income')
            .reduce((sum, item) => sum + parseFloat(item.amount), 0);
    };

    const calculateTotalExpenses = () => {
        if (!selectedBudget) return 0;
        
        // If there are no items, use the monthly_expenses value
        if (!selectedBudget.items || selectedBudget.items.length === 0) {
            return parseFloat(selectedBudget.monthly_expenses) || 0;
        }
        
        return selectedBudget.items
            .filter(item => item.type === 'expense')
            .reduce((sum, item) => sum + parseFloat(item.amount), 0);
    };

    const getChartData = () => {
        if (!selectedBudget) return null;
        
        // Check if items array is empty
        if (!selectedBudget.items || selectedBudget.items.length === 0) {
            // Use monthly_income and monthly_expenses for the chart
            return {
                incomeData: {
                    labels: ['Monthly Income'],
                    datasets: [{
                        label: 'Income',
                        data: [parseFloat(selectedBudget.monthly_income) || 0],
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    }]
                },
                expenseData: {
                    labels: ['Monthly Expenses'],
                    datasets: [{
                        label: 'Expenses',
                        data: [parseFloat(selectedBudget.monthly_expenses) || 0],
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    }]
                }
            };
        }

        const incomeData = {
            labels: selectedBudget.items
                .filter(item => item.type === 'income')
                .map(item => item.name),
            datasets: [{
                label: 'Income',
                data: selectedBudget.items
                    .filter(item => item.type === 'income')
                    .map(item => item.amount),
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
            }]
        };

        const expenseData = {
            labels: selectedBudget.items
                .filter(item => item.type === 'expense')
                .map(item => item.name),
            datasets: [{
                label: 'Expenses',
                data: selectedBudget.items
                    .filter(item => item.type === 'expense')
                    .map(item => item.amount),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            }]
        };

        return { incomeData, expenseData };
    };

    const chartData = getChartData();

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Budget Form */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-4">Create New Budget</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Budget Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                rows="3"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium">Monthly Income</label>
                                <input
                                    type="number"
                                    name="monthly_income"
                                    value={formData.monthly_income}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Monthly Expenses</label>
                                <input
                                    type="number"
                                    name="monthly_expenses"
                                    value={formData.monthly_expenses}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Savings Goal</label>
                            <input
                                type="number"
                                name="savings_goal"
                                value={formData.savings_goal}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium">Start Date</label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">End Date</label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleInputChange}
                                className="mr-2"
                            />
                            <label className="text-sm font-medium">Active Budget</label>
                        </div>
                        {error && (
                            <div className="text-red-600 text-sm">{error}</div>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Budget'}
                        </button>
                    </form>
                </div>

                {/* Budget Overview */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-4">Budget Overview</h2>
                    
                    {/* Budget Selection */}
                    {budgets.length > 0 && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Budget
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {budgets.map((budget) => (
                                    <button
                                        key={budget.id}
                                        onClick={() => handleBudgetSelect(budget)}
                                        className={`p-3 text-left rounded-md border ${
                                            selectedBudget && selectedBudget.id === budget.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="font-medium">{budget.name}</div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {selectedBudget ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-green-50 rounded">
                                    <h3 className="text-lg font-medium text-green-800">Total Income</h3>
                                    <p className="text-2xl font-bold text-green-600">
                                        ${calculateTotalIncome().toFixed(2)}
                                    </p>
                                </div>
                                <div className="p-4 bg-red-50 rounded">
                                    <h3 className="text-lg font-medium text-red-800">Total Expenses</h3>
                                    <p className="text-2xl font-bold text-red-600">
                                        ${calculateTotalExpenses().toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Budget Details */}
                            <div className="mt-6">
                                <h3 className="text-lg font-medium mb-2">Budget Details</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Description
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Monthly Income
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Monthly Expenses
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Savings Goal
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {selectedBudget.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {selectedBudget.description || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                                    ${parseFloat(selectedBudget.monthly_income).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                                    ${parseFloat(selectedBudget.monthly_expenses).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                                    ${parseFloat(selectedBudget.savings_goal).toFixed(2)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            {/* Budget Items Table */}
                            {selectedBudget.items && selectedBudget.items.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-medium mb-2">Budget Items</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Name
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Type
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Category
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Amount
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {selectedBudget.items.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {item.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                item.type === 'income' 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : item.type === 'expense'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-blue-100 text-blue-800'
                                                            }`}>
                                                                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {item.category || 'N/A'}
                                                        </td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                            item.type === 'income' 
                                                                ? 'text-green-600' 
                                                                : item.type === 'expense'
                                                                ? 'text-red-600'
                                                                : 'text-blue-600'
                                                        }`}>
                                                            ${parseFloat(item.amount).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                            
                            {chartData && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Income Distribution</h3>
                                        <Bar data={chartData.incomeData} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Expense Distribution</h3>
                                        <Pie data={chartData.expenseData} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500">No budget selected</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BudgetCalculator; 