import { motion } from 'framer-motion'
import { TrendingUp, BarChart3, Dumbbell } from 'lucide-react'

const STEPS = [
  { number: '01', title: 'Sign Up & Connect', description: 'Create your account and connect with your trainer. Set your goals, share your history, and get matched with the perfect program.', icon: <TrendingUp size={20} className="text-white" /> },
  { number: '02', title: 'Initial Assessment', description: 'Complete a comprehensive assessment including BioPrint, body stats, lifestyle questionnaire, and fitness testing. Your trainer uses this data to build your personalized plan.', icon: <BarChart3 size={20} className="text-white" /> },
  { number: '03', title: 'Receive Your Program', description: 'Your trainer designs a tailored training program and nutrition plan based on your goals, schedule, and assessment data. Everything is delivered through the platform.', icon: <Dumbbell size={20} className="text-white" /> },
  { number: '04', title: 'Track & Improve', description: 'Log workouts, track nutrition, upload progress photos, and monitor your metrics. AI-powered insights help your trainer make data-driven adjustments for continuous improvement.', icon: <TrendingUp size={20} className="text-white" /> },
]

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-az-black py-20 lg:py-24">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }} className="font-mono text-xs text-cyan uppercase tracking-[0.1em] mb-4">
            How It Works
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.6, ease: EASE }} className="font-playfair text-3xl sm:text-4xl font-bold text-white">
            Your Journey to Better Results
          </motion.h2>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-800 -translate-x-1/2" />
          <div className="md:hidden absolute left-4 top-0 bottom-0 w-0.5 bg-gray-800" />

          {STEPS.map((step, i) => {
            const isLeft = i % 2 === 0
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.2, duration: 0.6, ease: EASE }}
                className="relative flex items-start mb-12 last:mb-0"
              >
                <div className="hidden md:grid md:grid-cols-2 md:gap-8 md:w-full md:items-start">
                  <div className={`${isLeft ? 'text-right pr-8' : 'col-start-2 pl-8'}`}>
                    <div className={`inline-flex flex-col ${isLeft ? 'items-end' : 'items-start'}`}>
                      <div className="bg-[#141414] rounded-xl p-6 border border-[#2A2A2A] max-w-[380px]">
                        <h3 className="font-semibold text-lg text-white mb-2">{step.title}</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="md:hidden ml-12 mr-0">
                  <div className="bg-[#141414] rounded-xl p-5 border border-[#2A2A2A]">
                    <h3 className="font-semibold text-base text-white mb-1.5">{step.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
                <div className="absolute left-4 md:left-1/2 w-12 h-12 rounded-full bg-cyan flex items-center justify-center z-10 md:-translate-x-1/2">
                  <span className="font-mono text-white text-sm font-bold">{step.number}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
