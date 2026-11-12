// frontend/src/pages/Cart.jsx - COMPLETE FIXED VERSION
import { useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Cart() {
  const { items, updateQty, removeItem, clear } = useCart();
  const { user } = useAuth();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + (Number(i.medicine.price) * i.quantity), 0),
    [items]
  );

  // ✅ FIXED: Checkout function with correct payload format
  const checkout = async () => {
    if (!user) {
      return alert('Please login first to place an order');
    }

    if (items.length === 0) {
      return alert('Your cart is empty');
    }

    if (!address.trim()) {
      alert('Please enter a delivery address');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🛒 Starting checkout process...');
      console.log('Cart items:', items);
      
      // ✅ FIXED: Format payload correctly for backend
      const payload = {
        medicineIds: items.map(i => i.medicine.id),
        quantities: items.map(i => i.quantity)
      };
      
      console.log('📦 Sending payload to backend:', payload);
      
      // Send sale creation request
      const response = await api.post('/api/sales', payload);
      console.log('✅ Sale created successfully:', response.data);
      
      // If delivery address is provided, create delivery record
      if (address.trim()) {
        try {
          const deliveryPayload = {
            saleId: response.data.id,
            address: address.trim(),
            status: 'PENDING'
          };
          
          console.log('🚚 Creating delivery record:', deliveryPayload);
          await api.post('/api/deliveries', deliveryPayload);
          console.log('✅ Delivery record created successfully');
        } catch (deliveryError) {
          console.warn('⚠️ Sale created but delivery record failed:', deliveryError);
          // Don't fail the entire checkout if delivery creation fails
        }
      }
      
      alert('Order placed successfully! You will receive a confirmation soon.');
      clear(); // Clear the cart
      setAddress(''); // Clear address
      
    } catch (e) {
      console.error('❌ Checkout error:', e);
      console.error('Error response:', e.response?.data);
      console.error('Error status:', e.response?.status);
      
      let errorMessage = 'Checkout failed. Please try again.';
      
      if (e.response?.status === 401) {
        errorMessage = 'Please login again to place an order.';
      } else if (e.response?.status === 400) {
        errorMessage = e.response?.data?.message || 'Invalid order data. Please check your cart.';
      } else if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white text-4xl">🛒</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Add some medicines to get started with your order.</p>
            <a 
              href="/browse" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Browse Medicines
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
              <span className="text-white text-xl">🛒</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600 mt-1">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Cart Items</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {items.map((item, index) => (
              <div key={item.medicine.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-white text-sm">💊</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{item.medicine.name}</h3>
                      <p className="text-sm text-gray-600">{item.medicine.category || 'General'}</p>
                      <p className="text-sm text-green-600 font-medium">${Number(item.medicine.price).toFixed(2)} each</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {/* Quantity Input */}
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Qty:</label>
                      <input
                        type="number"
                        min="1"
                        max={item.medicine.quantity}
                        value={item.quantity}
                        onChange={(e) => updateQty(item.medicine.id, Math.max(1, Number(e.target.value)))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        ${(Number(item.medicine.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.medicine.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Remove item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary & Checkout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Delivery Address */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-green-500 mr-2">📍</span>
              Delivery Address
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Delivery Address *
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your complete delivery address including street, city, and postal code..."
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                  required
                />
              </div>

              {!user && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <span className="text-yellow-500 mr-2">⚠️</span>
                    <p className="text-sm text-yellow-800">
                      Please <a href="/login" className="font-medium underline">login</a> to place an order.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-green-500 mr-2">📋</span>
              Order Summary
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Items ({items.length})</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery</span>
                <span className="font-medium text-green-600">FREE</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900">Total</span>
                <span className="text-green-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={checkout}
              disabled={loading || !user || !address.trim()}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                loading || !user || !address.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Place Order - $${total.toFixed(2)}`
              )}
            </button>

            {!user && (
              <p className="text-center text-sm text-gray-500 mt-3">
                Please login to complete your order
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
