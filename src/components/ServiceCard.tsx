import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, Rocket, ChevronRight } from 'lucide-react';

export function ServiceCard({ service, onOrder, balance }: any) {
  const [quantity, setQuantity] = useState(parseInt(service.min));
  const [link, setLink] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const cost = (parseFloat(service.rate) / 1000) * quantity;
  const canAfford = balance >= cost;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 space-y-6 group relative overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-bl-[100px] -z-10 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 transition-colors" />
      
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400">Node ID: {service.service}</span>
          </div>
          <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight pr-4">{service.name}</h4>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400">Rate/1k</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">${parseFloat(service.rate).toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-400 ml-1">Quantity</label>
            <div className="relative">
              <input 
                type="number" 
                min={service.min}
                max={service.max}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full h-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-mono text-gray-400 uppercase">Units</div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-400 ml-1">Est. Cost</label>
            <div className={`w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl h-12 flex items-center px-4 text-sm font-bold ${canAfford ? 'text-gray-900 dark:text-gray-100' : 'text-red-500'}`}>
              ${cost.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-400 ml-1">Target Infrastructure URL</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Enter destination URL..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full h-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
          className={`w-full h-14 flex items-center justify-center gap-3 rounded-xl font-bold text-white transition-all shadow-lg ${
            !canAfford || !link 
              ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
          }`}
        >
          {isOrdering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
          <span className="text-[11px] font-mono uppercase tracking-[0.2em]">
            {canAfford ? 'Deploy Infrastructure' : 'Insufficient Credits'}
          </span>
        </button>

        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center justify-center gap-2"
        >
          {showDetails ? 'Hide Technical Specs' : 'View Technical Specs'}
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
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[8px] font-mono uppercase text-gray-400">Minimum Load</p>
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{service.min}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] font-mono uppercase text-gray-400">Maximum Load</p>
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{service.max}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] font-mono uppercase text-gray-400">Refill Protocol</p>
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{service.refill ? 'Enabled' : 'Disabled'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] font-mono uppercase text-gray-400">Cancellation</p>
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{service.cancel ? 'Available' : 'Restricted'}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
