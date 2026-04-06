import React from 'react';
import { motion } from 'motion/react';
import { Search, Loader2, AlertCircle, Grid3X3, ChevronLeft, ChevronRight } from 'lucide-react';
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
  React.useEffect(() => {
    console.log("ServicesView - services:", Object.keys(services).length, "categories");
    console.log("ServicesView - selectedCategory:", selectedCategory);
    console.log("ServicesView - servicesLoading:", servicesLoading);
    console.log("ServicesView - servicesError:", servicesError);
  }, [services, selectedCategory, servicesLoading, servicesError]);

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
        <div className="relative -mx-2 px-8">
          <button
            type="button"
            onClick={() => scrollCategories('left')}
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black transition-colors"
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollCategories('right')}
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black transition-colors"
            aria-label="Scroll categories right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div
            ref={categoriesScrollRef}
            className="flex gap-3 overflow-x-auto pb-3 no-scrollbar"
          >
          {categories.length > 0 ? (
            categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs whitespace-nowrap transition-all border ${
                  selectedCategory === cat 
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm' 
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-400'
                }`}
              >
                {cat}
              </button>
            ))
          ) : (
            <div className="w-full py-8 text-center text-gray-500">
              No categories available. Services may still be loading...
            </div>
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
