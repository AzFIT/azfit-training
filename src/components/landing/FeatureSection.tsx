import { motion } from 'framer-motion'
import { Check, BarChart3, Dumbbell, Apple } from 'lucide-react'

const FEATURES = [
  {
    image: '/landing-feature-1.jpg',
    icon: <BarChart3 size={24} className="text-cyan" />,
    title: 'Progress Tracking',
    description: 'Track every metric that matters — body composition, strength gains, measurements, and photos. Visualize progress with beautiful charts and spot trends at a glance.',
    items: ['Body composition analysis', 'Progress photo timeline', 'Strength & performance logs', 'Automated trend detection'],
  },
  {
    image: '/landing-feature-2.jpg',
    icon: <Dumbbell size={24} className="text-[violet]" />,
    title: 'Program Design',
    description: 'Build science-based training programs with our intelligent wizard. Select goals, methods, and exercises — the system handles periodization, progression, and recovery.',
    items: ['8-step program wizard', '200+ exercise database', '84 training methods', 'Auto-generated progression'],
  },
  {
    image: '/landing-feature-3.jpg',
    icon: <Apple size={24} className="text-[success]" />,
    title: 'Nutrition Management',
    description: 'Calculate TDEE, set macro targets, plan meals, and track adherence. With a 120-item food database and water/supplement tracking, nutrition has never been simpler.',
    items: ['Mifflin-St Jeor TDEE calculator', 'Macro ring visualization', 'Meal planner with food database', 'Water & supplement tracking'],
  },
]

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function FeatureSection() {
  return (
    <section id="features" className="bg-white py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
            className="font-mono text-xs text-cyan uppercase tracking-[0.1em] mb-4"
          >
            Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6, ease: EASE }}
            className="font-playfair text-3xl sm:text-4xl font-bold text-gray-950 mb-4"
          >
            Everything You Need to Train Smarter
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
            className="text-gray-550 text-base sm:text-lg max-w-[640px] mx-auto"
          >
            A complete toolkit for modern personal training management
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.15, duration: 0.6, ease: EASE }}
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:border-cyan/20 transition-all duration-300"
            >
              <div className="h-[200px] overflow-hidden">
                <img src={feature.image} alt={feature.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="relative px-6">
                <div className="absolute -top-6 left-6 w-12 h-12 bg-white rounded-full border border-gray-200 flex items-center justify-center shadow-sm">
                  {feature.icon}
                </div>
              </div>
              <div className="px-6 pt-8 pb-6">
                <h3 className="font-semibold text-xl text-gray-950 mb-2">{feature.title}</h3>
                <p className="text-gray-550 text-sm leading-relaxed mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-750">
                      <Check size={16} className="text-[success] flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
