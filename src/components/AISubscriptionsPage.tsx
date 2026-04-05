import { ArrowLeft, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface AISubscriptionsPageProps {
  onBack: () => void;
}

export function AISubscriptionsPage({ onBack }: AISubscriptionsPageProps) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="border-b border-brand-100 bg-white sticky top-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-brand-600 hover:text-brand-950 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-notion-blue" />
            </div>
            <span className="text-lg font-bold text-brand-950">AI Subscriptions</span>
          </div>
          <div className="w-20" />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-[10px] font-mono uppercase tracking-widest font-bold">
                <Cpu className="w-3 h-3" />
                Neural Access
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-brand-950 leading-tight">
                AI Subscriptions
              </h1>
            </div>
            <p className="text-xl text-brand-600 max-w-2xl leading-relaxed">
              In an era defined by machine intelligence, access to the right models is the ultimate competitive advantage. JT Technologies provides a unified gateway to the world's most advanced neural networks.
            </p>
          </motion.div>
        </section>

        {/* Image Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-20 rounded-2xl overflow-hidden"
        >
          <img
            src="https://raw.githubusercontent.com/ghostshadow526/jtech/main/20260324_1643_Image%20Generation_remix_01kmh3n8qmfztb61ke8sh8x79b.png"
            alt="AI Subscriptions"
            className="w-full h-auto"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Detailed Content */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-6"
          >
            <h2 className="text-3xl font-bold text-brand-950">Cutting-Edge Neural Networks at Your Fingertips</h2>
            <p className="text-brand-600 text-lg leading-relaxed">
              From large language models for content generation to specialized image synthesis engines, our AI subscription tier puts cutting-edge technology at your fingertips. We handle the complex infrastructure and API management, providing you with a seamless, high-performance interface to the most powerful tools in the industry.
            </p>
            <p className="text-brand-500 leading-relaxed">
              Stay ahead of the curve with guaranteed access to the latest model releases and dedicated processing power. Our platform integrates seamlessly with your existing workflows, enabling you to leverage advanced AI capabilities without the overhead of infrastructure management.
            </p>
            <div className="pt-4 space-y-4">
              {[
                'Large Language Models for content generation',
                'Advanced image synthesis engines',
                'Dedicated processing power',
                'Integration with existing workflows',
                'Latest model releases guaranteed',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-notion-blue flex-shrink-0" />
                  <span className="text-brand-600">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-brand-50 rounded-2xl p-8 h-fit"
          >
            <h3 className="text-xl font-bold text-brand-950 mb-6">Explore Models</h3>
            <p className="text-brand-600 text-sm mb-6">
              Access our complete catalog of advanced AI models and discover how they can supercharge your productivity.
            </p>
            <button className="w-full bg-notion-blue text-white py-3 rounded-lg font-bold hover:bg-notion-blue-hover transition-all shadow-lg">
              Explore available models
            </button>
          </motion.div>
        </section>

        {/* Available Models */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-brand-950 mb-12">Available Model Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Language Models',
                models: ['GPT-4', 'Claude 3', 'Llama 3', 'Mistral'],
                desc: 'Advanced LLMs for content generation, analysis, and conversation.',
              },
              {
                title: 'Image Generation',
                models: ['DALL-E 3', 'Midjourney', 'Stable Diffusion XL', 'Adobe Firefly'],
                desc: 'State-of-the-art image synthesis and editing capabilities.',
              },
              {
                title: 'Specialized Models',
                models: ['Vision API', 'Speech Recognition', 'Code Generation', 'Embeddings'],
                desc: 'Purpose-built models for specific use cases and tasks.',
              },
              {
                title: 'Custom Deployments',
                models: ['Fine-tuned Models', 'Private Models', 'Enterprise Solutions', 'API Endpoints'],
                desc: 'Tailored AI solutions designed for your unique requirements.',
              },
            ].map((category, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="border border-brand-200 rounded-xl p-6 hover:border-notion-blue hover:shadow-lg transition-all"
              >
                <h3 className="text-lg font-bold text-brand-950 mb-4">{category.title}</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {category.models.map((model, j) => (
                    <span key={j} className="px-3 py-1 bg-blue-50 text-notion-blue text-xs font-semibold rounded-full">
                      {model}
                    </span>
                  ))}
                </div>
                <p className="text-brand-600 text-sm leading-relaxed">{category.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-brand-950 rounded-2xl p-12 md:p-16 text-center text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Your AI Journey Today</h2>
          <p className="text-brand-100 text-lg mb-8 max-w-2xl mx-auto">
            Get instant access to the world's most advanced neural networks and start building AI-powered solutions.
          </p>
          <button className="inline-flex items-center gap-2 bg-white text-brand-950 px-8 py-3 rounded-lg font-bold hover:bg-brand-50 transition-all">
            Get started with AI <ArrowRight className="w-4 h-4" />
          </button>
        </motion.section>
      </main>
    </div>
  );
}
