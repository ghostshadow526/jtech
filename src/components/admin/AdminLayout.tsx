import { BarChart3, Users, CreditCard, Package, LogOut } from 'lucide-react';
import React, { useState } from 'react';
import { motion } from 'motion/react';
import type { User } from '../../firebase';
import { auth } from '../../firebase';

interface AdminLayoutProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export function AdminLayout({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  children,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'registrations', label: 'Registrations', icon: Users },
    { id: 'payments', label: 'Payments & Revenue', icon: CreditCard },
    { id: 'tools', label: 'AI Tools', icon: Package },
  ];

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`${
          sidebarOpen ? 'w-72' : 'w-20'
        } bg-gray-400 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-500 flex items-center justify-between">
          {sidebarOpen && <h2 className="text-xl font-bold">JT Admin</h2>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hover:bg-gray-500 p-1 rounded">
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-200 hover:bg-gray-500'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-500 space-y-3">
          {sidebarOpen && (
            <div className="text-xs text-gray-300">
              <p className="font-semibold mb-1">Logged in as</p>
              <p className="truncate">{user?.email}</p>
            </div>
          )}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 bg-white overflow-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {menuItems.find((item) => item.id === activeTab)?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">Welcome back!</div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
