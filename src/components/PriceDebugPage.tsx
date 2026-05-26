import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export const PriceDebugPage = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/services');
        const data = await response.json();
        
        // Get first 5 services from first category
        const firstCategory = Object.keys(data)[0];
        if (firstCategory) {
          const firstFiveServices = data[firstCategory].slice(0, 5);
          setServices(firstFiveServices);
          
          console.log('=== PRICE MARKUP DEBUG ===');
          firstFiveServices.forEach((service: any) => {
            console.log(`Service: ${service.name}`);
            console.log(`  Original Rate: ${service.originalRate}`);
            console.log(`  Marked Up Rate: ${service.rate}`);
            console.log(`  Markup Amount: ${service.markup}`);
            console.log(`  Calculated (original * 1.2): ${parseFloat(service.originalRate) * 1.2}`);
            console.log('---');
          });
        }
        setError(null);
      } catch (err: any) {
        console.error('Error fetching services:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Price Debug</h1>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors disabled:opacity-50 p-2"
          title="Refresh page"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle className="h-5 w-5 text-blue-600" />
          <p className="font-semibold text-blue-900 dark:text-blue-100">Price Markup Test</p>
        </div>
        <p className="text-sm text-blue-800 dark:text-blue-200">Showing first 5 services with original and marked-up rates</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 text-left text-sm font-semibold">Service Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Original Rate</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Marked Up Rate (20%)</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Markup Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {services.map((service, idx) => {
              const original = parseFloat(service.originalRate);
              const markedUp = parseFloat(service.rate);
              const expected = original * 1.2;
              const isCorrect = Math.abs(markedUp - expected) < 0.01;

              return (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 text-sm">{service.name}</td>
                  <td className="px-4 py-3 text-sm font-mono">₦{original.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm font-mono">₦{markedUp.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm font-mono">₦{service.markup}</td>
                  <td className="px-4 py-3">
                    {isCorrect ? (
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-sm font-medium">
                        ✓ Correct
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-sm font-medium">
                        ✗ Error
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
          Open browser console (F12) to see detailed logs with each service's calculation
        </p>
      </div>
    </div>
  );
};
