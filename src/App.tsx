/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bell, Cpu, Megaphone, Rocket } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const packages = [
    {
      title: "Boosting Plans",
      icon: <Rocket className="w-8 h-8 text-blue-400" />,
      description: "Accelerate your growth with our strategic scaling solutions.",
      features: ["Strategic Analysis", "Performance Tracking", "Growth Optimization"]
    },
    {
      title: "AI TOOLS",
      icon: <Cpu className="w-8 h-8 text-purple-400" />,
      description: "Cutting-edge artificial intelligence to automate and enhance your workflow.",
      features: ["Custom AI Models", "Data Insights", "Process Automation"]
    },
    {
      title: "Marketing & Promotions",
      icon: <Megaphone className="w-8 h-8 text-emerald-400" />,
      description: "Reach your target audience with high-impact promotional campaigns.",
      features: ["Social Media Strategy", "Content Creation", "Ad Management"]
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex flex-col items-center">
        {/* Logo Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          {/* Replace this placeholder with your actual logo path if uploaded */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 relative group">
              <div className="absolute inset-0 bg-white/10 blur-xl rounded-full group-hover:bg-white/20 transition-all duration-500" />
              <img 
                src="https://picsum.photos/seed/jt-tech/400/400" 
                alt="JT Technologies Logo" 
                className="w-full h-full object-contain relative z-10 grayscale brightness-150"
                referrerPolicy="no-referrer"
              />
            </div>
            <h2 className="text-xl font-light tracking-[0.3em] uppercase opacity-80">JT Technologies</h2>
          </div>
        </motion.div>

        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex items-center gap-6 mb-20"
        >
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase italic leading-none">
            Packages
          </h1>
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
          >
            <Bell className="w-12 h-12 md:w-20 md:h-20 text-white fill-white/10" strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {packages.map((pkg, idx) => (
            <motion.div
              key={pkg.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1, duration: 0.6 }}
              whileHover={{ y: -10 }}
              className="group relative"
            >
              {/* Glassmorphism Container */}
              <div className="h-full p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl overflow-hidden transition-all duration-300 group-hover:bg-white/[0.06] group-hover:border-white/20 shadow-2xl">
                {/* Decorative Gradient */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 blur-3xl rounded-full group-hover:bg-white/10 transition-colors" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-6 p-4 w-fit rounded-2xl bg-white/5 border border-white/10">
                    {pkg.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 tracking-tight uppercase italic">
                    {pkg.title}
                  </h3>
                  
                  <p className="text-white/60 mb-8 leading-relaxed">
                    {pkg.description}
                  </p>

                  <ul className="mt-auto space-y-3">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm font-medium text-white/80">
                        <div className="w-1 h-1 rounded-full bg-white/40" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button className="mt-10 w-full py-4 rounded-xl bg-white text-black font-bold text-sm uppercase tracking-widest hover:bg-white/90 transition-colors active:scale-95">
                    Explore Plan
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-32 pt-12 border-t border-white/10 w-full flex flex-col md:flex-row justify-between items-center gap-8 text-white/40 text-xs uppercase tracking-[0.2em]"
        >
          <p>© 2026 JT Technologies. All Rights Reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </motion.footer>
      </main>
    </div>
  );
}
