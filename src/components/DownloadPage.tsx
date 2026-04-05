import { ArrowLeft, Download as DownloadIcon, Zap, FileText, Code } from 'lucide-react';
import { motion } from 'motion/react';

interface DownloadPageProps {
  onBack: () => void;
}

export function DownloadPage({ onBack }: DownloadPageProps) {
  return (
    <div className="w-full">
      <div className="border-b border-brand-100 bg-white sticky top-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-brand-600 hover:text-brand-950 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-lg font-bold text-brand-950">Downloads</span>
          <div className="w-20" />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20 text-center space-y-6"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-brand-950">Download Resources</h1>
          <p className="text-xl text-brand-600 max-w-2xl mx-auto">
            Get access to our tools, documentation, and guides.
          </p>
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {[
            { icon: Code, title: 'API Documentation', desc: 'Complete API reference and integration guides' },
            { icon: FileText, title: 'User Guide', desc: 'Step-by-step guides to get started quickly' },
            { icon: Zap, title: 'Case Studies', desc: 'Real-world examples of successful implementations' },
            { icon: DownloadIcon, title: 'SDK Tools', desc: 'Download SDKs for your preferred language' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="border border-brand-200 rounded-xl p-6 hover:border-notion-blue hover:shadow-lg transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5 text-notion-blue" />
              </div>
              <h3 className="text-lg font-bold text-brand-950 mb-2">{item.title}</h3>
              <p className="text-brand-600 text-sm mb-4">{item.desc}</p>
              <button className="inline-flex items-center gap-2 text-notion-blue font-semibold text-sm hover:gap-3 transition-all">
                Download <DownloadIcon className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
