/**
 * LandingPage - Public landing page for AzFIT
 * Hero, stats bar, features grid, how it works, testimonial, CTA banner, footer.
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  TrendingUp,
  Apple,
  UserPlus,
  Dumbbell,
  LineChart,
  ChevronDown,
  Star,
} from 'lucide-react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

/* ─── Animated Counter ─── */
function useCountUp(end: number, duration: number, inView: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, end, duration]);
  return count;
}

function StatItem({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const count = useCountUp(value, 2, inView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <div className="font-mono text-data-lg text-white">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-caption text-gray-400 uppercase tracking-widest mt-1">{label}</div>
    </motion.div>
  );
}

/* ─── Testimonial Data ─── */
const testimonials = [
  {
    quote: "AzFIT transformed how I train my clients. The BioPrint tracking and detailed dashboards let me make data-driven adjustments that have produced better results in 3 months than I saw in a year before.",
    name: "Sarah Chen",
    role: "Personal Trainer, 5 years experience",
    rating: 5,
  },
  {
    quote: "The assessment process was thorough and eye-opening. For the first time, I felt like my program was truly built for me, not just a template pulled off the internet.",
    name: "Marcus Lim",
    role: "Client, 12 week program",
    rating: 5,
  },
  {
    quote: "As a gym owner, AzFIT has streamlined everything. From client onboarding to progress tracking, it's the complete package I was looking for.",
    name: "David Wong",
    role: "Gym Owner, AzTechFit partner",
    rating: 5,
  },
];

/* ─── Main Page ─── */
export default function LandingPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((p) => (p + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white">
      {/* ====== HERO ====== */}
      <section ref={heroRef} className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="./hero-bg.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/70 via-[#0A0A0A]/50 to-[#0A0A0A]" />
        </div>
        {/* Noise */}
        <div className="noise-overlay" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-[800px] mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-caption uppercase tracking-[0.15em] text-[#00AEEF] font-semibold mb-4"
          >
            AzTechFit Hong Kong
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="font-playfair text-display-xl text-white mb-2"
          >
            Smart Training.
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="font-playfair text-display-xl mb-6"
          >
            <span className="text-white">Engineered </span>
            <span className="text-[#00AEEF]">For You.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="text-body-lg text-gray-300 max-w-[600px] mx-auto mb-8"
          >
            The professional fitness platform that connects trainers and clients with data-driven insights, comprehensive assessments, and intelligent program design.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.1 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            <Link
              to="/login?role=trainer"
              className="px-6 py-3 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/10 transition-all"
            >
              Trainer Login
            </Link>
            <Link
              to="/signup?role=client"
              className="btn-primary px-6 py-3"
            >
              Client Sign Up
            </Link>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 rounded-xl text-[#00AEEF] font-medium hover:bg-[rgba(0,174,239,0.1)] transition-all"
            >
              Explore the Platform
            </button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={28} className="text-white/60" />
          </motion.div>
        </motion.div>
      </section>

      {/* ====== STATS BAR ====== */}
      <section className="bg-[#0A0A0A] relative">
        <div className="noise-overlay noise-overlay-light" />
        <div className="border-t border-b border-white/[0.06] py-12 px-4 sm:px-6 relative z-10">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem value={500} suffix="+" label="Clients Trained" delay={0} />
            <StatItem value={50} suffix="+" label="Expert Trainers" delay={0.15} />
            <StatItem value={10000} suffix="+" label="Sessions Completed" delay={0.3} />
            <StatItem value={98} suffix="%" label="Client Satisfaction" delay={0.45} />
          </div>
        </div>
      </section>

      {/* ====== FEATURES ====== */}
      <section id="features" className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <p className="text-caption uppercase tracking-[0.1em] text-[#00AEEF] font-semibold mb-3">
              Why AzFIT
            </p>
            <h2 className="font-playfair text-display-md text-gray-900 mb-4">
              Everything You Need to Train Smarter
            </h2>
            <p className="text-body-md text-gray-500 max-w-[500px] mx-auto">
              From initial assessment to ongoing optimization, AzFIT provides the tools trainers need and the insights clients want.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                img: '/landing-feature-2.jpg',
                icon: ClipboardList,
                iconColor: 'text-[#00AEEF]',
                iconBg: 'bg-[rgba(0,174,239,0.15)]',
                title: 'Comprehensive Assessments',
                body: 'BioPrint tracking, body composition analysis, PAR-Q screening, and lifestyle assessments \u2014 all in one unified platform.',
              },
              {
                img: '/landing-feature-1.jpg',
                icon: TrendingUp,
                iconColor: 'text-success',
                iconBg: 'bg-success-light',
                title: 'Data-Driven Progress',
                body: 'Real-time dashboards, sparkline trends, and detailed analytics help trainers make informed decisions and clients see their progress.',
              },
              {
                img: '/landing-feature-3.jpg',
                icon: Apple,
                iconColor: 'text-warning',
                iconBg: 'bg-warning-light',
                title: 'Smart Nutrition Planning',
                body: 'TDEE calculation, macro tracking with interactive ring charts, Smart Swap food alternatives, and gamified nutrition scoring.',
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: i * 0.12 }}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${card.iconBg} mb-4`}>
                    <card.icon size={22} className={card.iconColor} />
                  </div>
                  <h3 className="text-heading-sm font-semibold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-body-sm text-gray-500">{card.body}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link to="/signup" className="btn-primary inline-block">
              Start Your Journey &rarr;
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-14"
          >
            <p className="text-caption uppercase tracking-[0.1em] text-[#00AEEF] font-semibold mb-3">
              How It Works
            </p>
            <h2 className="font-playfair text-display-md text-gray-900">
              Your Fitness Journey in Three Steps
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting lines (desktop) */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gray-200" />

            {[
              {
                num: '01',
                icon: UserPlus,
                title: 'Sign Up & Onboard',
                desc: 'Create your account, complete the guided onboarding with goals, body composition, and lifestyle assessment.',
              },
              {
                num: '02',
                icon: Dumbbell,
                title: 'Train with Data',
                desc: 'Your trainer designs personalized programs based on your assessment data. Every session is logged and tracked.',
              },
              {
                num: '03',
                icon: LineChart,
                title: 'Track & Optimize',
                desc: 'Monitor progress through detailed dashboards, BioPrint tracking, and nutrition analytics. Adjust and improve continuously.',
              },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="relative text-center"
              >
                <span className="font-playfair text-[4rem] text-[#00AEEF]/30 leading-none select-none">
                  {step.num}
                </span>
                <div className="w-16 h-16 mx-auto -mt-6 mb-4 rounded-full bg-[rgba(0,174,239,0.15)] flex items-center justify-center relative z-10">
                  <step.icon size={28} className="text-[#00AEEF]" />
                </div>
                <h3 className="text-heading-sm font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-body-sm text-gray-500 max-w-[280px] mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== TESTIMONIAL ====== */}
      <section className="py-24 px-4 sm:px-6 bg-[#0A0A0A] relative">
        <div className="noise-overlay" />
        <div className="max-w-[800px] mx-auto relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="glass-card rounded-2xl p-8 md:p-10 relative"
            >
              {/* Quote mark */}
              <span className="absolute top-4 left-6 font-playfair text-[8rem] leading-none text-[#00AEEF]/15 select-none">
                &ldquo;
              </span>

              <div className="relative z-10">
                <p className="font-playfair italic text-heading-lg text-white leading-relaxed mb-6">
                  {testimonials[activeTestimonial].quote}
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-cyan flex items-center justify-center text-white font-semibold text-lg">
                    {testimonials[activeTestimonial].name[0]}
                  </div>
                  <div>
                    <p className="text-body-md font-semibold text-white">
                      {testimonials[activeTestimonial].name}
                    </p>
                    <p className="text-body-sm text-gray-400">
                      {testimonials[activeTestimonial].role}
                    </p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <Star key={i} size={16} className="text-warning fill-warning" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === activeTestimonial ? 'bg-[#00AEEF]' : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ====== CTA BANNER ====== */}
      <section className="relative py-24 px-4 sm:px-6 bg-gradient-hero">
        <div className="noise-overlay" />
        <div className="max-w-[600px] mx-auto text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-playfair text-display-md text-white mb-4"
          >
            Ready to Transform Your Training?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-body-lg text-gray-300 mb-8"
          >
            Join AzFIT today and experience the future of fitness training management.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link
              to="/signup?role=trainer"
              className="px-6 py-3 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/10 transition-all"
            >
              Join as Trainer
            </Link>
            <Link to="/signup?role=client" className="btn-primary px-6 py-3">
              Join as Client
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
