import React from 'react';
import { motion } from 'motion/react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { ServiceCard } from './ServiceCard';

interface ServicesViewProps {
  servicesLoading: boolean;
  servicesError: string | null;
  services: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string) => void;
  placeOrder: any;
  balance: number;
}

export const ServicesView = ({
  servicesLoading,
  servicesError,
  services,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  placeOrder,
  balance
}: ServicesViewProps) => {
  if (servicesLoading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.3em]">Initializing Catalog...</p>
      </div>
    );
  }

  if (servicesError) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Catalog Connection Failed</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">{servicesError}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-blue-700 transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full space-y-10"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Deployment Catalog</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md">Select from our proprietary engagement infrastructures. All deployments are monitored for quality and delivery speed.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search capabilities (e.g. Instagram, Followers)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
          {Object.keys(services).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-8 py-4 rounded-2xl text-[10px] font-mono uppercase tracking-[0.2em] whitespace-nowrap transition-all border ${
                selectedCategory === cat 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-900/20' 
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {selectedCategory && services[selectedCategory]
            ?.filter((s: any) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((service: any) => (
              <ServiceCard key={service.service} service={service} onOrder={placeOrder} balance={balance} />
            ))}
        </div>
      </div>
    </motion.div>
  );
};
