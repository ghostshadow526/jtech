import { ArrowLeft, ShoppingCart, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface AITool {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating?: number;
  reviews?: number;
}

interface AIToolsMarketplaceProps {
  onBack: () => void;
}

export function AIToolsMarketplace({ onBack }: AIToolsMarketplaceProps) {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      const toolsCollection = collection(db, 'ai_tools');
      const q = query(toolsCollection, where('published', '==', true));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const toolsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as AITool));
        setTools(toolsData);
        setLoading(false);
      }, (err) => {
        console.error('Error fetching tools:', err);
        setError('Failed to load AI tools');
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error(err);
      setError('Failed to load AI tools');
      setLoading(false);
    }
  }, []);

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="border-b border-brand-100 bg-white sticky top-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-brand-600 hover:text-brand-950 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-lg font-bold text-brand-950">AI Tools Marketplace</span>
          <div className="w-20" />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-20">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 space-y-8"
        >
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-brand-950">AI Tools Marketplace</h1>
            <p className="text-xl text-brand-600 max-w-2xl mx-auto">
              Access cutting-edge AI tools to power your next project
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search AI tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-xl border border-brand-200 focus:border-notion-blue focus:outline-none transition-colors"
            />
          </div>

          {/* Filter Stats */}
          <div className="text-center">
            <p className="text-brand-600">Showing <span className="font-bold text-brand-950">{filteredTools.length}</span> tools</p>
          </div>
        </motion.section>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="text-brand-600">Loading AI tools...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center text-rose-600">
            {error}
          </div>
        )}

        {/* Tools Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {filteredTools.length > 0 ? (
              filteredTools.map((tool) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="border border-brand-200 rounded-xl overflow-hidden hover:border-notion-blue hover:shadow-lg transition-all"
                >
                  {/* Image */}
                  <div className="h-48 bg-brand-100 overflow-hidden">
                    {tool.image ? (
                      <img
                        src={tool.image}
                        alt={tool.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                        <span className="text-brand-400">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-brand-950 mb-2">{tool.name}</h3>
                      <p className="text-brand-600 text-sm line-clamp-2">{tool.description}</p>
                    </div>

                    {/* Rating */}
                    {tool.rating && (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(tool.rating!)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-brand-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-brand-600">
                          {tool.rating.toFixed(1)} {tool.reviews && `(${tool.reviews})`}
                        </span>
                      </div>
                    )}

                    {/* Price and Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-brand-100">
                      <div>
                        <div className="text-2xl font-bold text-brand-950">
                          ₦{tool.price.toFixed(2)}
                        </div>
                        <div className="text-xs text-brand-600">one-time</div>
                      </div>
                      <button className="flex items-center gap-2 bg-notion-blue text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all">
                        <ShoppingCart className="w-4 h-4" />
                        Buy
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <p className="text-brand-600 text-lg">No AI tools found matching your search</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
