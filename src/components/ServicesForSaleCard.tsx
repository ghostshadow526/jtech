import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface ServicesForSaleCardProps {
  service: {
    id: string;
    name: string;
    price: number;
    image?: string;
    description?: string;
    rating?: number;
    reviews?: number;
  };
  onAddToCart?: (service: any) => void;
}

export const ServicesForSaleCard = ({ 
  service, 
  onAddToCart 
}: ServicesForSaleCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
        {service.image ? (
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <ShoppingCart className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No image</p>
            </div>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-4 space-y-3">
        {/* Name */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 h-10">
            {service.name}
          </h3>
        </div>

        {/* Description */}
        {service.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            {service.description}
          </p>
        )}

        {/* Rating */}
        {service.rating && (
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.round(service.rating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
            {service.reviews && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({service.reviews})
              </span>
            )}
          </div>
        )}

        {/* Price and Button */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              ₦{service.price.toFixed(2)}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(service);
            }}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            title="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
