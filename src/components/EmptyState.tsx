/**
 * EmptyState - Reusable empty state component with icon, title, description, and optional action.
 */
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center max-w-[400px] mx-auto py-16 px-4"
    >
      {icon && (
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-6 text-gray-300"
        >
          {icon}
        </motion.div>
      )}
      <h3 className="text-heading-sm text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
      <p className="text-body-sm text-gray-500 mb-6">{description}</p>
      {action}
    </motion.div>
  );
}
