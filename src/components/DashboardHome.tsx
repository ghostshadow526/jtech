import React, { useState } from 'react';
import { TrendingUp, Users, ShoppingCart, Package, Activity, Bell, Eye, EyeOff, RotateCcw, Loader2, X, AlertCircle } from 'lucide-react';
import { FeaturedServicesSection } from './FeaturedServicesSection';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardHomeProps {
  balance: number;
  orders: any[];
  onNavigate: (tab: string) => void;
  user?: any;
  onPlaceOrder?: (serviceId: string, quantity: number, link: string) => Promise<void>;
}

export const DashboardHome = ({ balance, orders, onNavigate, user, onPlaceOrder }: DashboardHomeProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [quantity, setQuantity] = useState('1');
  const [link, setLink] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const ordersCount = orders.length;
  const recentOrders = orders.slice(0, 5);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  
  const handleRefreshOrders = async () => {
    setIsRefreshing(true);
    setRefreshMessage('');
    try {
      const response = await fetch('/api/orders/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user?.uid })
      });
      const data = await response.json();
      if (data.success) {
        setRefreshMessage(`Updated ${data.updatedCount} order(s) status`);
        setTimeout(() => setRefreshMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to refresh orders:', error);
      setRefreshMessage('Failed to check order status');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddToCart = (service: any) => {
    setSelectedService(service);
    setQuantity('1');
    setLink('');
    setOrderError(null);
    setShowOrderModal(true);
  };

  const handlePlaceOrder = async () => {
    if (!selectedService || !quantity || !link) {
      setOrderError('Please fill in all fields');
      return;
    }

    const qty = parseInt(quantity);
    const totalCost = selectedService.price * qty;

    if (totalCost > balance) {
      setOrderError(`Insufficient balance. Cost: ₦${totalCost.toFixed(2)}, Balance: ₦${balance.toFixed(2)}`);
      return;
    }

    setIsPlacingOrder(true);
    try {
      if (onPlaceOrder) {
        await onPlaceOrder(selectedService.id, qty, link);
      }
      setShowOrderModal(false);
      setSelectedService(null);
    } catch (error: any) {
      setOrderError(error.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="h-5 w-5 text-blue-600 dark:text-blue-400 text-lg font-bold">₦</span>
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-1">Total Balance</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₦{balance.toFixed(2)}</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">Available for orders</p>
        </div>
        
        <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('Boost Your Socials')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-1">Boost Your Socials</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">Browse</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">Available to order</p>
        </div>
        
        <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('orders')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-1">Total Orders</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{ordersCount}</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">Lifetime orders</p>
        </div>

        <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-1">Active Operations</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {pendingOrdersCount}
          </p>
          <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">Orders in progress</p>
        </div>
      </div>
      
      {/* Orders & Transactions Table */}
      <div className="space-y-6">
        {/* Orders Table */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Orders History</h3>
            <div className="flex items-center gap-3">
              {refreshMessage && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">{refreshMessage}</span>
              )}
              <button 
                onClick={handleRefreshOrders}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Check if pending orders are complete"
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
                <span>Refresh</span>
              </button>
              <button 
                onClick={() => onNavigate('orders')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                View all
              </button>
            </div>
          </div>
          
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {orders.slice(0, 10).map((order, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                        #{order.smm_order_id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {order.service_id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {order.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        ₦{order.cost?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'completed' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                          order.status === 'processing' 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                          order.status === 'pending' 
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}>
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <ShoppingCart className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No orders yet. Start ordering to see them here!</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Featured Services Section */}
      <div className="py-8">
        <FeaturedServicesSection 
          onViewAllServices={() => onNavigate('Boost Your Socials')}
          onAddToCart={handleAddToCart}
        />
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">System Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">API Connectivity</span>
                <span className="text-sm font-medium text-green-500">Online</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Order Processing</span>
                <span className="text-sm font-medium text-blue-500">Normal</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Support Response</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Fast</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Tips</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Always double check your links before placing an order to avoid delays.
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30">
                <p className="text-xs text-green-700 dark:text-green-300">
                  Bulk orders get processed faster during off-peak hours.
                </p>
              </div>
            </div>
          </div>
        </div>

      {/* Order Modal */}
      <AnimatePresence>
        {showOrderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowOrderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Order: {selectedService?.name}
                </h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {orderError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">{orderError}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price per unit: ₦{selectedService?.price?.toFixed(2) || '0.00'}
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Post Link / Username
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., https://instagram.com/username"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Total Cost:</strong> ₦{(selectedService?.price * parseInt(quantity || '1')).toFixed(2)}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Available Balance:</strong> ₦{balance.toFixed(2)}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {isPlacingOrder && <Loader2 className="w-4 h-4 animate-spin" />}
                    Place Order
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
