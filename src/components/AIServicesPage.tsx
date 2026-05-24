import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Cpu, Loader2, AlertCircle, ShoppingCart } from 'lucide-react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';

interface AIService {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  image?: string;
  description?: string;
  duration?: string;
  email?: string;
  userId?: string;
  createdAt?: any;
}

export const AIServicesPage = () => {
  const [services, setServices] = useState<AIService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch from Firestore "aiServices" collection
        const servicesCollection = collection(db, 'aiServices');
        const q = query(servicesCollection);
        const querySnapshot = await getDocs(q);

        const fetchedServices = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as AIService));

        setServices(fetchedServices);
      } catch (err: any) {
        console.error('Error fetching AI services:', err);
        setError(err.message || 'Failed to load AI services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading AI Services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
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
        <p className="text-gray-600 dark:text-gray-400">No AI services available at the moment.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-8"
    >
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
          AI Tools Services
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore our collection of AI-powered services
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group"
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col">
              {/* Image Container */}
              <div className="relative w-full h-72 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                {(service.imageUrl || service.image) ? (
                  <img
                    src={service.imageUrl || service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.error('Image failed to load:', service.imageUrl || service.image);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                    loading="lazy"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Cpu className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">No image</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Content Container */}
              <div className="p-6 space-y-5 flex-1 flex flex-col">
                {/* Name */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                    {service.name}
                  </h3>
                </div>

                {/* Description */}
                {service.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 flex-1">
                    {service.description}
                  </p>
                )}

                {/* Duration and Email */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {service.duration && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                      <p className="text-gray-500 dark:text-gray-400">Duration</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{service.duration}</p>
                    </div>
                  )}
                  {service.email && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                      <p className="text-gray-500 dark:text-gray-400">Vendor</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-[10px] truncate">{service.email}</p>
                    </div>
                  )}
                </div>

                {/* Price and Button */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      ₦{typeof service.price === 'number' ? service.price.toFixed(2) : service.price}
                    </p>
                  </div>
                  <button
                    className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
                    title="Add to cart"
                  >
                    <ShoppingCart className="w-6 h-6" />
                  </button>
                </div>

                {/* Metadata */}
                {(service.createdAt || service.userId) && (
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1 text-[10px] text-gray-400 dark:text-gray-500">
                    {service.createdAt && (
                      <p>
                        Posted: {new Date(service.createdAt.seconds * 1000).toLocaleDateString()}
                      </p>
                    )}
                    {service.userId && (
                      <p className="truncate" title={service.userId}>
                        ID: {service.userId.substring(0, 12)}...
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
