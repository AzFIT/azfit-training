import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { classifyIntent } from './intent-classifier';
import { generateResponse } from './response-generator';
import type { ChatMessage, PageContext } from './types';

const STORAGE_KEY = 'azfit_chat_messages';

function getDefaultPageContext(): PageContext {
  const path = window.location.hash.replace('#', '') || '/';
  if (path.startsWith('/trainer/dashboard')) return { pageId: 'trainer_dashboard', primaryContext: 'client', allowedContexts: ['client', 'workout', 'nutrition', 'general'] };
  if (path.startsWith('/trainer/clients')) return { pageId: 'client_directory', primaryContext: 'client', allowedContexts: ['client', 'general'] };
  if (path.startsWith('/trainer/client')) return { pageId: 'client_profile', primaryContext: 'client', allowedContexts: ['client', 'workout', 'nutrition', 'general'] };
  if (path.startsWith('/trainer/calendar')) return { pageId: 'calendar', primaryContext: 'client', allowedContexts: ['client', 'general'] };
  if (path.startsWith('/trainer/programs')) return { pageId: 'programs', primaryContext: 'workout', allowedContexts: ['workout', 'client', 'nutrition', 'general'] };
  if (path.startsWith('/trainer/nutrition')) return { pageId: 'nutrition', primaryContext: 'nutrition', allowedContexts: ['nutrition', 'client', 'workout', 'general'] };
  if (path.startsWith('/programs')) return { pageId: 'programs', primaryContext: 'workout', allowedContexts: ['workout', 'client', 'nutrition', 'general'] };
  if (path.startsWith('/exercises')) return { pageId: 'exercise_library', primaryContext: 'workout', allowedContexts: ['workout', 'general'] };
  if (path.startsWith('/settings')) return { pageId: 'settings', primaryContext: 'general', allowedContexts: ['workout', 'nutrition', 'client', 'general'] };
  if (path.startsWith('/notifications')) return { pageId: 'notifications', primaryContext: 'client', allowedContexts: ['client', 'general'] };
  return { pageId: 'landing', primaryContext: 'general', allowedContexts: ['workout', 'nutrition', 'client', 'general'] };
}

function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return [{
    id: 'welcome',
    role: 'assistant',
    content: "Hello! I'm AzFIT AI, your fitness assistant by AzTechFit Hong Kong. I can help you with workouts, nutrition, client management, and platform questions. What would you like to explore?",
    timestamp: new Date().toISOString(),
    context: 'general',
    suggestions: ['Workouts', 'Nutrition', 'Client Management', 'Platform Help'],
  }];
}

export default function AIChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Persist messages
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking delay
    await new Promise(r => setTimeout(r, 600 + Math.random() * 600));

    const pageContext = getDefaultPageContext();
    const intent = classifyIntent(trimmed, pageContext, 'client', []);
    const { response, suggestions } = generateResponse(intent, trimmed, pageContext, 'client');

    const aiMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
      context: intent.context,
      suggestions,
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const clearHistory = () => {
    const welcome = loadMessages()[0];
    setMessages([welcome]);
  };

  return (
    <>
      {/* Toggle: Floating button controls panel */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ position: 'fixed', right: '24px', bottom: '24px', zIndex: 9999 }}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-[cyan] to-[cyan-dark] text-white shadow-[0_4px_20px_rgba(0,174,239,0.4)] flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
        {!isOpen && <span className="absolute inset-0 rounded-full bg-cyan animate-ping opacity-20" style={{ animationDuration: '2.5s' }} />}
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            style={{ position: 'fixed', right: '24px', bottom: '100px', zIndex: 9998, width: '380px', maxWidth: 'calc(100vw - 48px)' }}
            className="bg-white dark:bg-[az-black-card] rounded-2xl shadow-[0_24px_48px_rgba(0,0,0,0.2)] border border-gray-200 dark:border-white/[0.08] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/[0.08] bg-gradient-to-r from-[cyan]/10 to-transparent">
              <div className="flex items-center gap-2">
                <Bot size={20} className="text-cyan" />
                <span className="font-semibold text-sm text-gray-900 dark:text-white">AzFIT AI Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={clearHistory} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" title="Clear history">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
              {messages.map((msg) => (
                <div key={msg.id} className={cn('flex gap-2.5', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                  <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0', msg.role === 'user' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-cyan-glow')}>
                    {msg.role === 'user' ? <User size={14} className="text-gray-600 dark:text-gray-300" /> : <Bot size={14} className="text-cyan" />}
                  </div>
                  <div className={cn('max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed', msg.role === 'user' ? 'bg-cyan text-white rounded-br-sm' : 'bg-gray-100 dark:bg-white/[0.06] text-gray-800 dark:text-gray-200 rounded-bl-sm')}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {/* Suggestions */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {msg.suggestions.map(s => (
                          <button key={s} onClick={() => handleSuggestionClick(s)} className="text-xs px-2.5 py-1 rounded-full bg-white/20 dark:bg-white/10 text-cyan hover:bg-cyan/20 transition-colors border border-cyan/20">
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-cyan-glow flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-cyan" />
                  </div>
                  <div className="bg-gray-100 dark:bg-white/[0.06] rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 dark:border-white/[0.08] p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask AzFIT AI..."
                  className="flex-1 bg-gray-100 dark:bg-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[cyan]/30"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 rounded-xl bg-cyan text-white flex items-center justify-center hover:bg-[cyan-dark] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
