import { ArrowLeft, Megaphone, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface MarketingPromotionsPageProps {
  onBack: () => void;
}

export function MarketingPromotionsPage({ onBack }: MarketingPromotionsPageProps) {
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
              <Megaphone className="w-4 h-4 text-notion-blue" />
            </div>
            <span className="text-lg font-bold text-brand-950">Marketing & Promotions</span>
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
                <Megaphone className="w-3 h-3" />
                Global Reach
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-brand-950 leading-tight">
                Marketing & Promotions
              </h1>
            </div>
            <p className="text-xl text-brand-600 max-w-2xl leading-relaxed">
              Deployment is everything. Our Marketing & Promotions division specializes in high-impact campaigns that cut through the digital noise and deliver your message directly to your target audience.
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
            src="https://raw.githubusercontent.com/ghostshadow526/jtech/main/20260324_1722_Image%20Generation_remix_01kmh5wxzjee884setq676j9k3.png"
            alt="Marketing & Promotions"
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
            <h2 className="text-3xl font-bold text-brand-950">Campaigns That Deliver Results</h2>
            <p className="text-brand-600 text-lg leading-relaxed">
              We utilize a global network of high-authority distribution points to ensure your message is seen by millions. Whether it's a product launch, a brand awareness campaign, or a strategic PR push, our team designs and executes promotions that deliver measurable results and a significant return on investment.
            </p>
            <p className="text-brand-500 leading-relaxed">
              Our data-driven approach ensures every campaign is optimized for maximum conversion and engagement. We don't just push messages—we create conversations. By understanding your audience deeply and leveraging our global network, we amplify your brand voice and turn prospects into loyal customers.
            </p>
            <div className="pt-4 space-y-4">
              {[
                'Global high-authority distribution network',
                'Data-driven campaign optimization',
                'Measurable results and ROI tracking',
                'Strategic PR and media coverage',
                'Multi-channel campaign management',
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
            <h3 className="text-xl font-bold text-brand-950 mb-6">View Results</h3>
            <p className="text-brand-600 text-sm mb-6">
              See what our campaigns have achieved for brands worldwide. Real results, real impact.
            </p>
            <button className="w-full bg-notion-blue text-white py-3 rounded-lg font-bold hover:bg-notion-blue-hover transition-all shadow-lg">
              View campaign results
            </button>
          </motion.div>
        </section>

        {/* Campaign Types */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-brand-950 mb-12">Campaign Types & Strategies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Product Launch Campaigns',
                desc: 'Strategic rollout plans that generate buzz and drive immediate adoption of your new products or services.',
              },
              {
                title: 'Brand Awareness Initiatives',
                desc: 'Multi-channel campaigns designed to increase visibility and establish your brand as an industry leader.',
              },
              {
                title: 'Strategic PR Pushes',
                desc: 'Earned media campaigns that secure coverage in top-tier publications and drive credibility.',
              },
              {
                title: 'Conversion-Focused Promotions',
                desc: 'High-performing campaigns optimized to turn prospects into paying customers with maximum ROI.',
              },
              {
                title: 'Community Engagement Programs',
                desc: 'Build loyalty and advocacy through carefully crafted community initiatives and engagement strategies.',
              },
              {
                title: 'Seasonal & Event Marketing',
                desc: 'Capitalize on peak seasons and events with timely, relevant campaigns that maximize opportunities.',
              },
            ].map((campaign, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="border border-brand-200 rounded-xl p-6 hover:border-notion-blue hover:shadow-lg transition-all"
              >
                <h3 className="text-lg font-bold text-brand-950 mb-3">{campaign.title}</h3>
                <p className="text-brand-600 text-sm leading-relaxed">{campaign.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Results Stats */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-brand-950 mb-12">Proven Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { metric: '500M+', label: 'Combined Audience Reach', icon: '📊' },
              { metric: '87%', label: 'Average Campaign Engagement', icon: '💹' },
              { metric: '4.2x', label: 'Average ROI Multiplier', icon: '🚀' },
              { metric: '1000+', label: 'Successful Campaigns', icon: '✨' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 text-center border border-blue-100"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold text-brand-950 mb-2">{stat.metric}</div>
                <div className="text-sm text-brand-600">{stat.label}</div>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Launch Your Campaign?</h2>
          <p className="text-brand-100 text-lg mb-8 max-w-2xl mx-auto">
            Let our expert team create a custom marketing strategy that delivers results. Get in touch today to start planning your next big campaign.
          </p>
          <button className="inline-flex items-center gap-2 bg-white text-brand-950 px-8 py-3 rounded-lg font-bold hover:bg-brand-50 transition-all">
            Start your campaign <ArrowRight className="w-4 h-4" />
          </button>
        </motion.section>
      </main>
    </div>
  );
}
