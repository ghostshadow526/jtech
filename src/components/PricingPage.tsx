import { ArrowLeft, DollarSign, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface PricingPageProps {
  onBack: () => void;
}

export function PricingPage({ onBack }: PricingPageProps) {
  return (
    <div className="w-full">
      <div className="border-b border-brand-100 bg-white sticky top-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-brand-600 hover:text-brand-950 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-lg font-bold text-brand-950">Pricing</span>
          <div className="w-20" />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20 text-center space-y-6"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-brand-950">Simple, Transparent Pricing</h1>
          <p className="text-xl text-brand-600 max-w-2xl mx-auto">
            Choose a plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            {
              name: 'Starter',
              price: '$29',
              desc: 'Perfect for individuals',
              features: ['Basic features', '100 engagements/month', 'Email support', 'API access'],
              cta: 'Get Started',
            },
            {
              name: 'Professional',
              price: '$99',
              desc: 'For growing businesses',
              features: ['All Starter features', '1K engagements/month', 'Priority support', 'Advanced analytics'],
              cta: 'Start Free Trial',
              featured: true,
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              desc: 'For teams',
              features: ['Unlimited everything', 'Dedicated account manager', '24/7 support', 'Custom integrations'],
              cta: 'Contact Sales',
            },
          ].map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-xl p-8 transition-all ${
                plan.featured
                  ? 'border-2 border-notion-blue bg-blue-50 shadow-xl'
                  : 'border border-brand-200 hover:border-notion-blue'
              }`}
            >
              {plan.featured && (
                <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-notion-blue text-white text-xs font-bold">
                  <Zap className="w-3 h-3" />
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-brand-950 mb-2">{plan.name}</h3>
              <p className="text-brand-600 text-sm mb-6">{plan.desc}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-brand-950">{plan.price}</span>
                {plan.price !== 'Custom' && <span className="text-brand-600">/month</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-brand-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-notion-blue flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-lg font-bold transition-all ${
                plan.featured
                  ? 'bg-notion-blue text-white hover:bg-blue-700'
                  : 'bg-brand-100 text-brand-950 hover:bg-brand-200'
              }`}>
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
