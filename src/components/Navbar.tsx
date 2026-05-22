/**
 * Navbar - Public/Logged-out navigation bar
 * Fixed top, transparent → solid on scroll. Shows AzFIT wordmark, nav links, and CTA.
 */
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  // On non-landing pages, always use dark text + solid background
  const isLanding = location.pathname === '/' || location.pathname === '';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Brand Story', to: '/brand-story' },
    { label: 'Pricing', to: '/subscribe' },
    { label: 'Login', to: '/login' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center transition-all duration-300 ${
          scrolled || !isLanding
            ? 'bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-xl shadow-sm border-b border-gray-200 dark:border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src={scrolled || !isLanding ? './AzFIT_Logo_WhiteBackground_Text.png' : './AzFIT_Logo_BlackBackground_Text.png'}
              alt="AzFIT"
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-[#00AEEF] ${
                  scrolled || !isLanding
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-white/80'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/signup"
              className="btn-primary text-sm px-5 py-2"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              scrolled || !isLanding ? 'text-gray-900 dark:text-white' : 'text-white'
            }`}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-white dark:bg-[#0A0A0A] md:hidden"
          >
            <div className="flex flex-col h-full p-6 pt-20">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="py-4 text-lg font-medium text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 hover:text-[#00AEEF] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/signup"
                onClick={() => setMobileOpen(false)}
                className="btn-primary text-center mt-6"
              >
                Get Started
              </Link>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-900 dark:text-white"
            >
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
