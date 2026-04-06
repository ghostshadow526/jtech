import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { CreditCard, TrendingUp, DollarSign } from 'lucide-react';

interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: any;
  description?: string;
}

interface PaymentStats {
  totalPayments: number;
  totalRevenue: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  averageTransaction: number;
  thisMonthRevenue: number;
}

export function PaymentsSection() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalPayments: 0,
    totalRevenue: 0,
    completedPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    averageTransaction: 0,
    thisMonthRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const paymentsCollection = collection(db, 'payments');

    const unsubscribe = onSnapshot(paymentsCollection, (snapshot) => {
      const paymentsData: Payment[] = [];
      let totalRevenue = 0;
      let completedCount = 0;
      let pendingCount = 0;
      let failedCount = 0;
      let thisMonthRevenue = 0;

      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

      snapshot.docs.forEach((doc) => {
        const data = doc.data() as Payment;
        paymentsData.push({ id: doc.id, ...data });

        if (data.status === 'completed') {
          totalRevenue += data.amount;
          completedCount++;

          const paymentDate = data.createdAt?.toDate?.() || new Date(data.createdAt);
          if (paymentDate >= monthAgo) {
            thisMonthRevenue += data.amount;
          }
        }

        if (data.status === 'pending') pendingCount++;
        if (data.status === 'failed') failedCount++;
      });

      const sortedPayments = paymentsData.sort((a, b) => {
        const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return bDate - aDate;
      });

      setPayments(sortedPayments);
      setStats({
        totalPayments: paymentsData.length,
        totalRevenue,
        completedPayments: completedCount,
        pendingPayments: pendingCount,
        failedPayments: failedCount,
        averageTransaction: completedCount > 0 ? totalRevenue / completedCount : 0,
        thisMonthRevenue,
      });

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const statusColors = {
    completed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 text-sm font-medium">Total Revenue</p>
              <p className="text-4xl font-bold text-green-900 mt-2">₦{stats.totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-green-700 mt-2">This Month: ₦{stats.thisMonthRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 text-sm font-medium">Completed Payments</p>
              <p className="text-4xl font-bold text-blue-900 mt-2">{stats.completedPayments}</p>
              <p className="text-xs text-blue-700 mt-2">Avg: ₦{stats.averageTransaction.toFixed(2)}</p>
            </div>
            <CreditCard className="w-10 h-10 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 text-sm font-medium">Payment Status</p>
              <p className="text-4xl font-bold text-purple-900 mt-2">{stats.totalPayments}</p>
              <p className="text-xs text-purple-700 mt-2">
                Pending: {stats.pendingPayments} | Failed: {stats.failedPayments}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-400" />
          </div>
        </motion.div>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-gray-200 rounded-lg p-4"
        >
          <p className="text-gray-600 text-sm font-medium">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPayments}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-gray-200 rounded-lg p-4"
        >
          <p className="text-gray-600 text-sm font-medium">Avg Transaction Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">₦{stats.averageTransaction.toFixed(2)}</p>
        </motion.div>
      </div>

      {/* Payments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white border border-gray-200 rounded-lg overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Recent Payments</h3>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading payments...</div>
        ) : payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">User ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 10).map((payment, i) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + i * 0.05 }}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {payment.createdAt?.toDate?.()?.toLocaleDateString()} 
                      {payment.createdAt?.toDate?.()?.toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{payment.userId.substring(0, 12)}...</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{payment.description || 'Subscription'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {payment.currency} {payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[payment.status]}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-600">No payments found</div>
        )}
      </motion.div>
    </div>
  );
}
