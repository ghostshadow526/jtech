import { ArrowLeft, Lightbulb, Target, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface SolutionsPageProps {
  onBack: () => void;
}

export function SolutionsPage({ onBack }: SolutionsPageProps) {
  return (
    <div className="w-full">
      <div className="border-b border-brand-100 bg-white sticky top-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-brand-600 hover:text-brand-950 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-lg font-bold text-brand-950">Solutions</span>
          <div className="w-20" />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20 text-center space-y-6"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-brand-950">Tailored Solutions</h1>
          <p className="text-xl text-brand-600 max-w-2xl mx-auto">
            Find the right solution for your industry and use case.
          </p>
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            {
              icon: Lightbulb,
              industry: 'Content Creators',
              desc: 'Grow your audience and increase engagement on all social platforms.',
              solutions: ['Audience Growth', 'Engagement Boost', 'Analytics'],
            },
            {
              icon: Target,
              industry: 'E-Commerce Brands',
              desc: 'Drive sales and build brand authority through strategic promotion.',
              solutions: ['Product Promotion', 'Sales Growth', 'Conversion Optimization'],
            },
            {
              icon: TrendingUp,
              industry: 'Agencies',
              desc: 'Offer comprehensive services to your clients with our platform.',
              solutions: ['White Label', 'Multi-Account', 'Reseller Program'],
            },
          ].map((solution, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="border border-brand-200 rounded-xl p-6 hover:border-notion-blue hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <solution.icon className="w-6 h-6 text-notion-blue" />
              </div>
              <h3 className="text-lg font-bold text-brand-950 mb-2">{solution.industry}</h3>
              <p className="text-brand-600 text-sm mb-4">{solution.desc}</p>
              <div className="space-y-1">
                {solution.solutions.map((sol, j) => (
                  <div key={j} className="flex items-center gap-2 text-brand-600 text-sm">
                    <div className="w-1 h-1 rounded-full bg-notion-blue" />
                    {sol}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
