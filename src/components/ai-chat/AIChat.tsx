import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { classifyIntent } from './intent-classifier';
import { generateResponse } from './response-generator';
import type { ChatMessage, PageContext } from './types';

const MESSAGES_KEY = 'azfit_chat_messages';
const BUTTON_SIZE = 56;

function getPageContext(): PageContext {
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
    const raw = localStorage.getItem(MESSAGES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return [{
    id: 'welcome',
    role: 'assistant',
    content: "Hello! I'm AzFIT AI, your fitness assistant by AzTechFit Hong Kong. I can help with workouts, nutrition, client management, and platform questions. What would you like to explore?",
    timestamp: new Date().toISOString(),
    context: 'general',
    suggestions: ['Workouts', 'Nutrition', 'Client Management', 'Platform Help'],
  }];
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Detect mobile keyboard and reposition
  const [isMobileKeyboardOpen, setIsMobileKeyboardOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight;
      const fullVh = window.visualViewport?.height ?? vh;
      // Keyboard open if viewport is significantly smaller than window
      setIsMobileKeyboardOpen(window.innerHeight - fullVh > 150);
    };
    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  // Button position (draggable) — starts at bottom-left
  const [pos, setPos] = useState(() => {
    const vh = window.innerHeight;
    return { x: 24, y: vh - BUTTON_SIZE - 24 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, px: 0, py: 0 });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  }, [messages]);

  // Reposition on window resize / mobile keyboard
  useEffect(() => {
    const handleViewportChange = () => {
      const vw = window.innerWidth;
      const fullVh = window.visualViewport?.height ?? window.innerHeight;
      const keyboardOpen = window.innerHeight - fullVh > 150;
      setPos(prev => {
        if (keyboardOpen && vw < 640) {
          return { x: 24, y: 80 }; // Top-left when mobile keyboard opens
        }
        return {
          x: Math.max(8, Math.min(prev.x, vw - BUTTON_SIZE - 8)),
          y: Math.max(8, Math.min(prev.y, fullVh - BUTTON_SIZE - 8)),
        };
      });
    };
    window.visualViewport?.addEventListener('resize', handleViewportChange);
    return () => window.visualViewport?.removeEventListener('resize', handleViewportChange);
  }, []);

  const handleSend = useCallback(async () => {
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

    await new Promise(r => setTimeout(r, 600 + Math.random() * 600));

    try {
      const pageContext = getPageContext();
      const intent = classifyIntent(trimmed, pageContext, 'client', []);
      const { response, suggestions } = generateResponse(intent, trimmed, pageContext, 'client');

      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        context: intent.context,
        suggestions,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I had trouble processing that. Could you rephrase your question? I can help with workouts, nutrition, client management, and platform questions.",
        timestamp: new Date().toISOString(),
        context: 'general',
      }]);
    }

    setIsTyping(false);
  }, [input, isTyping]);

  // Drag handlers
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setPos({
      x: Math.max(8, Math.min(dragStartRef.current.px + dx, vw - BUTTON_SIZE - 8)),
      y: Math.max(8, Math.min(dragStartRef.current.py + dy, vh - BUTTON_SIZE - 8)),
    });
  }, [isDragging]);

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => !isDragging && setIsOpen(!isOpen)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y,
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          zIndex: 9999,
          cursor: isDragging ? 'grabbing' : 'pointer',
          touchAction: 'none',
          userSelect: 'none',
        }}
        className="rounded-full bg-gradient-to-br from-[#00AEEF] to-[#008DC4] text-white shadow-[0_4px_20px_rgba(0,174,239,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        aria-label={isOpen ? 'Close chat' : 'Open AI chat'}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-[#00AEEF] opacity-20 animate-ping" style={{ animationDuration: '2.5s' }} />
        )}
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            style={{
              position: 'fixed',
              right: '24px',
              bottom: '100px',
              width: '380px',
              maxWidth: 'calc(100vw - 48px)',
              zIndex: 9998,
            }}
            className="bg-white dark:bg-[#141414] rounded-2xl shadow-[0_24px_48px_rgba(0,0,0,0.2)] border border-gray-200 dark:border-white/[0.08] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/[0.08] bg-gradient-to-r from-[#00AEEF]/10 to-transparent">
              <div className="flex items-center gap-2">
                <Bot size={20} className="text-[#00AEEF]" />
                <span className="font-semibold text-sm text-gray-900 dark:text-white">AzFIT AI Assistant</span>
              </div>
              <button
                onClick={() => setMessages(loadMessages().slice(0, 1))}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-white/5"
              >
                Clear
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: 300, maxHeight: 400 }}>
              {messages.map((msg) => (
                <div key={msg.id} className={cn('flex gap-2.5', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
                    msg.role === 'user' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-[rgba(0,174,239,0.15)]'
                  )}>
                    {msg.role === 'user'
                      ? <User size={14} className="text-gray-600 dark:text-gray-300" />
                      : <Bot size={14} className="text-[#00AEEF]" />
                    }
                  </div>
                  <div className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-[#00AEEF] text-white rounded-br-sm'
                      : 'bg-gray-100 dark:bg-white/[0.06] text-gray-800 dark:text-gray-200 rounded-bl-sm'
                  )}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {msg.suggestions.map(s => (
                          <button
                            key={s}
                            onClick={() => { setInput(s); }}
                            className="text-xs px-2.5 py-1 rounded-full bg-white/20 dark:bg-white/10 text-[#00AEEF] hover:bg-[#00AEEF]/20 transition-colors border border-[#00AEEF]/20"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[rgba(0,174,239,0.15)] flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-[#00AEEF]" />
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
                  onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                  placeholder="Ask AzFIT AI..."
                  className="flex-1 bg-gray-100 dark:bg-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00AEEF]/30"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 rounded-xl bg-[#00AEEF] text-white flex items-center justify-center hover:bg-[#008DC4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
