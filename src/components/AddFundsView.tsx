import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Wallet, CreditCard, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export const AddFundsView = () => {
  const [selectedAmount, setSelectedAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  const predefinedAmounts = [5000, 10000, 25000, 50000, 100000];
  const PAYSTACK_PUBLIC_KEY = 'pk_live_cf2748615538818ad7b36689672b5c05ea2caaac';

  // Load Paystack script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      setPaystackLoaded(true);
    };
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const getAmountToCharge = () => {
    return customAmount ? parseInt(customAmount) : selectedAmount;
  };

  const handlePayment = async () => {
    if (!auth.currentUser) {
      setError('Please log in to add funds');
      return;
    }

    const amount = getAmountToCharge();
    
    if (amount < 1000) {
      setError('Minimum amount is ₦1,000');
      return;
    }

    if (!paystackLoaded || !window.PaystackPop) {
      setError('Payment gateway is loading. Please try again.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: auth.currentUser.email,
        amount: amount * 100, // Paystack expects amount in kobo (multiply by 100)
        ref: `${Date.now()}`,
        currency: 'NGN',
        onClose: () => {
          setLoading(false);
          setError('Payment window closed. Transaction not completed.');
        },
        onSuccess: async (response: any) => {
          try {
            // Update user balance in Firestore
            const userRef = doc(db, 'users', auth.currentUser!.uid);
            await updateDoc(userRef, {
              balance: increment(amount)
            });

            setSuccess(`Payment successful! ₦${amount.toLocaleString()} has been added to your account. Reference: ${response.reference}`);
            setSelectedAmount(5000);
            setCustomAmount('');
            setLoading(false);

            // Clear success message after 5 seconds
            setTimeout(() => setSuccess(null), 5000);
          } catch (err: any) {
            console.error('Error updating balance:', err);
            setError('Payment received but failed to update balance. Please contact support.');
            setLoading(false);
          }
        }
      });

      handler.openIframe();
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred during payment');
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl space-y-10"
    >
      <div>
        <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Infrastructure Credits</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md">Recharge your account to deploy new engagement infrastructures. All transactions are processed securely through Paystack.</p>
      </div>

      {/* Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10 flex items-start gap-3"
        >
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
        </motion.div>
      )}

      {/* Payment Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-10 space-y-8 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <CreditCard className="w-8 h-8" />
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Secure Payment</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Choose a predefined amount or enter a custom amount. Your payment is processed securely through Paystack.
            </p>
          </div>

          {/* Predefined Amounts */}
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">Quick Amounts</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {predefinedAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount('');
                  }}
                  className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                    selectedAmount === amount && !customAmount
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  ₦{(amount / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <label htmlFor="customAmount" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Custom Amount (₦)</label>
            <input
              id="customAmount"
              type="number"
              min="1000"
              step="1000"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                if (e.target.value) {
                  setSelectedAmount(0);
                }
              }}
              placeholder="Enter amount (minimum ₦1,000)"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Amount Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                ₦{getAmountToCharge().toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span>Processing fee</span>
              <span>Included</span>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={loading || !paystackLoaded}
          className={`w-full h-14 rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
            loading || !paystackLoaded
              ? 'bg-gray-400 dark:bg-gray-600 text-gray-100 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : !paystackLoaded ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              Initialize Payment <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl p-8">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Automated Processing</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Credits are typically applied within seconds of successful payment confirmation. If your balance doesn't update, please refresh the dashboard.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
