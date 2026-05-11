import React, { createContext, useContext, useState } from 'react';

export type Language = 'zh' | 'en';

interface Translations {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    confirm: string;
    success: string;
    error: string;
    loading: string;
    search: string;
    add: string;
    back: string;
  };
  nav: {
    home: string;
    addKnowledge: string;
    review: string;
    settings: string;
  };
  home: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    emptyTitle: string;
    emptyDescription: string;
    addFirst: string;
    noResults: string;
    browsingTopic: string;
  };
  add: {
    title: string;
    url: string;
    urlPlaceholder: string;
    titleLabel: string;
    titlePlaceholder: string;
    topic: string;
    selectTopic: string;
    createTopic: string;
    newTopicPlaceholder: string;
    goals: string;
    goalsPlaceholder: string;
    tags: string;
    tagsPlaceholder: string;
    notes: string;
    notesPlaceholder: string;
    autoFetch: string;
    fetching: string;
    fetchHint: string;
    saveKnowledge: string;
  };
  review: {
    title: string;
    aiMode: string;
    basicMode: string;
    upgrade: string;
    placeholder: string;
    placeholderBasic: string;
    welcome: string;
    welcomeDescription: string;
    emptyTitle: string;
    emptyDescription: string;
    goToAdd: string;
    latestAdded: string;
    allTopics: string;
    weakPoints: string;
    basicBanner: string;
    enterHint: string;
  };
  settings: {
    title: string;
    aiConfig: string;
    aiConfigDescription: string;
    provider: string;
    apiKey: string;
    apiKeyHint: string;
    apiUrl: string;
    apiUrlHint: string;
    model: string;
    modelHint: string;
    temperature: string;
    temperatureHint: string;
    maxTokens: string;
    maxTokensHint: string;
    enableAI: string;
    enableAIHint: string;
    testConnection: string;
    testing: string;
    saveSettings: string;
    dataManagement: string;
    exportData: string;
    importData: string;
    clearData: string;
    providers: {
      openai: string;
      openaiDesc: string;
      claude: string;
      claudeDesc: string;
      custom: string;
      customDesc: string;
    };
  };
  knowledge: {
    mastered: string;
    reviews: string;
    openLink: string;
    editKnowledge: string;
    deleteKnowledge: string;
    confirmDelete: string;
    deleteWarning: string;
    updateSuccess: string;
    addSuccess: string;
    deleteSuccess: string;
  };
  topics: {
    title: string;
    createNew: string;
  };
  language: {
    title: string;
    switch: string;
  };
}

const translations: Record<Language, Translations> = {
  zh: {
    common: {
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      confirm: '确认',
      success: '成功',
      error: '错误',
      loading: '加载中...',
      search: '搜索',
      add: '添加',
      back: '返回',
    },
    nav: {
      home: '知识库',
      addKnowledge: '添加知识',
      review: '复习助手',
      settings: '设置',
    },
    home: {
      title: '知识库',
      subtitle: '共 {count} 条知识',
      browsingTopic: '正在浏览「{topic}」主题',
      searchPlaceholder: '搜索知识...',
      emptyTitle: '还没有添加知识',
      emptyDescription: '开始添加你的第一篇学习资料吧！我会帮你记住，并在你需要复习时提供帮助',
      addFirst: '添加第一条知识',
      noResults: '没有找到与「{query}」相关的知识',
    },
    add: {
      title: '添加新知识',
      url: '链接地址',
      urlPlaceholder: 'https://example.com/article',
      titleLabel: '标题',
      titlePlaceholder: '这篇文章讲了什么？',
      topic: '主题',
      selectTopic: '选择主题',
      createTopic: '+ 创建新主题',
      newTopicPlaceholder: '输入新主题名称，按回车创建',
      goals: '学习目标',
      goalsPlaceholder: '我想从这篇文章中学到什么？',
      tags: '标签',
      tagsPlaceholder: '输入标签后按 Enter 添加',
      notes: '个人笔记',
      notesPlaceholder: '在这里记录你的理解、感悟或重要内容...',
      autoFetch: '自动抓取',
      fetching: '抓取中...',
      fetchHint: '💡 输入链接后点击「自动抓取」，AI 会帮你读取网页内容并填充',
      saveKnowledge: '保存知识',
    },
    review: {
      title: '复习助手',
      aiMode: 'AI 模式已启用',
      basicMode: '基础模式',
      upgrade: '升级 AI',
      placeholder: '问我想复习什么...',
      placeholderBasic: '输入关键词搜索...',
      welcome: '准备好复习了吗？',
      welcomeDescription: '告诉我你想复习什么，我会从你的知识库中找出相关内容',
      emptyTitle: '知识库是空的',
      emptyDescription: '先添加一些知识吧，这样我才能帮你复习',
      goToAdd: '去添加知识',
      latestAdded: '最新添加的',
      allTopics: '复习所有主题',
      weakPoints: '薄弱知识点',
      basicBanner: '当前使用基础模式，仅支持关键词匹配。',
      enterHint: '按 Enter 发送',
    },
    settings: {
      title: '设置',
      aiConfig: 'AI 配置',
      aiConfigDescription: '配置 AI 模型以启用真正的智能复习助手。配置完成后，复习模式将使用 AI 来帮助你复习知识。',
      provider: 'AI 提供商',
      apiKey: 'API Key',
      apiKeyHint: '从 OpenAI 平台获取 API Key',
      apiUrl: 'API 地址',
      apiUrlHint: '自定义 API 服务器的地址（需要兼容 OpenAI 格式）',
      model: '模型',
      modelHint: '推荐使用 gpt-4 或 gpt-3.5-turbo',
      temperature: '温度',
      temperatureHint: '较低的值更确定性，较高的值更有创造性',
      maxTokens: '最大Token数',
      maxTokensHint: '单次回复的最大长度',
      enableAI: '启用 AI 复习助手',
      enableAIHint: '关闭后，复习模式将使用关键词匹配（无需 API Key）',
      testConnection: '测试连接',
      testing: '测试中...',
      saveSettings: '保存设置',
      dataManagement: '数据管理',
      exportData: '导出数据',
      importData: '导入数据',
      clearData: '清除所有数据',
      providers: {
        openai: 'OpenAI',
        openaiDesc: 'GPT-4、GPT-3.5 等模型',
        claude: 'Claude (Anthropic)',
        claudeDesc: 'Claude 3 系列模型',
        custom: '自定义 API',
        customDesc: '兼容 OpenAI 格式的自定义服务器',
      },
    },
    knowledge: {
      mastered: '已掌握',
      reviews: '复习 {count} 次',
      openLink: '打开链接',
      editKnowledge: '编辑',
      deleteKnowledge: '删除',
      confirmDelete: '确认删除',
      deleteWarning: '确定要删除这条知识吗？此操作不可撤销。',
      updateSuccess: '知识已更新',
      addSuccess: '知识添加成功！',
      deleteSuccess: '知识已删除',
    },
    topics: {
      title: '学习主题',
      createNew: '创建新主题',
    },
    language: {
      title: '语言',
      switch: '切换语言',
    },
  },
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      confirm: 'Confirm',
      success: 'Success',
      error: 'Error',
      loading: 'Loading...',
      search: 'Search',
      add: 'Add',
      back: 'Back',
    },
    nav: {
      home: 'Knowledge Base',
      addKnowledge: 'Add Knowledge',
      review: 'Review',
      settings: 'Settings',
    },
    home: {
      title: 'Knowledge Base',
      subtitle: '{count} items',
      browsingTopic: 'Browsing "{topic}"',
      searchPlaceholder: 'Search knowledge...',
      emptyTitle: 'No knowledge yet',
      emptyDescription: 'Start adding your first learning material! I will help you remember and review when needed.',
      addFirst: 'Add First Knowledge',
      noResults: 'No results for "{query}"',
    },
    add: {
      title: 'Add New Knowledge',
      url: 'URL',
      urlPlaceholder: 'https://example.com/article',
      titleLabel: 'Title',
      titlePlaceholder: 'What is this article about?',
      topic: 'Topic',
      selectTopic: 'Select topic',
      createTopic: '+ Create New Topic',
      newTopicPlaceholder: 'Enter topic name, press Enter to create',
      goals: 'Learning Goals',
      goalsPlaceholder: 'What do I want to learn from this article?',
      tags: 'Tags',
      tagsPlaceholder: 'Enter tags, press Enter to add',
      notes: 'Notes',
      notesPlaceholder: 'Record your understanding, insights, or important content here...',
      autoFetch: 'Auto Fetch',
      fetching: 'Fetching...',
      fetchHint: '💡 Enter a URL and click "Auto Fetch" to read and fill in the content',
      saveKnowledge: 'Save Knowledge',
    },
    review: {
      title: 'Review Assistant',
      aiMode: 'AI Mode Enabled',
      basicMode: 'Basic Mode',
      upgrade: 'Upgrade to AI',
      placeholder: 'Ask me anything to review...',
      placeholderBasic: 'Search by keywords...',
      welcome: 'Ready to review?',
      welcomeDescription: 'Tell me what you want to review, I will find relevant content from your knowledge base',
      emptyTitle: 'Knowledge base is empty',
      emptyDescription: 'Add some knowledge first so I can help you review',
      goToAdd: 'Add Knowledge',
      latestAdded: 'Latest Added',
      allTopics: 'All Topics',
      weakPoints: 'Weak Points',
      basicBanner: 'Currently using basic mode, only supports keyword matching.',
      enterHint: 'Press Enter to send',
    },
    settings: {
      title: 'Settings',
      aiConfig: 'AI Configuration',
      aiConfigDescription: 'Configure AI model to enable intelligent review assistant. Once configured, the review mode will use AI to help you review knowledge.',
      provider: 'AI Provider',
      apiKey: 'API Key',
      apiKeyHint: 'Get API Key from OpenAI platform',
      apiUrl: 'API URL',
      apiUrlHint: 'Custom API server URL (needs OpenAI compatible format)',
      model: 'Model',
      modelHint: 'Recommended: gpt-4 or gpt-3.5-turbo',
      temperature: 'Temperature',
      temperatureHint: 'Lower values are more deterministic, higher values are more creative',
      maxTokens: 'Max Tokens',
      maxTokensHint: 'Maximum length of single response',
      enableAI: 'Enable AI Review Assistant',
      enableAIHint: 'When disabled, review mode uses keyword matching (no API Key required)',
      testConnection: 'Test Connection',
      testing: 'Testing...',
      saveSettings: 'Save Settings',
      dataManagement: 'Data Management',
      exportData: 'Export Data',
      importData: 'Import Data',
      clearData: 'Clear All Data',
      providers: {
        openai: 'OpenAI',
        openaiDesc: 'GPT-4, GPT-3.5 models',
        claude: 'Claude (Anthropic)',
        claudeDesc: 'Claude 3 series models',
        custom: 'Custom API',
        customDesc: 'Custom server compatible with OpenAI format',
      },
    },
    knowledge: {
      mastered: 'Mastered',
      reviews: '{count} reviews',
      openLink: 'Open Link',
      editKnowledge: 'Edit',
      deleteKnowledge: 'Delete',
      confirmDelete: 'Confirm Delete',
      deleteWarning: 'Are you sure you want to delete this knowledge? This cannot be undone.',
      updateSuccess: 'Knowledge updated',
      addSuccess: 'Knowledge added successfully!',
      deleteSuccess: 'Knowledge deleted',
    },
    topics: {
      title: 'Topics',
      createNew: 'Create New Topic',
    },
    language: {
      title: 'Language',
      switch: 'Switch Language',
    },
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language');
      return (saved as Language) || 'zh';
    }
    return 'zh';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    if (params) {
      return value.replace(/\{(\w+)\}/g, (_, name) => {
        return params[name]?.toString() ?? `{${name}}`;
      });
    }

    return value;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within a I18nProvider');
  }
  return context;
}

export { translations };
