import { ArrowLeft, ArrowRight, Rocket, Zap, Globe, Shield } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductsPageProps {
  onBack: () => void;
}

export function ProductsPage({ onBack }: ProductsPageProps) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="border-b border-brand-100 bg-white sticky top-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-brand-600 hover:text-brand-950 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-lg font-bold text-brand-950">Our Products</span>
          <div className="w-20" />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-20">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20 text-center space-y-6"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-brand-950">Our Complete Product Suite</h1>
          <p className="text-xl text-brand-600 max-w-2xl mx-auto">
            Everything you need to boost your digital presence and scale your authority.
          </p>
        </motion.section>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          {[
            {
              icon: Rocket,
              title: 'Social Media Boosting',
              desc: 'Amplify your reach with our proprietary network. Strategic engagement infrastructure designed for authentic growth.',
              features: ['High-authority nodes', 'Organic growth patterns', 'Account protection'],
            },
            {
              icon: Zap,
              title: 'AI Subscriptions',
              desc: 'Access the world\'s most advanced neural networks. LLMs, image generation, and specialized AI models.',
              features: ['Latest models', 'High performance', 'Easy integration'],
            },
            {
              icon: Globe,
              title: 'Marketing & Promotions',
              desc: 'High-impact campaigns through our global network. Reach millions with targeted, data-driven promotions.',
              features: ['Global reach', 'Data-driven', 'Measured results'],
            },
            {
              icon: Shield,
              title: 'Enterprise Solutions',
              desc: 'Custom infrastructure tailored to your needs. Dedicated support and white-label options available.',
              features: ['Custom setup', 'Dedicated support', 'Scalable'],
            },
          ].map((product, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="border border-brand-200 rounded-2xl p-8 hover:border-notion-blue hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-6">
                <product.icon className="w-6 h-6 text-notion-blue" />
              </div>
              <h3 className="text-2xl font-bold text-brand-950 mb-4">{product.title}</h3>
              <p className="text-brand-600 mb-6">{product.desc}</p>
              <ul className="space-y-2">
                {product.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2 text-brand-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-notion-blue" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="mt-8 inline-flex items-center gap-2 text-notion-blue font-bold hover:gap-4 transition-all">
                Learn more <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-brand-950 rounded-2xl p-12 md:p-16 text-center text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Business?</h2>
          <p className="text-brand-100 text-lg mb-8 max-w-2xl mx-auto">
            Choose the product suite that fits your needs and start growing today.
          </p>
          <button className="inline-flex items-center gap-2 bg-white text-brand-950 px-8 py-3 rounded-lg font-bold hover:bg-brand-50 transition-all">
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
        </motion.section>
      </main>
    </div>
  );
}
