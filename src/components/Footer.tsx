/**
 * Footer - Public footer component
 * Dark background, 4-column layout with brand, links, resources, and social.
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="bg-[#111827] dark:bg-[#0A0A0A] text-gray-400">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-16"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <img
              src="./AzFIT_Logo_BlackBackground_Text.png"
              alt="AzFIT"
              className="h-10 w-auto mb-4"
            />
            <p className="text-sm leading-relaxed">
              Smart Training. Engineered For You. The professional fitness platform for trainers and clients.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3">
              {['Brand Story', 'Pricing', 'Login', 'Sign Up'].map((label) => (
                <li key={label}>
                  <Link
                    to={label === 'Sign Up' ? '/signup' : label === 'Login' ? '/login' : label === 'Brand Story' ? '/brand-story' : '/subscribe'}
                    className="text-sm hover:text-[#00AEEF] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Resources</h4>
            <ul className="space-y-3">
              {['Help Center', 'Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((label) => (
                <li key={label}>
                  <span className="text-sm hover:text-[#00AEEF] transition-colors cursor-pointer">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Connect</h4>
            <p className="text-sm mb-2">AzTechFit Singapore</p>
            <p className="text-sm">hello@aztechfit.com</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">&copy; {new Date().getFullYear()} AzTechFit. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="text-xs hover:text-[#00AEEF] cursor-pointer transition-colors">Privacy</span>
            <span className="text-xs hover:text-[#00AEEF] cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
