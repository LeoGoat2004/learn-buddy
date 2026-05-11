import { Knowledge, Topic, ReviewSession, UserPreferences, AIConfig } from '../types';

const STORAGE_KEYS = {
  KNOWLEDGE: 'knowledge_list',
  TOPICS: 'topics',
  REVIEW_SESSIONS: 'review_sessions',
  PREFERENCES: 'user_preferences',
  AI_CONFIG: 'ai_config',
} as const;

export const storage = {
  getKnowledgeList(): Knowledge[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load knowledge list:', error);
      return [];
    }
  },

  saveKnowledge(knowledge: Knowledge): void {
    try {
      const list = this.getKnowledgeList();
      list.push(knowledge);
      localStorage.setItem(STORAGE_KEYS.KNOWLEDGE, JSON.stringify(list));
    } catch (error) {
      console.error('Failed to save knowledge:', error);
      throw error;
    }
  },

  updateKnowledge(id: string, updates: Partial<Knowledge>): void {
    try {
      const list = this.getKnowledgeList();
      const index = list.findIndex(item => item.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.KNOWLEDGE, JSON.stringify(list));
      }
    } catch (error) {
      console.error('Failed to update knowledge:', error);
      throw error;
    }
  },

  deleteKnowledge(id: string): void {
    try {
      const list = this.getKnowledgeList();
      const filtered = list.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEYS.KNOWLEDGE, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete knowledge:', error);
      throw error;
    }
  },

  getTopics(): Topic[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOPICS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load topics:', error);
      return [];
    }
  },

  saveTopic(topic: Topic): void {
    try {
      const list = this.getTopics();
      list.push(topic);
      localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(list));
    } catch (error) {
      console.error('Failed to save topic:', error);
      throw error;
    }
  },

  deleteTopic(id: string): void {
    try {
      const list = this.getTopics();
      const filtered = list.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete topic:', error);
      throw error;
    }
  },

  getReviewSessions(): ReviewSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REVIEW_SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load review sessions:', error);
      return [];
    }
  },

  saveReviewSession(session: ReviewSession): void {
    try {
      const list = this.getReviewSessions();
      const index = list.findIndex(s => s.id === session.id);
      if (index !== -1) {
        list[index] = session;
      } else {
        list.push(session);
      }
      localStorage.setItem(STORAGE_KEYS.REVIEW_SESSIONS, JSON.stringify(list));
    } catch (error) {
      console.error('Failed to save review session:', error);
      throw error;
    }
  },

  getPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return data ? JSON.parse(data) : this.getDefaultPreferences();
    } catch (error) {
      console.error('Failed to load preferences:', error);
      return this.getDefaultPreferences();
    }
  },

  savePreferences(prefs: UserPreferences): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
    } catch (error) {
      console.error('Failed to save preferences:', error);
      throw error;
    }
  },

  getDefaultPreferences(): UserPreferences {
    return {
      theme: 'light',
      sidebarCollapsed: false,
      reviewMode: 'free',
      notifications: {
        reviewReminder: true,
        dailyGoal: 5,
      },
    };
  },

  getAIConfig(): AIConfig | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AI_CONFIG);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load AI config:', error);
      return null;
    }
  },

  saveAIConfig(config: AIConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AI_CONFIG, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save AI config:', error);
      throw error;
    }
  },

  exportData(): string {
    try {
      const data = {
        knowledgeList: this.getKnowledgeList(),
        topics: this.getTopics(),
        preferences: this.getPreferences(),
        aiConfig: this.getAIConfig(),
        exportedAt: new Date().toISOString(),
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  },

  importData(json: string): boolean {
    try {
      const data = JSON.parse(json);
      if (data.knowledgeList) {
        localStorage.setItem(STORAGE_KEYS.KNOWLEDGE, JSON.stringify(data.knowledgeList));
      }
      if (data.topics) {
        localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(data.topics));
      }
      if (data.preferences) {
        localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(data.preferences));
      }
      if (data.aiConfig) {
        localStorage.setItem(STORAGE_KEYS.AI_CONFIG, JSON.stringify(data.aiConfig));
      }
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  },

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.KNOWLEDGE);
    localStorage.removeItem(STORAGE_KEYS.TOPICS);
    localStorage.removeItem(STORAGE_KEYS.REVIEW_SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.AI_CONFIG);
  },
};

export default storage;
