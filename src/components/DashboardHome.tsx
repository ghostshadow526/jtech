import React from 'react';
import { DollarSign, TrendingUp, Users, ShoppingCart, Package, Activity, Bell } from 'lucide-react';

interface DashboardHomeProps {
  balance: number;
  orders: any[];
  onNavigate: (tab: string) => void;
}

export const DashboardHome = ({ balance, orders, onNavigate }: DashboardHomeProps) => {
  const ordersCount = orders.length;
  const recentOrders = orders.slice(0, 5);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-1">Total Balance</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₦{balance.toFixed(2)}</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">Available for orders</p>
        </div>
        
        <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('services')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-1">Services</h3>
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
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Orders</h3>
              <button 
                onClick={() => onNavigate('orders')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                View all
              </button>
            </div>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.slice(0, 5).map((order, i) => (
                  <div key={i} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <div className={`p-2 rounded-lg ${
                      order.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20' :
                      order.status === 'pending' ? 'bg-blue-50 dark:bg-blue-900/20' :
                      order.status === 'processing' ? 'bg-purple-50 dark:bg-purple-900/20' :
                      'bg-red-50 dark:bg-red-900/20'
                    }`}>
                      <ShoppingCart className={`h-4 w-4 ${
                        order.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                        order.status === 'pending' ? 'text-blue-600 dark:text-blue-400' :
                        order.status === 'processing' ? 'text-purple-600 dark:text-purple-400' :
                        'text-red-600 dark:text-red-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        Order #{order.smm_order_id}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        Service ID: {order.service_id} | Qty: {order.quantity}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {order.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No orders yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
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
      </div>
    </div>
  );
};
