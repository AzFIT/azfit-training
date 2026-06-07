/**
 * SubscriptionPage - 3-tier pricing with feature comparison, FAQ accordion, and CTA.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const tiers = [
  {
    name: 'Starter',
    desc: 'Perfect for trying out AzFIT',
    price: { monthly: 'Free', annual: 'Free' },
    period: 'forever',
    highlight: false,
    features: [
      { text: '1 client profile', included: true },
      { text: 'Basic body stats tracking', included: true },
      { text: 'Session logging (10/month)', included: true },
      { text: 'Email support', included: true },
      { text: 'BioPrint tracking', included: false },
      { text: 'Program design wizard', included: false },
      { text: 'Nutrition planning', included: false },
      { text: 'Advanced analytics', included: false },
    ],
    cta: 'Get Started Free',
    ctaStyle: 'secondary' as const,
  },
  {
    name: 'Professional',
    desc: 'For dedicated trainers',
    price: { monthly: '$29', annual: '$23' },
    period: '/month',
    highlight: true,
    badge: 'MOST POPULAR',
    features: [
      { text: '20 client profiles', included: true },
      { text: 'Full BioPrint tracking', included: true },
      { text: 'Unlimited session logging', included: true },
      { text: 'Program design wizard', included: true },
      { text: 'Basic nutrition planning', included: true },
      { text: 'Priority support', included: true },
      { text: 'Data export (CSV)', included: true },
      { text: 'Team collaboration', included: false },
    ],
    cta: 'Start Pro Trial',
    ctaStyle: 'primary' as const,
    subtext: '14-day free trial, no credit card required',
  },
  {
    name: 'Elite',
    desc: 'For studios and power users',
    price: { monthly: '$79', annual: '$63' },
    period: '/month',
    highlight: false,
    gradientBorder: true,
    features: [
      { text: 'Unlimited client profiles', included: true },
      { text: 'Everything in Professional', included: true },
      { text: 'Advanced nutrition features', included: true },
      { text: 'Team collaboration', included: true },
      { text: 'Custom branding', included: true },
      { text: 'API access', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'White-label option', included: true },
    ],
    cta: 'Contact Sales',
    ctaStyle: 'secondary' as const,
  },
];

const comparisonData = [
  { category: 'Client Management', features: [
    { name: 'Client Profiles', starter: true, pro: true, elite: true },
    { name: 'BioPrint Tracking', starter: false, pro: true, elite: true },
    { name: 'Body Stats', starter: true, pro: true, elite: true },
    { name: 'Assessments', starter: false, pro: true, elite: true },
  ]},
  { category: 'Scheduling', features: [
    { name: 'Calendar', starter: true, pro: true, elite: true },
    { name: 'Recurring Sessions', starter: false, pro: true, elite: true },
    { name: 'Conflict Detection', starter: false, pro: true, elite: true },
  ]},
  { category: 'Programs', features: [
    { name: 'Program Wizard', starter: false, pro: true, elite: true },
    { name: 'Exercise Library', starter: 'basic', pro: 'full', elite: 'full' },
    { name: 'Print / PDF', starter: false, pro: true, elite: true },
  ]},
  { category: 'Nutrition', features: [
    { name: 'TDEE Calculator', starter: false, pro: true, elite: true },
    { name: 'Macro Tracking', starter: false, pro: true, elite: true },
    { name: 'Smart Swap', starter: false, pro: false, elite: true },
    { name: 'Meal Planner', starter: false, pro: false, elite: true },
  ]},
  { category: 'Analytics', features: [
    { name: 'Dashboard', starter: 'basic', pro: true, elite: true },
    { name: 'Trend Reports', starter: false, pro: true, elite: true },
    { name: 'Data Export', starter: false, pro: 'CSV', elite: 'CSV+API' },
  ]},
  { category: 'Support', features: [
    { name: 'Email Support', starter: true, pro: true, elite: true },
    { name: 'Priority Support', starter: false, pro: true, elite: true },
    { name: 'Dedicated Manager', starter: false, pro: false, elite: true },
  ]},
];

const faqs = [
  { q: 'Can I switch plans later?', a: 'Yes, you can upgrade or downgrade at any time. Changes take effect at the next billing cycle.' },
  { q: 'Is there a free trial?', a: 'The Professional plan includes a 14-day free trial with full access to all features.' },
  { q: 'What payment methods are accepted?', a: 'We accept all major credit cards via Stripe. For Elite plans, invoice payment is available.' },
  { q: 'Can I cancel anytime?', a: 'Absolutely. There are no long-term contracts. Cancel from your account settings at any time.' },
  { q: 'Is my client data secure?', a: 'Yes. All data is encrypted in transit and at rest. We never share client information with third parties.' },
  { q: 'Do you offer refunds?', a: 'We offer a 30-day money-back guarantee on your first subscription payment.' },
];

function ComparisonCheck({ value }: { value: boolean | string }) {
  if (value === true || value === 'full' || value === 'CSV' || value === 'CSV+API') {
    return <Check size={18} className="text-success mx-auto" />;
  }
  if (value === false) {
    return <X size={18} className="text-gray-300 mx-auto" />;
  }
  return <span className="text-caption text-gray-500">{value}</span>;
}

export default function SubscriptionPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-white">
      {/* ====== HERO ====== */}
      <section className="pt-32 pb-16 px-4 sm:px-6 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          <p className="text-caption uppercase tracking-[0.1em] text-cyan font-semibold mb-3">Pricing</p>
          <h1 className="font-playfair text-display-md text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-body-md text-gray-500 mb-8">Choose the plan that fits your training needs. No hidden fees.</p>

          {/* Billing Toggle */}
          <div className="inline-flex bg-gray-100 rounded-full p-1">
            {(['monthly', 'annual'] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`relative px-6 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                  billing === b ? 'text-white' : 'text-gray-600'
                }`}
              >
                {billing === b && (
                  <motion.div
                    layoutId="billingTab"
                    className="absolute inset-0 bg-cyan rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{b}</span>
                {b === 'annual' && (
                  <span className="relative z-10 ml-1.5 px-1.5 py-0.5 bg-success/20 text-success text-[10px] font-semibold rounded-full">
                    Save 20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ====== PRICING CARDS ====== */}
      <section className="pb-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-[1100px] mx-auto grid md:grid-cols-3 gap-6">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                tier.highlight
                  ? 'bg-white border-2 border-cyan -translate-y-2 shadow-[0_12px_32px_rgba(0,174,239,0.15)]'
                  : tier.gradientBorder
                  ? 'bg-white border-2 border-transparent'
                  : 'bg-white border border-gray-200 hover:-translate-y-1 hover:shadow-card-hover'
              }`}
              style={
                tier.gradientBorder
                  ? {
                      background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #00AEEF, #EC4899) border-box',
                    }
                  : undefined
              }
            >
              {tier.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-cyan text-white text-caption font-semibold rounded-full">
                  {tier.badge}
                </span>
              )}

              <h3 className={`text-heading-sm font-semibold mb-1 ${tier.highlight ? 'text-cyan' : 'text-gray-900'}`}>
                {tier.name}
              </h3>
              <p className="text-body-sm text-gray-500 mb-4">{tier.desc}</p>
              <div className="mb-6">
                <span className="font-mono text-data-lg text-gray-900">
                  {billing === 'monthly' ? tier.price.monthly : tier.price.annual}
                </span>
                <span className="text-caption text-gray-400 ml-1">
                  {tier.price.monthly === 'Free' ? tier.period : billing === 'annual' ? '/month, billed annually' : tier.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-3">
                    {f.included ? (
                      <Check size={16} className="text-success shrink-0" />
                    ) : (
                      <X size={16} className="text-gray-300 shrink-0" />
                    )}
                    <span className={`text-body-sm ${f.included ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  tier.ctaStyle === 'primary'
                    ? 'btn-primary'
                    : 'border-2 border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tier.cta}
              </button>
              {tier.subtext && (
                <p className="text-caption text-gray-500 text-center mt-3">{tier.subtext}</p>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ====== FEATURE COMPARISON ====== */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-[1000px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-gray-200 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-heading-sm font-semibold text-center">Full Feature Comparison</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-6 py-3 text-caption font-semibold text-gray-500 uppercase">Feature</th>
                    <th className="text-center px-4 py-3 text-caption font-semibold text-gray-500 uppercase">Starter</th>
                    <th className="text-center px-4 py-3 text-caption font-semibold text-cyan uppercase bg-[rgba(0,174,239,0.05)]">Pro</th>
                    <th className="text-center px-4 py-3 text-caption font-semibold text-gray-500 uppercase">Elite</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((cat) => (
                    <>
                      <tr key={cat.category}>
                        <td colSpan={4} className="px-6 py-2.5 bg-gray-50 text-sm font-semibold text-gray-900">{cat.category}</td>
                      </tr>
                      {cat.features.map((f) => (
                        <tr key={f.name} className="border-b border-gray-100 last:border-0">
                          <td className="px-6 py-3 text-sm text-gray-700">{f.name}</td>
                          <td className="text-center px-4 py-3"><ComparisonCheck value={f.starter} /></td>
                          <td className="text-center px-4 py-3 bg-[rgba(0,174,239,0.03)]"><ComparisonCheck value={f.pro} /></td>
                          <td className="text-center px-4 py-3"><ComparisonCheck value={f.elite} /></td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ====== FAQ ====== */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-heading-md font-semibold text-center mb-8"
          >
            Frequently Asked Questions
          </motion.h3>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="text-body-md font-medium text-gray-900">{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.25 }}>
                    <ChevronDown size={18} className="text-gray-400 shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="px-6 pb-4 text-body-sm text-gray-500">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FINAL CTA ====== */}
      <section className="relative py-24 px-4 sm:px-6 bg-gradient-hero">
        <div className="noise-overlay" />
        <div className="max-w-[600px] mx-auto text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-playfair text-display-md text-white mb-4"
          >
            Start Your Free Trial Today
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-body-lg text-gray-300 mb-8"
          >
            No credit card required. 14 days, full access.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/signup" className="btn-primary px-10 py-4 text-lg">
              Get Started &mdash; It&apos;s Free
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
