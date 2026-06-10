/**
 * AzFIT Weekly Check-In
 * Extracted from NEWAZFIT Trainer master sheet — Weekly Check-In tab
 * 11-question form for client weekly review
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  Trophy,
  Brain,
  Dumbbell,
  Moon,
  Calendar,
  AlertTriangle,
  TrendingUp,
  MessageCircle,
  HelpCircle,
  CreditCard,
  Send,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import Layout from '@/components/Layout';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CheckInQuestion {
  id: number;
  question: string;
  icon: React.ElementType;
  placeholder: string;
  type: 'text' | 'number' | 'scale';
}

interface CheckInEntry {
  id: string;
  clientName: string;
  weekNumber: number;
  date: string;
  answers: Record<number, string>;
  status: 'draft' | 'submitted';
}

/* ------------------------------------------------------------------ */
/*  Questions (from Excel Weekly Check-In sheet)                       */
/* ------------------------------------------------------------------ */

const QUESTIONS: CheckInQuestion[] = [
  {
    id: 1,
    question: "This week's wins and achievements",
    icon: Trophy,
    placeholder: "What did you achieve this week? Any PRs, consistency milestones, or non-scale victories?",
    type: 'text',
  },
  {
    id: 2,
    question: "Any comments on stress levels and management techniques?",
    icon: Brain,
    placeholder: "How was your stress this week? What techniques helped you manage it?",
    type: 'text',
  },
  {
    id: 3,
    question: "How was gym performance this week?",
    icon: Dumbbell,
    placeholder: "Rate your energy, strength, and overall performance in training...",
    type: 'scale',
  },
  {
    id: 4,
    question: "How was recovery in general this week?",
    icon: Moon,
    placeholder: "Sleep quality, soreness levels, readiness to train...",
    type: 'scale',
  },
  {
    id: 5,
    question: "Number of weeks on current training set-up",
    icon: Calendar,
    placeholder: "How many weeks have you been following the current program?",
    type: 'number',
  },
  {
    id: 6,
    question: "Number of weeks since deload",
    icon: Calendar,
    placeholder: "When was your last deload week?",
    type: 'number',
  },
  {
    id: 7,
    question: "Is there anything you struggled with this week?",
    icon: AlertTriangle,
    placeholder: "Nutrition adherence, sleep, motivation, time management...",
    type: 'text',
  },
  {
    id: 8,
    question: "Is there any area you want to improve next week?",
    icon: TrendingUp,
    placeholder: "What will you focus on improving in the coming week?",
    type: 'text',
  },
  {
    id: 9,
    question: "Is there anything else you would like to discuss about your week?",
    icon: MessageCircle,
    placeholder: "Any other thoughts, observations, or concerns...",
    type: 'text',
  },
  {
    id: 10,
    question: "Is there anything you would like me to run through for you?",
    icon: HelpCircle,
    placeholder: "Exercise technique, nutrition questions, program adjustments...",
    type: 'text',
  },
  {
    id: 11,
    question: "Date of payment (if not using Go Cardless / if using Paypal, please fill in)",
    icon: CreditCard,
    placeholder: "Payment date or confirmation...",
    type: 'text',
  },
];

/* ------------------------------------------------------------------ */
/*  Mock history data                                                  */
/* ------------------------------------------------------------------ */

const MOCK_HISTORY: CheckInEntry[] = [
  {
    id: 'ci-1',
    clientName: 'Alex Chen',
    weekNumber: 4,
    date: '2025-06-03',
    answers: {
      1: 'Hit 100kg squat for 5 reps. Completed all 4 sessions.',
      3: '8',
      4: '7',
      5: '4',
      6: '3',
    },
    status: 'submitted',
  },
  {
    id: 'ci-2',
    clientName: 'Sarah Miller',
    weekNumber: 8,
    date: '2025-06-02',
    answers: {
      1: 'Lost 1.2kg this week. New PB on deadlift.',
      3: '7',
      4: '6',
      5: '8',
      6: '5',
    },
    status: 'submitted',
  },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function QuestionCard({
  question,
  value,
  onChange,
  isActive,
}: {
  question: CheckInQuestion;
  value: string;
  onChange: (val: string) => void;
  isActive: boolean;
}) {
  const Icon = question.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-xl border p-5 space-y-4"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: isActive ? '#0D948840' : 'var(--light-border)',
        boxShadow: isActive ? '0 0 0 1px #0D948820' : 'none',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#0D948815' }}
        >
          <Icon className="w-5 h-5" style={{ color: '#0D9488' }} />
        </div>
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#0D948815', color: '#0D9488' }}>
            Q{question.id}
          </span>
          <h3 className="text-sm font-semibold mt-1" style={{ color: 'var(--light-text-primary)' }}>
            {question.question}
          </h3>
        </div>
      </div>

      {question.type === 'scale' && (
        <div className="space-y-3">
          <div className="flex justify-between text-[10px]" style={{ color: 'var(--light-text-muted)' }}>
            <span>Poor (1)</span>
            <span>Excellent (10)</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                onClick={() => onChange(String(n))}
                className="flex-1 h-10 rounded-lg text-sm font-semibold transition-all"
                style={{
                  backgroundColor: value === String(n) ? '#0D9488' : 'var(--light-elevated)',
                  color: value === String(n) ? '#fff' : 'var(--light-text-secondary)',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {question.type === 'number' && (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          className="w-full px-4 py-3 rounded-lg text-sm border outline-none focus:ring-2 transition-all"
          style={{
            backgroundColor: 'var(--light-elevated)',
            borderColor: 'var(--light-border)',
            color: 'var(--light-text-primary)',
            '--tw-ring-color': '#0D9488',
          } as React.CSSProperties}
        />
      )}

      {question.type === 'text' && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          rows={3}
          className="w-full px-4 py-3 rounded-lg text-sm border outline-none focus:ring-2 transition-all resize-none"
          style={{
            backgroundColor: 'var(--light-elevated)',
            borderColor: 'var(--light-border)',
            color: 'var(--light-text-primary)',
            '--tw-ring-color': '#0D9488',
          } as React.CSSProperties}
        />
      )}
    </motion.div>
  );
}

function HistoryView({ entries }: { entries: CheckInEntry[] }) {
  return (
    <div className="space-y-4">
      {entries.map((entry, idx) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="rounded-xl border p-4"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--light-border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#0D948815' }}
              >
                <ClipboardList className="w-4 h-4" style={{ color: '#0D9488' }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--light-text-primary)' }}>
                  {entry.clientName}
                </p>
                <p className="text-[10px]" style={{ color: 'var(--light-text-muted)' }}>
                  Week {entry.weekNumber} · {entry.date}
                </p>
              </div>
            </div>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ backgroundColor: '#84CC1615', color: '#84CC16' }}
            >
              <CheckCircle2 className="w-3 h-3" />
              Submitted
            </span>
          </div>
          <div className="space-y-2">
            {Object.entries(entry.answers).slice(0, 3).map(([qId, answer]) => {
              const q = QUESTIONS.find((qq) => qq.id === Number(qId));
              if (!q) return null;
              return (
                <div key={qId} className="text-xs">
                  <span style={{ color: 'var(--light-text-muted)' }}>{q.question}:</span>{' '}
                  <span style={{ color: 'var(--light-text-primary)' }}>{answer}</span>
                </div>
              );
            })}
            {Object.keys(entry.answers).length > 3 && (
              <p className="text-[10px]" style={{ color: 'var(--light-text-muted)' }}>
                +{Object.keys(entry.answers).length - 3} more answers
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function CheckIn() {
  const [mode, setMode] = useState<'form' | 'history'>('form');
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;
  const answeredCount = Object.values(answers).filter((v) => v.trim()).length;

  const handleAnswer = (val: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) setCurrentStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  if (submitted) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
              style={{ backgroundColor: '#84CC1615' }}
            >
              <CheckCircle2 className="w-10 h-10" style={{ color: '#84CC16' }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--light-text-primary)' }}>
              Check-In Submitted!
            </h2>
            <p className="text-sm" style={{ color: 'var(--light-text-muted)' }}>
              Your coach will review your responses and get back to you soon.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setAnswers({});
                  setCurrentStep(0);
                }}
                className="px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: '#0D9488' }}
              >
                New Check-In
              </button>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setMode('history');
                }}
                className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: 'var(--light-elevated)',
                  color: 'var(--light-text-secondary)',
                }}
              >
                View History
              </button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--light-text-primary)' }}>
              Weekly Check-In
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--light-text-muted)' }}>
              Review your week and communicate with your coach
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('form')}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: mode === 'form' ? '#0D9488' : 'var(--light-elevated)',
                color: mode === 'form' ? '#fff' : 'var(--light-text-secondary)',
              }}
            >
              New Check-In
            </button>
            <button
              onClick={() => setMode('history')}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: mode === 'history' ? '#0D9488' : 'var(--light-elevated)',
                color: mode === 'history' ? '#fff' : 'var(--light-text-secondary)',
              }}
            >
              History
            </button>
          </div>
        </div>

        {mode === 'history' ? (
          <HistoryView entries={MOCK_HISTORY} />
        ) : (
          <>
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--light-text-muted)' }}>
                  Question {currentStep + 1} of {QUESTIONS.length}
                </span>
                <span style={{ color: 'var(--light-text-muted)' }}>
                  {answeredCount} answered
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--light-border)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: '#0D9488' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
              >
                <QuestionCard
                  question={currentQuestion}
                  value={answers[currentQuestion.id] || ''}
                  onChange={handleAnswer}
                  isActive
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-30"
                style={{
                  backgroundColor: 'var(--light-elevated)',
                  color: 'var(--light-text-secondary)',
                }}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {currentStep === QUESTIONS.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#0D9488' }}
                >
                  <Send className="w-4 h-4" />
                  Submit Check-In
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#0D9488' }}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick nav dots */}
            <div className="flex justify-center gap-1.5">
              {QUESTIONS.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentStep(idx)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{
                    backgroundColor:
                      idx === currentStep
                        ? '#0D9488'
                        : answers[q.id]
                        ? '#84CC16'
                        : 'var(--light-border)',
                    transform: idx === currentStep ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
