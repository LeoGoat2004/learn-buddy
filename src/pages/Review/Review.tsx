import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Lightbulb, RefreshCw, Settings, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/EmptyState';
import { useToast } from '../../components/common/Toast';
import { Message } from '../../types';
import { aiService } from '../../services/aiService';
import { storage } from '../../services/storage';
import styles from './Review.module.css';

export function Review() {
  const { state } = useApp();
  const { showToast, t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiEnabled, setAIEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const config = storage.getAIConfig();
    setAIEnabled(config?.enabled && aiService.isConfigured());
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let response: string;

      if (aiEnabled && aiService.isConfigured()) {
        const chatMessages = [...messages, userMessage].map(m => ({
          role: m.role,
          content: m.content,
        }));

        response = await aiService.chat(chatMessages, state.knowledgeList);
      } else {
        await new Promise(resolve => setTimeout(resolve, 800));
        response = generateFallbackResponse(userMessage.content);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      showToast(error instanceof Error ? error.message : '发送失败', 'error');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackResponse = (query: string): string => {
    const relatedKnowledge = state.knowledgeList.filter(k => {
      const searchText = `${k.title} ${k.goals} ${k.notes} ${k.tags.join(' ')} ${k.topic}`.toLowerCase();
      return query.toLowerCase().split(/\s+/).some(word => searchText.includes(word));
    });

    if (relatedKnowledge.length === 0) {
      return `### ${t('review.emptyTitle')}

${t('review.emptyDescription')}

💡 ${t('review.basicBanner')}`;
    }

    let response = `### 📚 ${t('home.noResults', { query: `${relatedKnowledge.length}` })}\n\n`;

    relatedKnowledge.slice(0, 3).forEach((k, i) => {
      response += `### ${i + 1}. ${k.title}\n`;
      response += `- **${t('add.topic')}**: ${k.topic}\n`;
      if (k.goals) response += `- **${t('add.goals')}**: ${k.goals}\n`;
      if (k.tags.length > 0) response += `- **${t('add.tags')}**: ${k.tags.join('、')}\n`;
      response += '\n';
    });

    return response;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    { label: t('review.latestAdded'), query: state.knowledgeList[state.knowledgeList.length - 1]?.title || '' },
    { label: t('review.allTopics'), query: state.knowledgeList[state.knowledgeList.length - 1]?.topic ? 'topics' : '' },
    { label: t('review.weakPoints'), query: 'weakest' },
  ].filter(q => q.query);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/" className={styles.backLink}>
          <span>{t('common.back')}</span>
        </Link>
        <h1 className={styles.title}>{t('review.title')}</h1>
        <p className={styles.subtitle}>
          {aiEnabled ? `🤖 ${t('review.aiMode')}` : `📝 ${t('review.basicMode')}`}
          {!aiEnabled && (
            <Link to="/settings" className={styles.upgradeLink}>
              <Settings size={14} />
              {t('review.upgrade')}
            </Link>
          )}
        </p>
      </div>

      {state.knowledgeList.length === 0 ? (
        <EmptyState
          title={t('review.emptyTitle')}
          description={t('review.emptyDescription')}
          actionLabel={t('review.goToAdd')}
          actionPath="/add"
          type="review"
        />
      ) : (
        <div className={styles.container}>
          {!aiEnabled && (
            <div className={styles.banner}>
              <AlertCircle size={18} />
              <span>{t('review.basicBanner')}</span>
              <Link to="/settings">{t('review.upgrade')} →</Link>
            </div>
          )}

          <div className={styles.chatArea}>
            {messages.length === 0 && (
              <div className={styles.welcome}>
                <div className={styles.welcomeIcon}>
                  <Lightbulb size={48} />
                </div>
                <h2>{t('review.welcome')}</h2>
                <p>{t('review.welcomeDescription')}</p>
                <div className={styles.suggestions}>
                  {suggestedQuestions.map(q => (
                    <button
                      key={q.query}
                      className={styles.suggestion}
                      onClick={() => setInput(q.query)}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.messages}>
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`${styles.message} ${styles[message.role]}`}
                >
                  <div className={styles.messageAvatar}>
                    {message.role === 'assistant' ? '🤖' : '👤'}
                  </div>
                  <div className={styles.messageContent}>
                    {message.role === 'assistant' ? (
                      <div className={styles.markdown}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className={styles.messageText}>
                        {message.content}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className={styles.inputArea}>
            <div className={styles.inputContainer}>
              <input
                type="text"
                placeholder={aiEnabled ? t('review.placeholder') : t('review.placeholderBasic')}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className={styles.input}
                disabled={isLoading}
              />
              <button
                className={styles.sendButton}
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? <RefreshCw size={20} className={styles.spinning} /> : <Send size={20} />}
              </button>
            </div>
            <div className={styles.hints}>
              <span>{t('review.enterHint')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
