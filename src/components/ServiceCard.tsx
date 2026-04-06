import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, ChevronRight, ShoppingCart } from 'lucide-react';

export function ServiceCard({ service, onOrder, balance }: any) {
  const [quantity, setQuantity] = useState(parseInt(service.min));
  const [link, setLink] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const cost = (parseFloat(service.rate) / 1000) * quantity;
  const canAfford = balance >= cost;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-medium text-gray-500">Service ID: {service.service}</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-snug pr-4">{service.name}</h4>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-gray-500">Rate / 1,000</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">₦{parseFloat(service.rate).toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 ml-1">Quantity</label>
            <div className="relative">
              <input 
                type="number" 
                min={service.min}
                max={service.max}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full h-11 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">Units</div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 ml-1">Estimated cost</label>
            <div className={`w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg h-11 flex items-center px-3 text-sm font-semibold ${canAfford ? 'text-gray-900 dark:text-gray-100' : 'text-red-500'}`}>
              ₦{cost.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-300 ml-1">Link to post / profile</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Enter destination URL..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full h-11 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 flex flex-col gap-4">
        <button 
          disabled={!canAfford || !link || isOrdering}
          onClick={async () => {
            setIsOrdering(true);
            await onOrder(service.service, quantity, link);
            setIsOrdering(false);
            setLink('');
          }}
          className={`w-full h-11 flex items-center justify-center gap-2 rounded-lg font-medium text-white text-sm transition-all shadow ${
            !canAfford || !link 
              ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
          }`}
        >
          {isOrdering ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
          <span>
            {canAfford ? 'Place order' : 'Insufficient balance'}
          </span>
        </button>

        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center justify-center gap-1"
        >
          {showDetails ? 'Hide details' : 'View details'}
          <ChevronRight className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-5 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <p className="text-[11px] text-gray-500">Minimum quantity</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{service.min}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] text-gray-500">Maximum quantity</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{service.max}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] text-gray-500">Refill</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{service.refill ? 'Available' : 'Not available'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] text-gray-500">Cancelable</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{service.cancel ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
