import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Mail, User, Calendar, CheckCircle2, Shield, ShieldOff } from 'lucide-react';

interface Registration {
  id: string;
  email: string;
  uid: string;
  createdAt: any;
  displayName?: string;
  isAdmin?: boolean;
}

interface RegistrationStats {
  totalRegistrations: number;
  thisMonth: number;
  thisWeek: number;
  today: number;
}

export function RegistrationsSection() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<RegistrationStats>({
    totalRegistrations: 0,
    thisMonth: 0,
    thisWeek: 0,
    today: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [assigningAdmin, setAssigningAdmin] = useState<string | null>(null);

  const handleAssignAdmin = async (userId: string, currentStatus: boolean) => {
    setAssigningAdmin(userId);
    try {
      await updateDoc(doc(db, 'users', userId), {
        isAdmin: !currentStatus,
      });
    } catch (error) {
      console.error('Error assigning admin status:', error);
      alert('Failed to update admin status');
    } finally {
      setAssigningAdmin(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    const usersCollection = collection(db, 'users');

    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
      const regsData: Registration[] = [];
      let thisMonth = 0;
      let thisWeek = 0;
      let today = 0;

      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      snapshot.docs.forEach((doc) => {
        const data = doc.data() as Registration;
        regsData.push({ id: doc.id, ...data });

        const createdDate = data.createdAt?.toDate?.() || new Date(data.createdAt);
        if (createdDate >= monthAgo) thisMonth++;
        if (createdDate >= weekAgo) thisWeek++;
        if (createdDate >= todayStart) today++;
      });

      setRegistrations(regsData.sort((a, b) => {
        const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return bDate - aDate;
      }));

      setStats({
        totalRegistrations: regsData.length,
        thisMonth,
        thisWeek,
        today,
      });

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredRegistrations = registrations.filter((reg) =>
    reg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (reg.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  );

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Registrations', value: stats.totalRegistrations, icon: CheckCircle2 },
          { label: 'This Month', value: stats.thisMonth, icon: Calendar },
          { label: 'This Week', value: stats.thisWeek, icon: Calendar },
          { label: 'Today', value: stats.today, icon: Calendar },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <stat.icon className="w-8 h-8 text-gray-400" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white border border-gray-200 rounded-lg p-8"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-6">Registration Trend</h3>
        <div className="h-64 flex items-end justify-around gap-2 bg-gray-50 rounded-lg p-4">
          {[65, 45, 78, 52, 88, 72, 95].map((height, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
              className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg hover:shadow-lg transition-shadow"
              title={`Day ${i + 1}: ${height} registrations`}
            />
          ))}
        </div>
      </motion.div>

      {/* Registrations Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-gray-200 rounded-lg overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Registrations</h3>
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading registrations...</div>
        ) : filteredRegistrations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">User ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((reg, i) => (
                  <motion.tr
                    key={reg.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{reg.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{reg.displayName || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{reg.uid.substring(0, 12)}...</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {reg.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleAssignAdmin(reg.id, reg.isAdmin || false)}
                        disabled={assigningAdmin === reg.id}
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg font-semibold transition-all text-sm ${
                          reg.isAdmin
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {reg.isAdmin ? (
                          <>
                            <ShieldOff className="w-4 h-4" />
                            Remove Admin
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4" />
                            Make Admin
                          </>
                        )}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-600">No registrations found</div>
        )}
      </motion.div>
    </div>
  );
}
