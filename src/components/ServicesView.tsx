import React from 'react';
import { motion } from 'motion/react';
import { Search, Loader2, AlertCircle, Grid3X3, ChevronDown } from 'lucide-react';
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
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

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

  const categories = Object.keys(services);
  const categoriesScrollRef = React.useRef<HTMLDivElement | null>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    const node = categoriesScrollRef.current;
    if (!node) return;
    const amount = 260;
    node.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full space-y-10"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium">
            <Grid3X3 className="w-3 h-3" />
            <span>Service catalog</span>
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Available services</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md">Browse services by category, filter with search, and place orders in a few clicks.</p>
          </div>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search capabilities (e.g. Instagram, Followers)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="relative">
          <div ref={dropdownRef} className="relative w-full md:w-64">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-5 py-3 rounded-lg text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-700 transition-all"
            >
              <span>{selectedCategory || 'Select a category'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto"
              >
                {Object.keys(services).length > 0 ? (
                  Object.keys(services).map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-5 py-3 text-left text-sm transition-all border-b border-gray-100 dark:border-gray-800 last:border-b-0 ${
                        selectedCategory === cat 
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))
                ) : (
                  <div className="py-8 text-center text-gray-500 text-sm">
                    No categories available
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {selectedCategory && services[selectedCategory]
            ?.filter((s: any) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((service: any) => (
              <ServiceCard key={service.service} service={service} onOrder={placeOrder} balance={balance} />
            ))
          }
          {selectedCategory && (!services[selectedCategory] || services[selectedCategory].length === 0) && (
            <div className="col-span-full py-12 text-center text-gray-500">
              No services found in this category
            </div>
          )}
          {!selectedCategory && categories.length > 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              Select a category to view services
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
