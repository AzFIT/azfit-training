import { useState, useCallback, useEffect, useRef } from 'react';
import type { ChatMessage, PageContext, ChatContext } from '@/components/ai-chat/types';
import { classifyIntent } from '@/components/ai-chat/intent-classifier';
import { generateResponse } from '@/components/ai-chat/response-generator';

const STORAGE_KEY_MESSAGES = 'azfit_chat_messages';
const STORAGE_KEY_POSITION = 'azfit_chat_position';
const STORAGE_KEY_OPEN = 'azfit_chat_open';

const DEFAULT_POSITION = { x: -1, y: -1 };

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getTimestamp(): string {
  return new Date().toISOString();
}

function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (raw) {
      const parsed = JSON.parse(raw) as ChatMessage[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* ignore */ }
  return [getWelcomeMessage()];
}

function loadPosition(): { x: number; y: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_POSITION);
    if (raw) {
      const parsed = JSON.parse(raw) as { x: number; y: number };
      if (parsed && typeof parsed.x === 'number' && typeof parsed.y === 'number') {
        return parsed;
      }
    }
  } catch { /* ignore */ }
  return DEFAULT_POSITION;
}

function loadOpenState(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OPEN);
    if (raw !== null) return raw === 'true';
  } catch { /* ignore */ }
  return false;
}

function getWelcomeMessage(): ChatMessage {
  return {
    id: generateId(),
    role: 'assistant',
    content: "Hello! I'm AzFIT AI, your fitness assistant by AzTechFit Hong Kong. I can help you with workouts, nutrition, client management, and platform questions. What would you like to explore?",
    timestamp: getTimestamp(),
    context: 'general',
    suggestions: ['Workouts', 'Nutrition', 'Client Management', 'Platform Help'],
  };
}

export interface UseAIChatReturn {
  isOpen: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
  position: { x: number; y: number };
  toggleOpen: () => void;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (content: string) => void;
  clearHistory: () => void;
  setPosition: (pos: { x: number; y: number }) => void;
}

// Detect page context from current URL
function detectPageContext(): PageContext {
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

export function useAIChat(
  pageContext?: PageContext,
  userType: string = 'client'
): UseAIChatReturn {
  const resolvedContext = pageContext || detectPageContext();
  const [isOpen, setIsOpen] = useState<boolean>(loadOpenState);
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [position, setPositionState] = useState<{ x: number; y: number }>(loadPosition);
  const historyRef = useRef<ChatContext[]>([]);

  // Persist messages to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
  }, [messages]);

  // Persist open state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_OPEN, String(isOpen));
  }, [isOpen]);

  // Persist position
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_POSITION, JSON.stringify(position));
  }, [position]);

  // Update history ref when messages change
  useEffect(() => {
    const contexts: ChatContext[] = messages
      .filter((m): m is ChatMessage & { context: ChatContext } => !!m.context)
      .map((m) => m.context);
    historyRef.current = contexts;
  }, [messages]);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const setPosition = useCallback((pos: { x: number; y: number }) => {
    setPositionState(pos);
  }, []);

  const clearHistory = useCallback(() => {
    const welcome = getWelcomeMessage();
    setMessages([welcome]);
    historyRef.current = [];
    localStorage.removeItem(STORAGE_KEY_MESSAGES);
  }, []);

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      // 1. Add user message
      const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: trimmed,
        timestamp: getTimestamp(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      // 2. Classify intent and generate response after a short delay
      const delay = 400 + Math.random() * 600; // 400-1000ms simulated thinking

      setTimeout(() => {
        const history = historyRef.current;
        const intent = classifyIntent(trimmed, resolvedContext, userType, history);
        const { response, suggestions } = generateResponse(intent, trimmed, resolvedContext, userType);

        const aiMsg: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: response,
          timestamp: getTimestamp(),
          context: intent.context,
          suggestions,
        };

        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
      }, delay);
    },
    [resolvedContext, userType]
  );

  return {
    isOpen,
    messages,
    isTyping,
    position,
    toggleOpen,
    openChat,
    closeChat,
    sendMessage,
    clearHistory,
    setPosition,
  };
}
