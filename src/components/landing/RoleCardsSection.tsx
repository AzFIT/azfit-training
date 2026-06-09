import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function RoleCardsSection() {
  return (
    <section id="pricing" className="bg-az-black py-20 lg:py-24">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASE }} className="font-mono text-xs text-cyan uppercase tracking-[0.1em] mb-4">
            For Everyone
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.5, ease: EASE }} className="font-playfair text-3xl sm:text-4xl font-bold text-white">
            Built for Trainers & Clients
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Trainer Card */}
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.5, ease: EASE }} className="group relative min-h-[480px] rounded-[20px] overflow-hidden cursor-pointer">
            <img src="./trainer-role-card.jpg" alt="Trainer" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[600ms]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,10,0.85)] via-[rgba(10,10,10,0.3)] to-transparent" />
            <div className="relative h-full min-h-[480px] flex flex-col justify-end p-8 sm:p-10">
              <span className="inline-block self-start px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider text-cyan bg-cyan/15 mb-4">For Trainers</span>
              <h3 className="font-playfair text-2xl sm:text-3xl font-bold text-white mb-3">Elevate Your Training Business</h3>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-6 max-w-[400px]">Manage clients, design science-based programs, track progress, and grow your business — all from one powerful dashboard.</p>
              <Link to="/signup" className="inline-flex items-center gap-2 self-start bg-cyan hover:bg-cyan-dark text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-[1.02] text-sm">
                Join as Trainer <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

          {/* Client Card */}
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ delay: 0.2, duration: 0.5, ease: EASE }} className="group relative min-h-[480px] rounded-[20px] overflow-hidden cursor-pointer">
            <img src="./client-role-card.jpg" alt="Client" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[600ms]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,10,0.85)] via-[rgba(10,10,10,0.3)] to-transparent" />
            <div className="relative h-full min-h-[480px] flex flex-col justify-end p-8 sm:p-10">
              <span className="inline-block self-start px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider text-cyan bg-cyan/15 mb-4">For Clients</span>
              <h3 className="font-playfair text-2xl sm:text-3xl font-bold text-white mb-3">Achieve Your Fitness Goals</h3>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-6 max-w-[400px]">Get personalized programs, track your nutrition, monitor progress with photos and metrics, and stay connected with your trainer.</p>
              <Link to="/signup" className="inline-flex items-center gap-2 self-start bg-white hover:bg-[dark-primary] text-[gray-950] font-semibold px-6 py-3 rounded-xl transition-all hover:scale-[1.02] text-sm">
                Join as Client <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
