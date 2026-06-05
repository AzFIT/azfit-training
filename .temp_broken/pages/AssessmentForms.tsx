/**
 * AssessmentForms — Selector for PAR-Q, BioPrint, and Body Stats assessment forms.
 * Route: /trainer/assessments
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, Ruler, Activity, ArrowLeft } from 'lucide-react';
import PARQForm from './assessments/PARQForm';
import BioPrintForm from './assessments/BioPrintForm';
import BodyStatsForm from './assessments/BodyStatsForm';

type FormType = 'selector' | 'parq' | 'bioprint' | 'bodystats';

const FORMS = [
  { id: 'parq' as const, label: 'PAR-Q', description: 'Pre-Activity Readiness Questionnaire — 7-item health screening', icon: ClipboardCheck, color: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50 dark:bg-blue-900/10' },
  { id: 'bioprint' as const, label: 'BioPrint', description: '8-site skinfold measurement for body fat analysis', icon: Ruler, color: 'from-purple-500 to-purple-600', bgLight: 'bg-purple-50 dark:bg-purple-900/10' },
  { id: 'bodystats' as const, label: 'Body Stats', description: 'Circumference measurements, BMI, and body composition', icon: Activity, color: 'from-emerald-500 to-emerald-600', bgLight: 'bg-emerald-50 dark:bg-emerald-900/10' },
];

export default function AssessmentForms() {
  const [activeForm, setActiveForm] = useState<FormType>('selector');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <AnimatePresence mode="wait">
        {activeForm === 'selector' && (
          <motion.div key="selector" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Assessment Forms</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose an assessment type to begin evaluation</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FORMS.map((form) => {
                const Icon = form.icon;
                return (
                  <button
                    key={form.id}
                    onClick={() => setActiveForm(form.id)}
                    className={`${form.bgLight} rounded-2xl p-8 border border-gray-100 dark:border-white/5 hover:border-[#00AEEF]/30 transition-all hover:shadow-lg hover:-translate-y-1 text-left group`}
                  >
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${form.color} flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{form.label}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{form.description}</p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeForm === 'parq' && (
          <motion.div key="parq" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={() => setActiveForm('selector')} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Forms
            </button>
            <PARQForm />
          </motion.div>
        )}

        {activeForm === 'bioprint' && (
          <motion.div key="bioprint" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={() => setActiveForm('selector')} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Forms
            </button>
            <BioPrintForm />
          </motion.div>
        )}

        {activeForm === 'bodystats' && (
          <motion.div key="bodystats" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={() => setActiveForm('selector')} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Forms
            </button>
            <BodyStatsForm />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
