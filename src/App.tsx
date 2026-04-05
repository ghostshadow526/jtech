/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bell, Cpu, Megaphone, Rocket, ArrowLeft, ArrowRight, CheckCircle2, Mail, Lock, User, ShieldCheck, LogOut, Wallet, ShoppingCart, History, Search, ChevronRight, Loader2, AlertCircle, Settings, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useInView } from 'motion/react';
import React, { useState, useEffect, useMemo } from 'react';
import { auth, db, googleProvider, signInWithPopup, onAuthStateChanged, User as FirebaseUser, handleFirestoreError, OperationType, signInWithEmailAndPassword, createUserWithEmailAndPassword } from './firebase';
import { doc, onSnapshot, setDoc, serverTimestamp, collection, query, where, orderBy } from 'firebase/firestore';
import axios from 'axios';
import { Testimonials } from './components/Testimonials';
import LoginCardSection from './components/ui/login-signup';
import { DashboardLayout } from './components/ui/dashboard-with-collapsible-sidebar';
import { DashboardHome } from './components/DashboardHome';
import { ServicesView } from './components/ServicesView';
import { OrdersView } from './components/OrdersView';
import { AddFundsView } from './components/AddFundsView';
import { SocialMediaBoostingPage } from './components/SocialMediaBoostingPage';
import { AISubscriptionsPage } from './components/AISubscriptionsPage';
import { MarketingPromotionsPage } from './components/MarketingPromotionsPage';
import { ProductsPage } from './components/ProductsPage';
import { DownloadPage } from './components/DownloadPage';
import { SolutionsPage } from './components/SolutionsPage';
import { ResourcesPage } from './components/ResourcesPage';
import { PricingPage } from './components/PricingPage';
import { AIToolsMarketplace } from './components/AIToolsMarketplace';
import { AdminLayout } from './components/admin/AdminLayout';
import { RegistrationsSection } from './components/admin/RegistrationsSection';
import { PaymentsSection } from './components/admin/PaymentsSection';
import { AIToolsSection } from './components/admin/AIToolsSection';

type View = 'home' | 'dashboard' | 'services' | 'orders' | 'profile' | 'auth' | 'billing' | 'settings' | 'help' | 'social-media-boosting' | 'ai-subscriptions' | 'marketing-promotions' | 'products' | 'download' | 'solutions' | 'resources' | 'pricing' | 'ai-tools' | 'admin';

interface SMMService {
  service: string;
  name: string;
  type: string;
  category: string;
  rate: string;
  min: string;
  max: string;
  dripfeed: boolean;
  refill: boolean;
  cancel: boolean;
  description?: string;
}

interface Order {
  id: string;
  user_id: string;
  service_id: string;
  quantity: number;
  link: string;
  smm_order_id: string;
  status: string;
  cost: number;
  createdAt: any;
}

export default function App() {
  const [view, setView] = useState<View>('home');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [services, setServices] = useState<Record<string, SMMService[]>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [adminTab, setAdminTab] = useState('registrations');

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 80);
  });

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setView('dashboard');
      } else {
        setView('home');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);

  // Balance Listener
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setBalance(snapshot.data().balance || 0);
      } else {
        // Initialize user if not exists
        setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          balance: 0,
          createdAt: serverTimestamp()
        }).catch(e => handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}`));
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}`));
    return () => unsubscribe();
  }, [user]);

  // Orders Listener
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'orders'), where('user_id', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userOrders = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Order))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(userOrders);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'orders'));
    return () => unsubscribe();
  }, [user]);

  // Fetch Services
  useEffect(() => {
    const fetchServices = async () => {
      setServicesLoading(true);
      setServicesError(null);
      try {
        const response = await axios.get('/api/services', { timeout: 15000 });
        setServices(response.data);
        const categories = Object.keys(response.data);
        if (categories.length > 0) setSelectedCategory(categories[0]);
      } catch (error: any) {
        console.error("Error fetching services", error);
        setServicesError(error.message || "Failed to fetch services. Please check your connection.");
      } finally {
        setServicesLoading(false);
      }
    };
    fetchServices();
  }, []);

  const navigateToAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthMode(mode);
    setView('auth');
  };

  const handleLogin = async (e: string, p: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, e, p);
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        setAuthError("Email/Password sign-in is not enabled. Please enable it in the Firebase Console under Authentication > Sign-in method.");
      } else {
        setAuthError(error.message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: string, p: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await createUserWithEmailAndPassword(auth, e, p);
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        setAuthError("Email/Password sign-in is not enabled. Please enable it in the Firebase Console under Authentication > Sign-in method.");
      } else {
        setAuthError(error.message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login error", error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setView('home');
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const placeOrder = async (serviceId: string, quantity: number, link: string) => {
    setOrderLoading(true);
    setOrderError(null);
    setOrderSuccess(null);
    try {
      const response = await axios.post('/api/order', {
        uid: user?.uid,
        service_id: serviceId,
        quantity,
        link
      });
      setOrderSuccess(`Order placed! ID: ${response.data.order_id}`);
    } catch (error: any) {
      setOrderError(error.response?.data?.error || "Failed to place order");
    } finally {
      setOrderLoading(false);
    }
  };

  const Logo = ({ className = "", showText = false }: { className?: string, showText?: boolean }) => (
    <motion.div 
      layoutId="main-logo"
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className={`flex items-center gap-2 group cursor-pointer ${className}`}
      onClick={() => setView('home')}
    >
      <div className="w-8 h-8 relative">
        <div className="absolute inset-0 bg-slate-900/5 blur-2xl rounded-full group-hover:bg-slate-900/10 transition-all duration-500" />
        <img 
          src="https://raw.githubusercontent.com/ghostshadow526/jtech/main/logo.png%20(4).png" 
          alt="JT Technologies Logo" 
          className="w-full h-full object-contain relative z-10"
          referrerPolicy="no-referrer"
        />
      </div>
      {showText && (
        <span className="text-lg font-bold text-brand-950 tracking-tight">JT Tech</span>
      )}
    </motion.div>
  );

  const HomeNavbar = () => (
    <nav className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-brand-100 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo showText={true} />
          <div className="hidden lg:flex items-center gap-6">
            {[
              { name: 'Product', view: 'products' },
              { name: 'Download', view: 'download' },
              { name: 'Solutions', view: 'solutions' },
              { name: 'Resources', view: 'resources' },
              { name: 'Pricing', view: 'pricing' },
            ].map((item) => (
              <button key={item.name} onClick={() => setView(item.view as View)} className="text-sm font-medium text-brand-600 hover:text-brand-950 transition-colors flex items-center gap-1">
                {item.name}
                <ChevronRight className="w-3 h-3 rotate-90" />
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => setView('ai-tools')} className="hidden sm:block text-sm font-medium text-brand-600 hover:text-brand-950 transition-colors">AI Tools</button>
          <div className="w-px h-4 bg-brand-200 hidden sm:block" />
          <button onClick={() => navigateToAuth('login')} className="text-sm font-medium text-brand-600 hover:text-brand-950 transition-colors">Log in</button>
          <button onClick={() => navigateToAuth('signup')} className="bg-brand-950 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-800 transition-all">
            Get JT Tech free
          </button>
        </div>
      </div>
    </nav>
  );

  const SubNavbar = () => (
    <div className="w-full border-b border-brand-100 bg-white sticky top-0 z-50 py-4">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Rocket className="w-4 h-4 text-notion-blue" />
          </div>
          <span className="text-lg font-bold text-brand-950">Projects</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden lg:flex items-center gap-6">
            {['Features', 'Integrations', 'Templates', 'Downloads'].map((item) => (
              <button key={item} className="text-sm font-medium text-brand-500 hover:text-brand-950 transition-colors">
                {item}
              </button>
            ))}
          </div>
          <button onClick={() => navigateToAuth('signup')} className="bg-notion-blue text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-notion-blue-hover transition-all shadow-sm">
            Get JT Tech free
          </button>
        </div>
      </div>
    </div>
  );

  const renderSidebar = () => (
    <div className="hidden lg:flex flex-col w-72 bg-white border-r border-brand-200 h-screen fixed left-0 top-0 z-50">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-10 h-10">
            <Logo />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-[0.4em] font-bold text-brand-950">JT Tech</span>
        </div>

        <nav className="space-y-2">
          {[
            { id: 'dashboard', icon: Cpu, label: 'Control Center' },
            { id: 'services', icon: ShoppingCart, label: 'Deployments' },
            { id: 'orders', icon: History, label: 'Operation Logs' },
            { id: 'profile', icon: User, label: 'Identity' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as View)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                view === item.id 
                  ? 'bg-brand-950 text-white shadow-lg shadow-brand-900/10' 
                  : 'text-brand-400 hover:bg-brand-50 hover:text-brand-950'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] font-bold">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-brand-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center overflow-hidden border border-brand-200">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-brand-400" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-brand-950 truncate max-w-[140px]">{user?.displayName || 'Operator'}</span>
            <span className="text-[9px] font-mono text-brand-400 uppercase tracking-wider">Level 1 Access</span>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] font-bold">Terminate</span>
        </button>
      </div>
    </div>
  );

  const Counter = ({ value, duration = 2 }: { value: string, duration?: number }) => {
    const [displayValue, setDisplayValue] = useState('0');
    const nodeRef = React.useRef(null);
    const isInView = useInView(nodeRef, { once: true });

    useEffect(() => {
      if (isInView) {
        // Extract number and suffix (e.g., "12k+" -> 12, "k+")
        const match = value.match(/(\d+\.?\d*)(.*)/);
        if (!match) {
          setDisplayValue(value);
          return;
        }

        const target = parseFloat(match[1]);
        const suffix = match[2];
        const startTime = performance.now();

        const update = (now: number) => {
          const elapsed = (now - startTime) / (duration * 1000);
          const progress = Math.min(elapsed, 1);
          
          // Easing function (outExpo)
          const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          const current = (target * ease).toFixed(target % 1 === 0 ? 0 : 1);
          
          setDisplayValue(`${current}${suffix}`);

          if (progress < 1) {
            requestAnimationFrame(update);
          }
        };

        requestAnimationFrame(update);
      }
    }, [isInView, value, duration]);

    return <span ref={nodeRef}>{displayValue}</span>;
  };

  const renderAuth = () => (
    <LoginCardSection 
      onLogin={handleLogin}
      onSignUp={handleSignUp}
      onGoogleLogin={handleGoogleLogin}
      isLoading={authLoading}
      error={authError || ''}
      initialMode={authMode}
    />
  );

  const renderHome = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full flex flex-col items-center bg-white"
    >
      <SubNavbar />
      
      {/* Hero Section */}
      <section className="w-full flex flex-col lg:flex-row items-center justify-between py-24 gap-12 lg:gap-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-start gap-6 text-left lg:w-[50%]"
        >
          <h1 className="text-6xl md:text-7xl xl:text-[84px] font-bold text-brand-950 leading-[1.05] tracking-tight">
            Powerful digital authority, without the chaos
          </h1>
          <p className="mt-4 text-brand-600 text-lg md:text-xl max-w-xl font-medium leading-relaxed">
            JT Technologies brings speed and clarity to your digital infrastructure with connected, AI-powered tools to manage any project from beginning to end.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button 
              onClick={() => navigateToAuth('signup')}
              className="bg-notion-blue text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-notion-blue-hover transition-all shadow-lg shadow-notion-blue/20"
            >
              Get JT Tech free
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, x: 30 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:w-[50%] relative"
        >
          <div className="relative z-10">
            <img 
              src="https://raw.githubusercontent.com/ghostshadow526/jtech/main/20260324_1712_Image%20Generation_remix_01kmh5bq8vfyr9qmxrab9ks8ym.png" 
              alt="Digital Infrastructure" 
              className="w-full h-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>
      </section>

      {/* Logo Marquee Section */}
      <section className="w-full py-12 border-y border-brand-100 bg-brand-50/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <p className="text-center text-brand-400 text-xs font-mono uppercase tracking-[0.3em] font-bold">
            Trusted by global networks
          </p>
        </div>
        <div className="relative flex overflow-hidden">
          <motion.div 
            className="flex whitespace-nowrap gap-16 items-center py-4"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
              duration: 30, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-16 items-center shrink-0">
                {[
                  "https://raw.githubusercontent.com/ghostshadow526/jtech/main/Instagram-Logo-Black-And-White-Vector-1.jpg",
                  "https://raw.githubusercontent.com/ghostshadow526/jtech/main/facebook-logo-icon-black-square-vector-29227976.avif",
                  "https://raw.githubusercontent.com/ghostshadow526/jtech/main/telegram-circle-white-logo-icon-telegram-app-editable-svg-transparent-background-premium-social-media-design-for-digital-download-free-png.webp",
                  "https://raw.githubusercontent.com/ghostshadow526/jtech/main/twitch-logo_628407-1684.avif",
                  "https://raw.githubusercontent.com/ghostshadow526/jtech/main/whatsapp-logo-png_seeklogo-168310.png",
                  "https://raw.githubusercontent.com/ghostshadow526/jtech/main/youtubbe.webp",
                  "https://raw.githubusercontent.com/ghostshadow526/jtech/main/thread.avif"
                ].map((logo, index) => (
                  <img 
                    key={`${i}-${index}`}
                    src={logo} 
                    alt="Partner Logo" 
                    className="h-10 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 object-contain shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Projects Sections */}
      <section className="w-full py-20 space-y-32">
        {/* Social Media Boosting */}
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <img 
              src="https://raw.githubusercontent.com/ghostshadow526/jtech/main/20260324_1653_Image%20Generation_remix_01kmh47s24eb4sqsqhea9d4hat.png" 
              alt="Social Media Boosting" 
              className="w-full h-auto" 
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-[10px] font-mono uppercase tracking-widest font-bold">
              <Rocket className="w-3 h-3" />
              Strategic Growth
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-950 leading-tight">
              Social Media Boosting
            </h2>
            <p className="text-brand-600 text-lg leading-relaxed">
              Our Social Media Boosting infrastructure is built on a foundation of high-authority nodes and strategic engagement patterns. We don't just provide numbers; we provide digital presence. 
            </p>
            <p className="text-brand-500 leading-relaxed">
              By leveraging our proprietary network, we amplify your content's reach, ensuring it resonates with the right audience and gains the momentum needed to trend globally. Our systems are designed to mimic organic growth, protecting your account's integrity while delivering unprecedented visibility. Whether you're looking to establish a new brand or scale an existing authority, our boosting services provide the necessary digital leverage.
            </p>
            <div className="pt-4">
              <button onClick={() => setView('social-media-boosting')} className="flex items-center gap-2 text-notion-blue font-bold hover:gap-4 transition-all">
                Learn about our network <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* AI Subscriptions */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <img 
              src="https://raw.githubusercontent.com/ghostshadow526/jtech/main/20260324_1643_Image%20Generation_remix_01kmh3n8qmfztb61ke8sh8x79b.png" 
              alt="AI Subscriptions" 
              className="w-full h-auto" 
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-[10px] font-mono uppercase tracking-widest font-bold">
              <Cpu className="w-3 h-3" />
              Neural Access
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-950 leading-tight">
              AI Subscriptions
            </h2>
            <p className="text-brand-600 text-lg leading-relaxed">
              In an era defined by machine intelligence, access to the right models is the ultimate competitive advantage. JT Technologies provides a unified gateway to the world's most advanced neural networks.
            </p>
            <p className="text-brand-500 leading-relaxed">
              From large language models for content generation to specialized image synthesis engines, our AI subscription tier puts cutting-edge technology at your fingertips. We handle the complex infrastructure and API management, providing you with a seamless, high-performance interface to the most powerful tools in the industry. Stay ahead of the curve with guaranteed access to the latest model releases and dedicated processing power.
            </p>
            <div className="pt-4">
              <button onClick={() => setView('ai-subscriptions')} className="flex items-center gap-2 text-notion-blue font-bold hover:gap-4 transition-all">
                Explore available models <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Marketing & Promotions */}
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <img 
              src="https://raw.githubusercontent.com/ghostshadow526/jtech/main/20260324_1722_Image%20Generation_remix_01kmh5wxzjee884setq676j9k3.png" 
              alt="Marketing & Promotions" 
              className="w-full h-auto" 
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-[10px] font-mono uppercase tracking-widest font-bold">
              <Megaphone className="w-3 h-3" />
              Global Reach
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-950 leading-tight">
              Marketing & Promotions
            </h2>
            <p className="text-brand-600 text-lg leading-relaxed">
              Deployment is everything. Our Marketing & Promotions division specializes in high-impact campaigns that cut through the digital noise and deliver your message directly to your target audience.
            </p>
            <p className="text-brand-500 leading-relaxed">
              We utilize a global network of high-authority distribution points to ensure your message is seen by millions. Whether it's a product launch, a brand awareness campaign, or a strategic PR push, our team designs and executes promotions that deliver measurable results and a significant return on investment. Our data-driven approach ensures every campaign is optimized for maximum conversion and engagement.
            </p>
            <div className="pt-4">
              <button onClick={() => setView('marketing-promotions')} className="flex items-center gap-2 text-notion-blue font-bold hover:gap-4 transition-all">
                View campaign results <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-32 border-t border-brand-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: Rocket, title: 'Social Media Boosting', desc: 'Strategic engagement infrastructure designed to amplify your digital authority across all major platforms.' },
            { icon: Cpu, title: 'AI Subscriptions', desc: 'Access premium artificial intelligence tools and neural networks to automate your content and growth strategies.' },
            { icon: Megaphone, title: 'Marketing & Promotions', desc: 'High-impact promotional campaigns deployed through our global network of high-authority nodes.' },
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col gap-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-950 text-white flex items-center justify-center shadow-lg shadow-brand-900/20">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-950">{feature.title}</h3>
              <p className="text-brand-500 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Trust Section */}
      <section className="w-full py-32 bg-brand-950 rounded-[40px] px-10 md:px-20 mb-20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-800/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-8">
              Ready to scale your <br />
              digital presence?
            </h2>
            <p className="text-brand-300 text-lg mb-12">
              Join 5,000+ enterprises leveraging JT Technologies for their strategic growth.
            </p>
            <button 
              onClick={() => navigateToAuth('signup')}
              className="px-10 py-5 bg-white text-brand-950 rounded-xl font-bold text-[11px] uppercase tracking-[0.3em] hover:bg-brand-50 transition-all shadow-2xl shadow-black/20"
            >
              Get Started Now
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6 w-full md:w-auto">
            {[
              { label: 'Uptime', val: '99.9%' },
              { label: 'Nodes', val: '12k+' },
              { label: 'Orders', val: '1.2M' },
              { label: 'Support', val: '24/7' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl">
                <p className="text-[10px] font-mono uppercase tracking-widest text-brand-400 mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-white">
                  <Counter value={stat.val} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );

  const renderDashboard = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl space-y-10"
    >
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-400 mb-2">Available Credits</p>
            <h3 className="text-3xl font-bold text-brand-950">₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
          <div className="p-4 rounded-2xl bg-brand-50">
            <Wallet className="w-6 h-6 text-brand-400" />
          </div>
        </div>
        <div className="glass-card p-8 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-400 mb-2">Active Deployments</p>
            <h3 className="text-3xl font-bold text-brand-950">{orders.filter(o => o.status === 'processing').length}</h3>
          </div>
          <div className="p-4 rounded-2xl bg-brand-50">
            <Rocket className="w-6 h-6 text-brand-400" />
          </div>
        </div>
        <div className="glass-card p-8 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-400 mb-2">Total Operations</p>
            <h3 className="text-3xl font-bold text-brand-950">{orders.length}</h3>
          </div>
          <div className="p-4 rounded-2xl bg-brand-50">
            <History className="w-6 h-6 text-brand-400" />
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <button 
          onClick={() => setView('services')}
          className="glass-card p-10 text-left group"
        >
          <div className="mb-8 p-5 w-fit rounded-2xl bg-brand-50 group-hover:bg-brand-950 text-brand-400 group-hover:text-white transition-all">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-brand-950 mb-4">New Deployment</h3>
          <p className="text-brand-500 text-sm leading-relaxed">Access our proprietary engagement infrastructure and neural networks.</p>
          <div className="mt-8 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-brand-400 group-hover:text-brand-950 transition-colors">
            Explore Services <ChevronRight className="w-3 h-3" />
          </div>
        </button>

        <button 
          onClick={() => setView('orders')}
          className="glass-card p-10 text-left group"
        >
          <div className="mb-8 p-5 w-fit rounded-2xl bg-brand-50 group-hover:bg-brand-950 text-brand-400 group-hover:text-white transition-all">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-brand-950 mb-4">Operation Logs</h3>
          <p className="text-brand-500 text-sm leading-relaxed">Monitor real-time status and performance of your active infrastructures.</p>
          <div className="mt-8 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-brand-400 group-hover:text-brand-950 transition-colors">
            View History <ChevronRight className="w-3 h-3" />
          </div>
        </button>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    );
  }

  if (view === 'dashboard' || ['services', 'orders', 'billing', 'settings', 'help'].includes(activeTab)) {
    return (
      <DashboardLayout 
        user={user} 
        balance={balance} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      >
        {activeTab === 'home' && (
          <DashboardHome 
            balance={balance} 
            orders={orders} 
            onNavigate={(tab) => setActiveTab(tab)} 
          />
        )}
        {activeTab === 'services' && (
          <ServicesView 
            servicesLoading={servicesLoading}
            servicesError={servicesError}
            services={services}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            placeOrder={placeOrder}
            balance={balance}
          />
        )}
        {activeTab === 'orders' && (
          <OrdersView 
            orders={orders} 
            onBack={() => setActiveTab('home')} 
          />
        )}
        {activeTab === 'billing' && <AddFundsView />}
        {['settings', 'help'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Coming Soon</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs">This section is currently under development. Check back soon for updates.</p>
          </div>
        )}
      </DashboardLayout>
    );
  }

  if (view === 'admin' && user) {
    return (
      <AdminLayout
        user={user}
        activeTab={adminTab}
        setActiveTab={setAdminTab}
        onLogout={handleLogout}
      >
        {adminTab === 'registrations' && <RegistrationsSection />}
        {adminTab === 'payments' && <PaymentsSection />}
        {adminTab === 'tools' && <AIToolsSection />}
      </AdminLayout>
    );
  }

  return (
    <div className={`min-h-screen ${user ? 'bg-brand-50' : 'bg-white'} text-brand-950 font-sans selection:bg-brand-900/5 overflow-x-hidden`}>
      {(!user && view !== 'auth') && <HomeNavbar />}

      {view === 'auth' ? (
        <AnimatePresence mode="wait">
          {renderAuth()}
        </AnimatePresence>
      ) : (
        <main className={`relative z-10 flex flex-col items-center min-h-screen ${user ? 'pt-0' : 'pt-20'}`}>
          <div className="w-full max-w-7xl px-6 lg:px-10">
            <AnimatePresence mode="wait">
              {view === 'home' && renderHome()}
              {view === 'social-media-boosting' && <SocialMediaBoostingPage onBack={() => setView('home')} />}
              {view === 'ai-subscriptions' && <AISubscriptionsPage onBack={() => setView('home')} />}
              {view === 'marketing-promotions' && <MarketingPromotionsPage onBack={() => setView('home')} />}
              {view === 'products' && <ProductsPage onBack={() => setView('home')} />}
              {view === 'download' && <DownloadPage onBack={() => setView('home')} />}
              {view === 'solutions' && <SolutionsPage onBack={() => setView('home')} />}
              {view === 'resources' && <ResourcesPage onBack={() => setView('home')} />}
              {view === 'pricing' && <PricingPage onBack={() => setView('home')} />}
              {view === 'ai-tools' && <AIToolsMarketplace onBack={() => setView('home')} />}
            </AnimatePresence>
          </div>

        {/* Status Messages */}
        <AnimatePresence>
          {(orderError || orderSuccess) && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className={`fixed bottom-8 right-8 p-6 rounded-2xl shadow-2xl flex items-center gap-4 z-[100] ${
                orderError ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              }`}
            >
              {orderError ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              <p className="text-sm font-medium">{orderError || orderSuccess}</p>
              <button onClick={() => { setOrderError(null); setOrderSuccess(null); }} className="ml-4 opacity-50 hover:opacity-100">×</button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      )}
    </div>
  );
}
