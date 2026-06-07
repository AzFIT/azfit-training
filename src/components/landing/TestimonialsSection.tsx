import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react'

const TESTIMONIALS = [
  { quote: 'AzFIT transformed how I manage my clients. The program wizard saves me hours every week, and my clients love tracking their progress visually.', name: 'Azwar H.', role: 'Head Trainer, AzTechFit', avatar: '/Azwar_Profile.jpg' },
  { quote: "Finally, a platform that understands what personal trainers actually need. The nutrition tracking alone has improved my clients' adherence by 40%.", name: 'Sarah L.', role: 'Personal Trainer', avatar: '/testimonial-1.jpg' },
  { quote: "I've seen a 22% improvement in my body composition in just 3 months. Having everything — workouts, nutrition, photos — in one place keeps me accountable.", name: 'Michael T.', role: 'AzFIT Client', avatar: '/testimonial-2.jpg' },
  { quote: 'The BioPrint integration and progress photo comparison tools are game-changers. My clients can finally see the changes they\'ve been working so hard for.', name: 'Jennifer W.', role: 'Senior Trainer', avatar: '/testimonial-3.jpg' },
]

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]
const INTERVAL = 5000

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const next = useCallback(() => setCurrent((p) => (p + 1) % TESTIMONIALS.length), [])
  const prev = useCallback(() => setCurrent((p) => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length), [])

  useEffect(() => {
    if (!isAutoPlaying) return
    const timer = setInterval(next, INTERVAL)
    return () => clearInterval(timer)
  }, [isAutoPlaying, next])

  const t = TESTIMONIALS[current]

  return (
    <section className="bg-[off-white-2] py-20 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASE }} className="font-mono text-xs text-cyan uppercase tracking-[0.1em] mb-4">Testimonials</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.5, ease: EASE }} className="font-playfair text-3xl sm:text-4xl font-bold text-[gray-950]">What Our Clients Say</motion.h2>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASE }} className="relative" onMouseEnter={() => setIsAutoPlaying(false)} onMouseLeave={() => setIsAutoPlaying(true)}>
          <button onClick={prev} className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-6 w-12 h-12 rounded-full bg-white border border-[gray-200] items-center justify-center text-[gray-550] hover:text-[gray-950] hover:bg-[#F1F3F5] transition-colors z-10" aria-label="Previous"><ChevronLeft size={20} /></button>
          <button onClick={next} className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-6 w-12 h-12 rounded-full bg-white border border-[gray-200] items-center justify-center text-[gray-550] hover:text-[gray-950] hover:bg-[#F1F3F5] transition-colors z-10" aria-label="Next"><ChevronRight size={20} /></button>

          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div key={current} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4, ease: EASE }} className="bg-white border border-[gray-200] rounded-2xl p-8 sm:p-10 min-h-[280px] flex flex-col justify-between">
                <div>
                  <Quote size={48} className="text-cyan opacity-10 mb-4" />
                  <p className="text-[gray-950] text-base sm:text-lg italic leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                </div>
                <div className="flex items-center gap-4 mt-8">
                  <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-[gray-950]">{t.name}</p>
                    <p className="text-sm text-[gray-550]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-colors duration-200 ${i === current ? 'bg-cyan' : 'bg-[gray-200] hover:bg-[gray-300]'}`} aria-label={`Go to testimonial ${i + 1}`} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
