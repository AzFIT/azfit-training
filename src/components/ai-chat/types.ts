export type ChatContext = 'workout' | 'nutrition' | 'client' | 'general';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: ChatContext;
  suggestions?: string[];
}

export interface PageContext {
  pageId: string;
  primaryContext: ChatContext;
  allowedContexts: ChatContext[];
}

export interface IntentResult {
  action: 'direct_route' | 'route_with_confirmation' | 'cross_context_bridge' | 'clarifying_question' | 'off_topic_redirect';
  context: ChatContext;
  confidence: number;
  secondaryContexts?: ChatContext[];
}

export interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  position: { x: number; y: number };
  isDragging: boolean;
}

export type IntentAction = IntentResult['action'];
