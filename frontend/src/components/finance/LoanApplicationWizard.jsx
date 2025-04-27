import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const LoanApplicationWizard = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        financial_product_id: '',
        amount: '',
        purpose: '',
        term_months: '',
        interest_rate: '',
        documents: []
    });
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [documentFiles, setDocumentFiles] = useState([]);

    useEffect(() => {
        fetchFinancialProducts();
    }, []);

    const fetchFinancialProducts = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/financial-products', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setProducts(response.data.data);
        } catch (error) {
            console.error('Error fetching financial products:', error);
            setError('Failed to load financial products');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setDocumentFiles(prev => [...prev, ...files]);
    };

    const removeDocument = (index) => {
        setDocumentFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Create FormData for file upload
            const formDataToSend = new FormData();
            formDataToSend.append('financial_product_id', formData.financial_product_id);
            formDataToSend.append('amount', formData.amount);
            formDataToSend.append('purpose', formData.purpose);
            formDataToSend.append('term_months', formData.term_months);
            formDataToSend.append('interest_rate', formData.interest_rate);

            // Append each document
            documentFiles.forEach((doc, index) => {
                formDataToSend.append(`documents[${index}]`, doc);
            });

            await axios.post('http://localhost:8000/api/loan-applications', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            navigate('/finance/applications');
        } catch (error) {
            console.error('Error submitting loan application:', error);
            if (error.response && error.response.data && error.response.data.errors) {
                const errorMessages = Object.values(error.response.data.errors).flat();
                setError(errorMessages.join(', '));
            } else {
                setError(error.response?.data?.message || 'Failed to submit application');
            }
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        // Validate current step before proceeding
        if (currentStep === 1 && !formData.financial_product_id) {
            setError('Please select a financial product');
            return;
        }
        
        if (currentStep === 2) {
            if (!formData.amount) {
                setError('Please enter the loan amount');
                return;
            }
            if (!formData.purpose) {
                setError('Please enter the loan purpose');
                return;
            }
            if (!formData.term_months) {
                setError('Please enter the loan term in months');
                return;
            }
            if (!formData.interest_rate) {
                setError('Please enter the interest rate');
                return;
            }
        }
        
        setError(null);
        setCurrentStep(prev => Math.min(prev + 1, 2));
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Select Financial Product</h3>
                        <select
                            name="financial_product_id"
                            value={formData.financial_product_id}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            required
                        >
                            <option value="">Select a product</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>
                                    {product.name} - {product.type}
                                </option>
                            ))}
                        </select>
                        <div className="mt-4">
                            <h4 className="font-medium">Product Details</h4>
                            {formData.financial_product_id && (
                                <div className="mt-2 p-4 bg-gray-50 rounded">
                                    {products.find(p => p.id === parseInt(formData.financial_product_id))?.description}
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Loan Details</h3>
                        <div>
                            <label className="block text-sm font-medium">Amount</label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Purpose</label>
                            <textarea
                                name="purpose"
                                value={formData.purpose}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                rows="4"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Term (months)</label>
                            <input
                                type="number"
                                name="term_months"
                                value={formData.term_months}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Interest Rate (%)</label>
                            <input
                                type="number"
                                name="interest_rate"
                                value={formData.interest_rate}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                step="0.01"
                                required
                            />
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="text-lg font-medium">Required Documents</h3>
                            <div>
                                <label className="block text-sm font-medium">Upload Documents</label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileUpload}
                                    className="w-full p-2 border rounded"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                />
                            </div>
                            {documentFiles.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="font-medium">Selected Documents:</h4>
                                    <ul className="mt-2 space-y-2">
                                        {documentFiles.map((doc, index) => (
                                            <li key={index} className="flex justify-between items-center text-sm text-gray-600">
                                                <span>{doc.name}</span>
                                                <button 
                                                    type="button"
                                                    onClick={() => removeDocument(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Loan Application</h2>
                <div className="flex justify-between mb-8">
                    {[1, 2].map(step => (
                        <div
                            key={step}
                            className={`flex items-center ${
                                step <= currentStep ? 'text-blue-600' : 'text-gray-400'
                            }`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                step <= currentStep ? 'border-blue-600' : 'border-gray-400'
                            }`}>
                                {step}
                            </div>
                            {step < 2 && (
                                <div className={`h-1 w-16 ${
                                    step < currentStep ? 'bg-blue-600' : 'bg-gray-400'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {renderStep()}

                {error && (
                    <div className="text-red-600 text-sm">{error}</div>
                )}

                <div className="flex justify-between mt-8">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Previous
                        </button>
                    )}
                    {currentStep < 2 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading}
                            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default LoanApplicationWizard;