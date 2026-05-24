import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Clock, MessageSquare } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface Complaint {
  id: string;
  name: string;
  email: string;
  complaint: string;
  status: 'pending' | 'resolved';
  adminResponse?: string;
  createdAt: any;
  resolvedAt?: any;
}

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  onPendingCountChange?: (count: number) => void;
}

export const NotificationsPanel = ({ isOpen, onClose, userEmail, onPendingCountChange }: NotificationsPanelProps) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userEmail) return;

    setLoading(true);
    // Set up real-time listener for complaints
    const complaintsCollection = collection(db, 'complaints');
    const q = query(complaintsCollection, where('email', '==', userEmail));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const complaintsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Complaint));

      // Sort by created date (newest first)
      complaintsData.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

      setComplaints(complaintsData);
      
      // Count pending complaints and notify parent
      const pendingCount = complaintsData.filter(c => c.status === 'pending').length;
      onPendingCountChange?.(pendingCount);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching complaints:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userEmail, onPendingCountChange]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">My Complaints</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-spin" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
              </div>
            </div>
          ) : complaints.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-6">
                <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No complaints yet</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-6">
              {complaints.map((complaint) => (
                <div 
                  key={complaint.id}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    {complaint.status === 'resolved' ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400">Resolved</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">Pending</span>
                      </>
                    )}
                  </div>

                  {/* Complaint Text */}
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                    {complaint.complaint}
                  </p>

                  {/* Admin Response */}
                  {complaint.adminResponse && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                      <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">Admin Response:</p>
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        {complaint.adminResponse}
                      </p>
                    </div>
                  )}

                  {/* Date */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    {complaint.createdAt?.seconds 
                      ? new Date(complaint.createdAt.seconds * 1000).toLocaleDateString()
                      : 'Unknown date'
                    }
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 text-center">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total complaints: {complaints.length}
            </p>
            <div className="flex items-center justify-center gap-4 text-xs">
              <span className="text-yellow-600 dark:text-yellow-400">
                Pending: {complaints.filter(c => c.status === 'pending').length}
              </span>
              <span className="text-green-600 dark:text-green-400">
                Resolved: {complaints.filter(c => c.status === 'resolved').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
