import { ArrowLeft, BookOpen, HelpCircle, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

interface ResourcesPageProps {
  onBack: () => void;
}

export function ResourcesPage({ onBack }: ResourcesPageProps) {
  return (
    <div className="w-full">
      <div className="border-b border-brand-100 bg-white sticky top-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-brand-600 hover:text-brand-950 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-lg font-bold text-brand-950">Resources</span>
          <div className="w-20" />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20 text-center space-y-6"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-brand-950">Learning Resources</h1>
          <p className="text-xl text-brand-600 max-w-2xl mx-auto">
            Master JT Technologies with our comprehensive guides and tutorials.
          </p>
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { icon: BookOpen, title: 'Documentation', count: '50+', desc: 'Comprehensive guides' },
            { icon: HelpCircle, title: 'FAQ', count: '200+', desc: 'Common questions answered' },
            { icon: MessageSquare, title: 'Community', count: '10K+', desc: 'Active discussions' },
          ].map((resource, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="border border-brand-200 rounded-xl p-8 text-center hover:border-notion-blue hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <resource.icon className="w-6 h-6 text-notion-blue" />
              </div>
              <h3 className="text-lg font-bold text-brand-950 mb-1">{resource.title}</h3>
              <div className="text-2xl font-bold text-notion-blue mb-2">{resource.count}</div>
              <p className="text-brand-600 text-sm">{resource.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
