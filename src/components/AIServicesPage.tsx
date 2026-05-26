import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Loader2, AlertCircle, ShoppingCart, RefreshCw } from 'lucide-react';
import { collection, getDocs, query, doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

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

interface AIServicesPageProps {
  onNavigate?: (view: string) => void;
}

export const AIServicesPage = ({ onNavigate }: AIServicesPageProps) => {
  const [services, setServices] = useState<AIService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [selectedService, setSelectedService] = useState<AIService | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  // Fetch user balance
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setBalance(snapshot.data().balance || 0);
      }
    }, (error) => {
      console.error('Error fetching balance:', error);
    });

    return () => unsubscribe();
  }, [user?.uid]);

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

  const handlePurchase = async (service: AIService) => {
    if (!user) {
      setError('Please log in to purchase services');
      return;
    }

    if (balance < service.price) {
      setError('please top up your acct');
      return;
    }

    setIsProcessing(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        balance: increment(-service.price),
      });

      const message = encodeURIComponent(
        `Hello, I have made payment for the ${service.name} AI tool.`
      );
      const whatsappUrl = `https://wa.me/2347013341935?text=${message}`;
      window.location.href = whatsappUrl;

      setError(null);
    } catch (err: any) {
      setError(`Error processing purchase: ${err.message}`);
      console.error('Purchase error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

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

  if (error && services.length === 0) {
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
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            AI Tools Services
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore our collection of AI-powered services
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors disabled:opacity-50 p-2"
          title="Refresh page"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error/Info Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/20 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-amber-700 dark:text-amber-300">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
          >
            ×
          </button>
        </motion.div>
      )}

      {/* User Balance Info */}
      {user && (
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Your available balance: <span className="font-bold">₦{balance.toFixed(2)}</span>
          </p>
        </div>
      )}

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

                {/* Duration */}
                {service.duration && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-xs">
                    <p className="text-gray-500 dark:text-gray-400">Duration</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{service.duration}</p>
                  </div>
                )}

                {/* Price and Button */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      ₦{typeof service.price === 'number' ? service.price.toFixed(2) : service.price}
                    </p>
                  </div>
                  <button
                    onClick={() => handlePurchase(service)}
                    disabled={isProcessing}
                    className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
                    title={balance >= service.price ? 'Purchase now' : 'Add funds to purchase'}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <ShoppingCart className="w-6 h-6" />
                    )}
                  </button>
                </div>

                {/* Metadata */}
                {service.createdAt && (
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 dark:text-gray-500">
                    <p>
                      Posted: {new Date(service.createdAt.seconds * 1000).toLocaleDateString()}
                    </p>
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
