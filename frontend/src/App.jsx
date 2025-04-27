import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import ProductList from './components/marketplace/ProductList';
import ProductDetail from './components/marketplace/ProductDetail';
import ProductForm from './components/marketplace/ProductForm';
import Cart from './components/marketplace/Cart';
import OrderHistory from './components/marketplace/OrderHistory';
import FarmerDashboard from './components/dashboard/FarmerDashboard';
import BuyerDashboard from './components/dashboard/BuyerDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import FarmerDiseaseAlerts from './components/disease/FarmerDiseaseAlerts';
import DiseaseAlertForm from './components/disease/DiseaseAlertForm';
import { Link } from 'react-router-dom';

// Import finance components
import BudgetCalculator from './components/finance/BudgetCalculator';
import ApplicationStatus from './components/finance/ApplicationStatus';
import DocumentUpload from './components/finance/DocumentUpload';
import FinancialEducation from './components/finance/FinancialEducation';
import LoanApplicationWizard from './components/finance/LoanApplicationWizard';
import AdminLoanReview from './components/finance/AdminLoanReview';
import LoanApplications from './components/finance/LoanApplications';
import PublicDiseaseAlerts from './components/disease/PublicDiseaseAlerts';

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<LoginForm />} />
                        <Route path="/register" element={<RegisterForm />} />
                        <Route path="/products" element={<ProductList />} />
                        <Route path="/products/:id" element={<ProductDetail />} />

                        {/* Protected routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <div className="min-h-screen bg-gray-100">
                                        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                                            <div className="px-4 py-6 sm:px-0">
                                                <h1 className="text-3xl font-bold text-gray-900">
                                                    Dashboard
                                                </h1>
                                            </div>
                                        </div>
                                    </div>
                                </ProtectedRoute>
                            }
                        />

                        {/* Admin routes */}
                        <Route
                            path="/admin/*"
                            element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="finance" element={
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
                                                className="text-primary hover:text-primary-dark"
                                            >
                                                Review Applications →
                                            </Link>
                                        </div>
                                        <div className="bg-white p-6 rounded-lg shadow">
                                            <h2 className="text-xl font-semibold mb-2">Financial Education</h2>
                                            <p className="text-gray-600 mb-4">Manage financial education resources</p>
                                            <Link
                                                to="/admin/finance/education"
                                                className="text-primary hover:text-primary-dark"
                                            >
                                                Manage Resources →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            } />
                            <Route path="finance/loan-review" element={<AdminLoanReview />} />
                        </Route>

                        {/* Farmer routes */}
                        <Route
                            path="/farmer/*"
                            element={
                                <ProtectedRoute allowedRoles={['farmer']}>
                                    <FarmerDashboard />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                                        Welcome to Your Dashboard
                                    </h1>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="bg-white p-6 rounded-lg shadow">
                                            <h2 className="text-xl font-semibold mb-2">My Products</h2>
                                            <p className="text-gray-600 mb-4">Manage your products and inventory</p>
                                            <Link
                                                to="/farmer/products"
                                                className="text-primary hover:text-primary-dark"
                                            >
                                                View Products →
                                            </Link>
                                        </div>
                                        <div className="bg-white p-6 rounded-lg shadow">
                                            <h2 className="text-xl font-semibold mb-2">Orders</h2>
                                            <p className="text-gray-600 mb-4">View and manage your orders</p>
                                            <Link
                                                to="/farmer/orders"
                                                className="text-primary hover:text-primary-dark"
                                            >
                                                View Orders →
                                            </Link>
                                        </div>
                                        <div className="bg-white p-6 rounded-lg shadow">
                                            <h2 className="text-xl font-semibold mb-2">Add New Product</h2>
                                            <p className="text-gray-600 mb-4">List a new product for sale</p>
                                            <Link
                                                to="/farmer/products/new"
                                                className="text-primary hover:text-primary-dark"
                                            >
                                                Add Product →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            } />
                            <Route path="products" element={<ProductList />} />
                            <Route path="products/new" element={<ProductForm />} />
                            <Route path="products/:id/edit" element={<ProductForm />} />
                            <Route path="orders" element={<OrderHistory />} />
                            <Route path="disease-alerts" element={<FarmerDiseaseAlerts />} />
                            <Route path="disease-alerts/new" element={<DiseaseAlertForm />} />
                            
                            {/* Farmer Finance Routes */}
                            <Route path="finance" element={
                                <div className="space-y-6">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                                        Financial Services
                                    </h1>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="bg-white p-6 rounded-lg shadow">
                                            <h2 className="text-xl font-semibold mb-2">Budget Calculator</h2>
                                            <p className="text-gray-600 mb-4">Plan and track your farm budget</p>
                                            <Link
                                                to="/farmer/finance/budget"
                                                className="text-primary hover:text-primary-dark"
                                            >
                                                Manage Budget →
                                            </Link>
                                        </div>
                                        <div className="bg-white p-6 rounded-lg shadow">
                                            <h2 className="text-xl font-semibold mb-2">Loan Applications</h2>
                                            <p className="text-gray-600 mb-4">Apply for agricultural loans</p>
                                            <Link
                                                to="/farmer/finance/apply"
                                                className="text-primary hover:text-primary-dark"
                                            >
                                                Apply for Loan →
                                            </Link>
                                        </div>
                                        <div className="bg-white p-6 rounded-lg shadow">
                                            <h2 className="text-xl font-semibold mb-2">Application Status</h2>
                                            <p className="text-gray-600 mb-4">Check your loan application status</p>
                                            <Link
                                                to="/farmer/finance/status"
                                                className="text-primary hover:text-primary-dark"
                                            >
                                                Check Status →
                                            </Link>
                                        </div>
                                        <div className="bg-white p-6 rounded-lg shadow">
                                            <h2 className="text-xl font-semibold mb-2">Financial Education</h2>
                                            <p className="text-gray-600 mb-4">Learn about farm financial management</p>
                                            <Link
                                                to="/farmer/finance/education"
                                                className="text-primary hover:text-primary-dark"
                                            >
                                                View Resources →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            } />
                            <Route path="finance/budget" element={<BudgetCalculator />} />
                            <Route path="finance/apply" element={<LoanApplicationWizard />} />
                            <Route path="finance/status" element={<ApplicationStatus />} />
                            <Route path="finance/education" element={<FinancialEducation />} />
                            <Route path="finance/documents/:applicationId" element={<DocumentUpload />} />
                            <Route path="finance/loans" element={<LoanApplications />} />
                        </Route>

                        {/* Buyer routes */}
                        <Route path="/buyer" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerDashboard /></ProtectedRoute>}>
                            <Route index element={<div>Buyer Overview</div>} />
                            <Route path="products" element={<ProductList />} />
                            <Route path="cart" element={<Cart />} />
                            <Route path="orders" element={<OrderHistory />} />
                        </Route>

                        {/* Unauthorized route */}
                        <Route
                            path="/unauthorized"
                            element={
                                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                                    <div className="text-center">
                                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                            403 Unauthorized
                                        </h1>
                                        <p className="text-gray-600">
                                            You don't have permission to access this page.
                                        </p>
                                    </div>
                                </div>
                            }
                        />

                        {/* Public disease alerts route */}
                        <Route path="/" element={<PublicDiseaseAlerts />} />

                        {/* Default route */}
                        <Route path="/" element={<Navigate to="/products" replace />} />
                    </Routes>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
