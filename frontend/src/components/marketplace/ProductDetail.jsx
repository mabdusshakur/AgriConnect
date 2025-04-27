import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/products/${id}`);
      if (response.data.status === 'success') {
        setProduct(response.data.data);
        setError(null);
      } else {
        setError('Failed to fetch product details');
      }
    } catch (err) {
      setError('Error loading product. Please try again later.');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.quantity || 0)) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({ ...product, quantity });
      navigate('/cart');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`http://localhost:8000/api/products/${id}`);
      navigate('/farmer/products');
    } catch (err) {
      setError('Failed to delete product. Please try again.');
      console.error('Error deleting product:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!product) return <ErrorMessage message="Product not found" />;

  const isProductOwner = user && user.id === product.farmer_id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-w-1 aspect-h-1 w-full">
            <img
              src={product.images?.[selectedImage]?.image_path || '/placeholder.jpg'}
              alt={product.title}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
          
          {/* Thumbnail Gallery */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square ${
                    selectedImage === index ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <img
                    src={image.image_path}
                    alt={`${product.title} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
            {isProductOwner && (
              <div className="flex gap-2">
                <Link
                  to={`/farmer/products/${id}/edit`}
                  className="p-2 text-gray-600 hover:text-primary"
                >
                  <PencilIcon className="w-6 h-6" />
                </Link>
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
          
          <div className="text-2xl font-bold text-primary">
            ${Number(product.price).toFixed(2)}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">Description</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500">Category:</span>
                <span className="ml-2 text-gray-900">{product.category}</span>
              </div>
              <div>
                <span className="text-gray-500">Location:</span>
                <span className="ml-2 text-gray-900">{product.location}</span>
              </div>
              <div>
                <span className="text-gray-500">Available:</span>
                <span className="ml-2 text-gray-900">{product.quantity} in stock</span>
              </div>
              <div>
                <span className="text-gray-500">Seller:</span>
                <span className="ml-2 text-gray-900">{product.farmer?.name || 'Unknown'}</span>
              </div>
            </div>
          </div>
          
          {!isProductOwner && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label htmlFor="quantity" className="text-gray-700">
                  Quantity:
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  max={product.quantity}
                  className="w-20 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <button
                onClick={handleAddToCart}
                disabled={!product.quantity}
                className="w-full bg-black py-3 px-8 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
              >
                {product.quantity ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 