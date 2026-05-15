import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap, Brain, Cpu, Sparkles, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export const AIServicesPage = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        // Placeholder for AI services data
        // You can replace this with actual API calls to fetch AI services
        const aiServices = [
          {
            id: 1,
            name: 'AI Content Generator',
            description: 'Generate high-quality content with advanced AI models',
            icon: Brain,
            features: ['Multi-language support', 'SEO optimized', 'Real-time editing'],
            color: 'blue'
          },
          {
            id: 2,
            name: 'Automation Engine',
            description: 'Automate repetitive tasks with intelligent workflows',
            icon: Cpu,
            features: ['Custom workflows', 'Integration ready', 'Real-time monitoring'],
            color: 'purple'
          },
          {
            id: 3,
            name: 'Analytics Pro',
            description: 'Get deep insights from your data with AI-powered analysis',
            icon: Zap,
            features: ['Predictive analytics', 'Custom reports', 'Real-time dashboards'],
            color: 'orange'
          },
          {
            id: 4,
            name: 'Smart Optimization',
            description: 'Optimize your campaigns with machine learning',
            icon: Sparkles,
            features: ['Auto-optimization', 'Performance tracking', 'A/B testing'],
            color: 'green'
          }
        ];
        setServices(aiServices);
      } catch (err: any) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-12"
    >
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium">
          <Sparkles className="w-3 h-3" />
          <span>Powered by Advanced AI</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
          AI Services
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
          Harness the power of artificial intelligence to transform your business. Our suite of AI services helps you automate, analyze, and optimize at scale.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service, index) => {
          const Icon = service.icon;
          const colorSchemes = {
            blue: {
              bg: 'bg-blue-50 dark:bg-blue-900/20',
              border: 'border-blue-200 dark:border-blue-900/30',
              icon: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
              button: 'bg-blue-600 hover:bg-blue-700 text-white'
            },
            purple: {
              bg: 'bg-purple-50 dark:bg-purple-900/20',
              border: 'border-purple-200 dark:border-purple-900/30',
              icon: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
              button: 'bg-purple-600 hover:bg-purple-700 text-white'
            },
            orange: {
              bg: 'bg-orange-50 dark:bg-orange-900/20',
              border: 'border-orange-200 dark:border-orange-900/30',
              icon: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
              button: 'bg-orange-600 hover:bg-orange-700 text-white'
            },
            green: {
              bg: 'bg-green-50 dark:bg-green-900/20',
              border: 'border-green-200 dark:border-green-900/30',
              icon: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400',
              button: 'bg-green-600 hover:bg-green-700 text-white'
            }
          };

          const colors = colorSchemes[service.color as keyof typeof colorSchemes];

          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`p-6 rounded-xl border-2 ${colors.border} ${colors.bg} transition-all hover:shadow-lg hover:-translate-y-1 duration-300`}
            >
              <div className={`w-12 h-12 rounded-lg ${colors.icon} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {service.name}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {service.description}
              </p>

              <div className="space-y-3 mb-6">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Key Features</p>
                <ul className="space-y-2">
                  {service.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button className={`w-full px-4 py-2.5 rounded-lg ${colors.button} font-semibold text-sm transition-all flex items-center justify-center gap-2 group`}>
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Transform Your Workflow?
        </h2>
        <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
          Start using our AI services today and experience the future of intelligent automation.
        </p>
        <button className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg">
          Explore All Services
        </button>
      </motion.div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-center"
        >
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">10,000+</p>
          <p className="text-gray-600 dark:text-gray-400">Active Users</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-center"
        >
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">99.9%</p>
          <p className="text-gray-600 dark:text-gray-400">Uptime Guarantee</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-center"
        >
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">24/7</p>
          <p className="text-gray-600 dark:text-gray-400">Support Available</p>
        </motion.div>
      </div>
    </motion.div>
  );
};
