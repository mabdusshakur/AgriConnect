import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { PencilIcon } from '@heroicons/react/24/outline';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  // Format price safely
  const formatPrice = (price) => {
    const numPrice = Number(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  const isProductOwner = user && user.id === product.farmer_id;

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/20">
        <div className="relative pb-[75%]">
          <img
            src={product.images?.[0]?.image_path || '/placeholder.jpg'}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {isProductOwner && (
            <Link
              to={`/farmer/products/${product.id}/edit`}
              className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow-sm transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <PencilIcon className="w-5 h-5 text-gray-600 hover:text-primary" />
            </Link>
          )}
        </div>
        
        <div className="p-4 space-y-2">
          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors duration-200 truncate">
            {product.title}
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              ${formatPrice(product.price)}
            </span>
            <span className={`text-sm px-2 py-1 rounded-full ${product.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
              {product.location}
            </span>
            {!isProductOwner && (
              <button
                onClick={handleAddToCart}
                disabled={product.quantity <= 0}
                className={`px-3 py-2 bg-black rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 ${
                  product.quantity > 0 
                    ? 'bg-primary hover:bg-primary-dark text-white' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;