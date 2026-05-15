import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { ServicesForSaleCard } from './ServicesForSaleCard';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface FeaturedServicesSectionProps {
  onViewAllServices?: () => void;
  onAddToCart?: (service: any) => void;
}

export const FeaturedServicesSection = ({
  onViewAllServices,
  onAddToCart
}: FeaturedServicesSectionProps) => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);

        // Query the 'services' collection, limit to 6 items
        const servicesCollection = collection(db, 'services');
        const q = query(servicesCollection, limit(6));
        const querySnapshot = await getDocs(q);

        const fetchedServices = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setServices(fetchedServices);
      } catch (err: any) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-200">Error loading services</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="p-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-center">
        <p className="text-gray-600 dark:text-gray-400">No services available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Featured Services
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Popular services available for purchase
          </p>
        </div>
        {services.length > 0 && (
          <button
            onClick={onViewAllServices}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Services Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <ServicesForSaleCard
              service={service}
              onAddToCart={onAddToCart}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
