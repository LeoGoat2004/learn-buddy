export interface Knowledge {
  id: string;
  url: string;
  title: string;
  topic: string;
  goals: string;
  tags: string[];
  notes: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
  reviewCount: number;
  lastReviewedAt?: string;
  mastered: boolean;
  bookmarked: boolean;
}

export interface Topic {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  relatedKnowledgeIds?: string[];
}

export interface ReviewSession {
  id: string;
  topic?: string;
  messages: Message[];
  startedAt: string;
  endedAt?: string;
  status: 'active' | 'completed';
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  defaultTopic?: string;
  reviewMode: 'quiz' | 'summary' | 'free';
  notifications: {
    reviewReminder: boolean;
    dailyGoal: number;
  };
}

export type ReviewMode = 'quiz' | 'summary' | 'free';

export type AIProvider = 'openai' | 'claude' | 'custom';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  enabled: boolean;
}

export interface AIProviderOption {
  id: AIProvider;
  nameKey: string;
  descriptionKey: string;
  defaultModel: string;
  baseUrl: string;
}

export const AI_PROVIDERS: AIProviderOption[] = [
  {
    id: 'openai',
    nameKey: 'settings.providers.openai',
    descriptionKey: 'settings.providers.openaiDesc',
    defaultModel: 'gpt-4',
    baseUrl: 'https://api.openai.com/v1',
  },
  {
    id: 'claude',
    nameKey: 'settings.providers.claude',
    descriptionKey: 'settings.providers.claudeDesc',
    defaultModel: 'claude-3-sonnet-20240229',
    baseUrl: 'https://api.anthropic.com/v1',
  },
  {
    id: 'custom',
    nameKey: 'settings.providers.custom',
    descriptionKey: 'settings.providers.customDesc',
    defaultModel: 'gpt-3.5-turbo',
    baseUrl: '',
  },
];
