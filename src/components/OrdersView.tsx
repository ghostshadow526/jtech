import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

interface OrdersViewProps {
  orders: any[];
  onBack: () => void;
}

export const OrdersView = ({ orders, onBack }: OrdersViewProps) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="w-full space-y-8"
  >
    <div className="flex justify-between items-center">
      <div>
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Back to Dashboard</span>
        </button>
        <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Operation Logs</h2>
      </div>
    </div>

    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="px-8 py-6 text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">ID</th>
              <th className="px-8 py-6 text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Service</th>
              <th className="px-8 py-6 text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Quantity</th>
              <th className="px-8 py-6 text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Cost</th>
              <th className="px-8 py-6 text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-8 py-6 text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-8 py-6 font-mono text-xs text-gray-500 dark:text-gray-400">#{order.smm_order_id}</td>
                <td className="px-8 py-6 text-sm font-medium text-gray-900 dark:text-gray-100">Service {order.service_id}</td>
                <td className="px-8 py-6 text-sm text-gray-500 dark:text-gray-400">{order.quantity.toLocaleString()}</td>
                <td className="px-8 py-6 text-sm font-bold text-gray-900 dark:text-gray-100">₦{order.cost.toFixed(2)}</td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    order.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                    order.status === 'processing' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                    order.status === 'canceled' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-xs text-gray-400 dark:text-gray-500">
                  {order.createdAt?.toDate().toLocaleDateString()}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center text-gray-500 dark:text-gray-400 font-medium italic text-lg">
                  No operations recorded in the infrastructure logs.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </motion.div>
);
