import React from 'react';
import { X, Mail, User as UserIcon, Calendar, CreditCard } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  balance?: number;
}

export const UserProfileModal = ({ isOpen, onClose, user, balance }: UserProfileModalProps) => {
  if (!isOpen) return null;

  const createdDate = user?.metadata?.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : 'Unknown';

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl z-50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Profile Information</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <UserIcon className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-4">
            {/* Email */}
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Email</span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 break-all">
                {user?.email || 'Not available'}
              </p>
            </div>

            {/* Balance */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Available Balance</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ₦{balance?.toFixed(2) || '0.00'}
              </p>
            </div>

            {/* Account Creation Date */}
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Account Created</span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {createdDate}
              </p>
            </div>

            {/* User ID */}
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <UserIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">User ID</span>
              </div>
              <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
                {user?.uid || 'Not available'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};
