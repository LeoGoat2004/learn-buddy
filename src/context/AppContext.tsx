import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Knowledge, Topic, UserPreferences } from '../types';
import { storage } from '../services/storage';

interface AppState {
  knowledgeList: Knowledge[];
  topics: Topic[];
  preferences: UserPreferences;
  selectedTopic: string | null;
  searchQuery: string;
  isLoading: boolean;
}

type AppAction =
  | { type: 'SET_KNOWLEDGE_LIST'; payload: Knowledge[] }
  | { type: 'ADD_KNOWLEDGE'; payload: Knowledge }
  | { type: 'UPDATE_KNOWLEDGE'; payload: { id: string; updates: Partial<Knowledge> } }
  | { type: 'DELETE_KNOWLEDGE'; payload: string }
  | { type: 'SET_TOPICS'; payload: Topic[] }
  | { type: 'ADD_TOPIC'; payload: Topic }
  | { type: 'DELETE_TOPIC'; payload: string }
  | { type: 'SET_PREFERENCES'; payload: UserPreferences }
  | { type: 'SET_SELECTED_TOPIC'; payload: string | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AppState = {
  knowledgeList: [],
  topics: [],
  preferences: storage.getDefaultPreferences(),
  selectedTopic: null,
  searchQuery: '',
  isLoading: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_KNOWLEDGE_LIST':
      return { ...state, knowledgeList: action.payload };
    case 'ADD_KNOWLEDGE':
      return { ...state, knowledgeList: [...state.knowledgeList, action.payload] };
    case 'UPDATE_KNOWLEDGE':
      return {
        ...state,
        knowledgeList: state.knowledgeList.map(item =>
          item.id === action.payload.id ? { ...item, ...action.payload.updates } : item
        ),
      };
    case 'DELETE_KNOWLEDGE':
      return {
        ...state,
        knowledgeList: state.knowledgeList.filter(item => item.id !== action.payload),
      };
    case 'SET_TOPICS':
      return { ...state, topics: action.payload };
    case 'ADD_TOPIC':
      return { ...state, topics: [...state.topics, action.payload] };
    case 'DELETE_TOPIC':
      return {
        ...state,
        topics: state.topics.filter(topic => topic.id !== action.payload),
      };
    case 'SET_PREFERENCES':
      return { ...state, preferences: action.payload };
    case 'SET_SELECTED_TOPIC':
      return { ...state, selectedTopic: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addKnowledge: (knowledge: Knowledge) => void;
  updateKnowledge: (id: string, updates: Partial<Knowledge>) => void;
  deleteKnowledge: (id: string) => void;
  addTopic: (topic: Topic) => void;
  deleteTopic: (id: string) => void;
  searchKnowledge: (query: string) => Knowledge[];
  filterByTopic: (topicId: string | null) => Knowledge[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const loadData = () => {
      const knowledgeList = storage.getKnowledgeList();
      const topics = storage.getTopics();
      const preferences = storage.getPreferences();
      dispatch({ type: 'SET_KNOWLEDGE_LIST', payload: knowledgeList });
      dispatch({ type: 'SET_TOPICS', payload: topics });
      dispatch({ type: 'SET_PREFERENCES', payload: preferences });
      dispatch({ type: 'SET_LOADING', payload: false });
    };
    loadData();
  }, []);

  const addKnowledge = (knowledge: Knowledge) => {
    storage.saveKnowledge(knowledge);
    dispatch({ type: 'ADD_KNOWLEDGE', payload: knowledge });
  };

  const updateKnowledge = (id: string, updates: Partial<Knowledge>) => {
    storage.updateKnowledge(id, updates);
    dispatch({ type: 'UPDATE_KNOWLEDGE', payload: { id, updates } });
  };

  const deleteKnowledge = (id: string) => {
    storage.deleteKnowledge(id);
    dispatch({ type: 'DELETE_KNOWLEDGE', payload: id });
  };

  const addTopic = (topic: Topic) => {
    storage.saveTopic(topic);
    dispatch({ type: 'ADD_TOPIC', payload: topic });
  };

  const deleteTopic = (id: string) => {
    storage.deleteTopic(id);
    dispatch({ type: 'DELETE_TOPIC', payload: id });
  };

  const searchKnowledge = (query: string): Knowledge[] => {
    if (!query.trim()) return state.knowledgeList;
    const lowerQuery = query.toLowerCase();
    return state.knowledgeList.filter(
      k =>
        k.title.toLowerCase().includes(lowerQuery) ||
        k.notes.toLowerCase().includes(lowerQuery) ||
        k.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        k.topic.toLowerCase().includes(lowerQuery)
    );
  };

  const filterByTopic = (topicId: string | null): Knowledge[] => {
    if (!topicId) return state.knowledgeList;
    const topic = state.topics.find(t => t.id === topicId);
    if (!topic) return state.knowledgeList;
    return state.knowledgeList.filter(k => k.topic === topic.name);
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        addKnowledge,
        updateKnowledge,
        deleteKnowledge,
        addTopic,
        deleteTopic,
        searchKnowledge,
        filterByTopic,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
