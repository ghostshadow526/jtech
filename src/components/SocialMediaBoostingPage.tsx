import { ArrowLeft, Rocket, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface SocialMediaBoostingPageProps {
  onBack: () => void;
}

export function SocialMediaBoostingPage({ onBack }: SocialMediaBoostingPageProps) {
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
              <Rocket className="w-4 h-4 text-notion-blue" />
            </div>
            <span className="text-lg font-bold text-brand-950">Social Media Boosting</span>
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
                <Rocket className="w-3 h-3" />
                Strategic Growth
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-brand-950 leading-tight">
                Social Media Boosting
              </h1>
            </div>
            <p className="text-xl text-brand-600 max-w-2xl leading-relaxed">
              Our Social Media Boosting infrastructure is built on a foundation of high-authority nodes and strategic engagement patterns. We don't just provide numbers; we provide digital presence.
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
            src="https://raw.githubusercontent.com/ghostshadow526/jtech/main/20260324_1653_Image%20Generation_remix_01kmh47s24eb4sqsqhea9d4hat.png"
            alt="Social Media Boosting"
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
            <h2 className="text-3xl font-bold text-brand-950">How We Amplify Your Reach</h2>
            <p className="text-brand-600 text-lg leading-relaxed">
              By leveraging our proprietary network, we amplify your content's reach, ensuring it resonates with the right audience and gains the momentum needed to trend globally. Our systems are designed to mimic organic growth, protecting your account's integrity while delivering unprecedented visibility.
            </p>
            <p className="text-brand-500 leading-relaxed">
              Whether you're looking to establish a new brand or scale an existing authority, our boosting services provide the necessary digital leverage. We understand that authentic growth matters—that's why we focus on creating sustainable, long-term engagement patterns that build real communities around your content.
            </p>
            <div className="pt-4 space-y-4">
              {[
                'High-authority engagement nodes',
                'Organic growth patterns',
                'Account integrity protection',
                'Global audience reach',
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
            <h3 className="text-xl font-bold text-brand-950 mb-6">Get Started</h3>
            <p className="text-brand-600 text-sm mb-6">
              Ready to boost your social media presence? Our team is ready to help you achieve unprecedented growth.
            </p>
            <button className="w-full bg-notion-blue text-white py-3 rounded-lg font-bold hover:bg-notion-blue-hover transition-all shadow-lg">
              Learn about our network
            </button>
          </motion.div>
        </section>

        {/* Benefits Grid */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-brand-950 mb-12">Key Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Trend-worthy Content',
                desc: 'Our infrastructure ensures your content gains the momentum needed to trend globally.',
              },
              {
                title: 'Account Protection',
                desc: 'We mimic organic growth patterns to keep your account safe and authentic.',
              },
              {
                title: 'Targeted Reach',
                desc: 'Our advanced algorithms ensure your content reaches the right audience.',
              },
              {
                title: 'Sustained Growth',
                desc: 'Build real communities around your content with long-term engagement strategies.',
              },
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="border border-brand-200 rounded-xl p-6 hover:border-notion-blue hover:shadow-lg transition-all"
              >
                <h3 className="text-lg font-bold text-brand-950 mb-3">{benefit.title}</h3>
                <p className="text-brand-600 text-sm leading-relaxed">{benefit.desc}</p>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Social Media Presence?</h2>
          <p className="text-brand-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of brands leveraging our infrastructure to achieve unprecedented growth and digital authority.
          </p>
          <button className="inline-flex items-center gap-2 bg-white text-brand-950 px-8 py-3 rounded-lg font-bold hover:bg-brand-50 transition-all">
            Get started today <ArrowRight className="w-4 h-4" />
          </button>
        </motion.section>
      </main>
    </div>
  );
}
