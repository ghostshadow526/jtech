import React from 'react';
import { motion } from 'motion/react';
import { Wallet, CreditCard, ArrowRight } from 'lucide-react';

export const AddFundsView = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl space-y-10"
    >
      <div>
        <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Infrastructure Credits</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md">Recharge your account to deploy new engagement infrastructures. All transactions are processed through our secure payment gateway.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-10 space-y-8 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CreditCard className="w-8 h-8" />
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Secure Recharge</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Use our automated payment gateway to instantly add credits to your account. We support all major credit cards and local payment methods.
            </p>
          </div>
          <button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3">
            Initialize Payment <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-10 space-y-8 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-400 flex items-center justify-center">
            <Wallet className="w-8 h-8" />
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manual Transfer</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              For large enterprise recharges, we offer manual bank transfer options. Please contact our support team to receive the necessary credentials.
            </p>
          </div>
          <button className="w-full h-14 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-900 dark:hover:border-gray-100 hover:text-gray-900 dark:hover:text-gray-100 rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3">
            Contact Support <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl p-8">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Automated Processing</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Credits are typically applied within 60 seconds of successful payment confirmation. If your balance doesn't update, please refresh the dashboard.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
