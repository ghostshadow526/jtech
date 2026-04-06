"use client"
import React, { useState, useEffect } from "react";
import {
  Home,
  DollarSign,
  Monitor,
  ShoppingCart,
  Tag,
  BarChart3,
  Users,
  ChevronDown,
  ChevronsRight,
  Moon,
  Sun,
  TrendingUp,
  Activity,
  Package,
  Bell,
  Settings,
  HelpCircle,
  User,
  LogOut,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: any;
  balance: number;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const DashboardLayout = ({ 
  children, 
  user, 
  balance, 
  onLogout, 
  activeTab, 
  setActiveTab 
}: DashboardLayoutProps) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className={`flex min-h-screen w-full ${isDark ? 'dark' : ''}`}>
      <div className="flex w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          user={user} 
          onLogout={onLogout}
        />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <Header 
            isDark={isDark} 
            setIsDark={setIsDark} 
            user={user} 
            balance={balance}
          />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ activeTab, setActiveTab, user, onLogout }: any) => {
  const [open, setOpen] = useState(true);

  return (
    <nav
      className={`sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out ${
        open ? 'w-64' : 'w-16'
      } border-gray-900 dark:border-gray-900 bg-black dark:bg-black p-2 shadow-sm flex flex-col`}
    >
      <TitleSection open={open} user={user} />

      <div className="space-y-1 flex-1">
        <Option
          Icon={Home}
          title="Dashboard"
          selected={activeTab}
          setSelected={setActiveTab}
          open={open}
        />
        <Option
          Icon={ShoppingCart}
          title="Services"
          selected={activeTab}
          setSelected={setActiveTab}
          open={open}
        />
        <Option
          Icon={Package}
          title="Orders"
          selected={activeTab}
          setSelected={setActiveTab}
          open={open}
        />
        <Option
          Icon={DollarSign}
          title="Add Funds"
          selected={activeTab}
          setSelected={setActiveTab}
          open={open}
        />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 pt-4 pb-16 space-y-1">
        <Option
          Icon={LogOut}
          title="Logout"
          selected={activeTab}
          setSelected={() => onLogout()}
          open={open}
        />
      </div>

      <ToggleClose open={open} setOpen={setOpen} />
    </nav>
  );
};

const Option = ({ Icon, title, selected, setSelected, open, notifs }: any) => {
  const isSelected = selected === title;
  
  return (
    <button
      onClick={() => setSelected(title)}
      className={`relative flex h-11 w-full items-center rounded-md transition-all duration-200 ${
        isSelected 
          ? "bg-gray-800 text-white shadow-sm border-l-2 border-white" 
          : "text-gray-300 hover:bg-gray-900 hover:text-white"
      }`}
    >
      <div className="grid h-full w-12 place-content-center">
        <Icon className="h-4 w-4" />
      </div>
      
      {open && (
        <span
          className={`text-sm font-medium transition-opacity duration-200 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {title}
        </span>
      )}

      {notifs && open && (
        <span className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 dark:bg-blue-600 text-xs text-white font-medium">
          {notifs}
        </span>
      )}
    </button>
  );
};

const TitleSection = ({ open, user }: any) => {
  return (
    <div className="mb-6 border-b border-gray-800 pb-4">
      <div className="flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-gray-900">
        <div className="flex items-center gap-3">
          <Logo />
          {open && (
            <div className={`transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center gap-2">
                <div>
                  <span className="block text-sm font-semibold text-gray-100 truncate max-w-[120px]">
                    {user?.email?.split('@')[0] || 'User'}
                  </span>
                  <span className="block text-xs text-gray-400">
                    Pro Plan
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        {open && (
          <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        )}
      </div>
    </div>
  );
};

const Logo = () => {
  return (
    <div className="grid size-10 shrink-0 place-content-center rounded-lg bg-gray-900 text-white shadow-sm">
      <svg
        width="20"
        height="auto"
        viewBox="0 0 50 39"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="fill-white"
      >
        <path
          d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z"
        />
        <path
          d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z"
        />
      </svg>
    </div>
  );
};

const ToggleClose = ({ open, setOpen }: any) => {
  return (
    <button
      onClick={() => setOpen(!open)}
      className="absolute bottom-0 left-0 right-0 border-t border-gray-800 transition-colors hover:bg-gray-900"
    >
      <div className="flex items-center p-3">
        <div className="grid size-10 place-content-center">
          <ChevronsRight
            className={`h-4 w-4 transition-transform duration-300 text-gray-500 dark:text-gray-400 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
        {open && (
          <span
            className={`text-sm font-medium text-gray-600 dark:text-gray-300 transition-opacity duration-200 ${
              open ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Hide
          </span>
        )}
      </div>
    </button>
  );
};

const Header = ({ isDark, setIsDark, user, balance }: any) => {
  return (
    <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">SMM Panel</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {user?.email}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end mr-4">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Balance</span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">₦{balance.toFixed(2)}</span>
        </div>
        <button className="relative p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        <button
          onClick={() => setIsDark(!isDark)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          {isDark ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>
        <button className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
          <User className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default DashboardLayout;
