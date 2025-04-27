import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    date_from: '',
    date_to: '',
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching orders with filters:', filters);
      const response = await axios.get('http://localhost:8000/api/orders', {
        params: filters
      });
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      // The orders are in response.data.data because of Laravel's pagination
      const ordersData = response.data.data || [];
      console.log('Orders data:', ordersData);
      setOrders(ordersData);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err.response?.data || err.message);
      setError('Failed to fetch orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:8000/api/orders/${orderId}/status`, {
        status: newStatus
      });
      fetchOrders();
    } catch (err) {
      setError('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      setLoading(true);
      await axios.post(`http://localhost:8000/api/orders/${orderId}/cancel`);
      fetchOrders();
    } catch (err) {
      setError('Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      await axios.post(`http://localhost:8000/api/orders/${orderId}/payment-status`, {
        payment_status: newStatus
      });
      fetchOrders();
    } catch (err) {
      setError('Failed to update payment status');
    } finally {
      setLoading(false);
    }
  };

  if (loading && orders.length === 0) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  console.log('Rendering orders:', orders);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Order History</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders && orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Order #{order.id}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                      order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-4">
                  {order.items && order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img
                        src={item.product?.images?.[0]?.image_path ? `http://localhost:8000/storage/${item.product.images[0].image_path}` : '/placeholder.jpg'}
                        alt={item.product?.title || 'Product'}
                        className="w-16 h-16 object-cover rounded-md"
                        onError={(e) => {
                          e.target.src = '/placeholder.jpg';
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product?.title}</h4>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity} × ${Number(item.price).toFixed(2)}
                        </p>
                      </div>
                      <span className="font-semibold">
                        ${(Number(item.quantity) * Number(item.price)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Shipping Address:</p>
                      <p className="font-medium">{order.shipping_address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Amount:</p>
                      <p className="font-bold text-lg">${Number(order.total_amount).toFixed(2)}</p>
                    </div>
                  </div>

                  {user.role === 'farmer' && order.status === 'pending' && (
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'processing')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Process Order
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}

                  {user.role === 'farmer' && order.status === 'processing' && (
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'shipped')}
                        className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                      >
                        Mark as Shipped
                      </button>
                      <button
                        onClick={() => handleUpdatePaymentStatus(order.id, 'paid')}
                        className={`px-4 py-2 rounded-md ${
                          order.payment_status === 'paid'
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                        } text-white`}
                        disabled={order.payment_status === 'paid'}
                      >
                        {order.payment_status === 'paid' ? 'Payment Received' : 'Mark as Paid'}
                      </button>
                    </div>
                  )}

                  {user.role === 'farmer' && order.status === 'shipped' && (
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'delivered')}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                      >
                        Mark as Delivered
                      </button>
                      <button
                        onClick={() => handleUpdatePaymentStatus(order.id, 'paid')}
                        className={`px-4 py-2 rounded-md ${
                          order.payment_status === 'paid'
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                        } text-white`}
                        disabled={order.payment_status === 'paid'}
                      >
                        {order.payment_status === 'paid' ? 'Payment Received' : 'Mark as Paid'}
                      </button>
                    </div>
                  )}

                  {user.role === 'buyer' && order.status === 'pending' && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory; 