import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, X, Tag, Download, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import { Input, Textarea } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import { Knowledge } from '../../types';
import { fetchWebContent } from '../../services/scraper';
import styles from './AddKnowledge.module.css';

export function AddKnowledge() {
  const navigate = useNavigate();
  const { addKnowledge, addTopic, state } = useApp();
  const { showToast, t } = useI18n();

  const [formData, setFormData] = useState({
    url: '',
    title: '',
    topic: '',
    goals: '',
    notes: '',
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [showNewTopicInput, setShowNewTopicInput] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '__new__') {
      setShowNewTopicInput(true);
      setFormData(prev => ({ ...prev, topic: '' }));
    } else {
      setShowNewTopicInput(false);
      setNewTopicName('');
      setFormData(prev => ({ ...prev, topic: value }));
    }
  };

  const handleNewTopicBlur = () => {
    if (newTopicName.trim()) {
      const newTopic = {
        id: Date.now().toString(),
        name: newTopicName.trim(),
        color: '#E17055',
        createdAt: new Date().toISOString(),
      };
      addTopic(newTopic);
      setFormData(prev => ({ ...prev, topic: newTopicName.trim() }));
      setShowNewTopicInput(false);
      showToast(t('topics.createNew') + ' ' + t('common.success'), 'success');
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags(prev => [...prev, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleFetchContent = async () => {
    if (!formData.url.trim()) {
      showToast(t('add.url') + ' ' + t('common.error'), 'error');
      return;
    }

    if (!isValidUrl(formData.url)) {
      showToast(t('add.urlPlaceholder') + ' ' + t('common.error'), 'error');
      return;
    }

    setIsFetching(true);

    try {
      const result = await fetchWebContent(formData.url);

      if (result.success) {
        if (result.title && !formData.title.trim()) {
          setFormData(prev => ({ ...prev, title: result.title }));
        }
        if (result.content) {
          setFormData(prev => ({
            ...prev,
            notes: prev.notes
              ? `${prev.notes}\n\n---\n\n## 文章内容摘要\n\n${result.content}`
              : `## 文章内容摘要\n\n${result.content}`
          }));
        }
        showToast(t('add.autoFetch') + ' ' + t('common.success'), 'success');
      } else {
        showToast(result.error || t('common.error'), 'error');
      }
    } catch (error) {
      showToast(t('common.error'), 'error');
    } finally {
      setIsFetching(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.url.trim()) {
      newErrors.url = t('add.url') + ' ' + t('common.error');
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = t('add.urlPlaceholder') + ' ' + t('common.error');
    }

    if (!formData.title.trim()) {
      newErrors.title = t('add.titleLabel') + ' ' + t('common.error');
    }

    if (!formData.topic.trim()) {
      newErrors.topic = t('add.topic') + ' ' + t('common.error');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newKnowledge: Knowledge = {
        id: Date.now().toString(),
        url: formData.url.trim(),
        title: formData.title.trim(),
        topic: formData.topic.trim(),
        goals: formData.goals.trim(),
        tags,
        notes: formData.notes.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reviewCount: 0,
        mastered: false,
        bookmarked: false,
      };

      addKnowledge(newKnowledge);
      showToast(t('knowledge.addSuccess'), 'success');
      navigate('/');
    } catch (error) {
      showToast(t('common.error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={20} />
          <span>{t('common.back')}</span>
        </Link>
        <h1 className={styles.title}>{t('add.title')}</h1>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('add.titleLabel')}</h2>

          <div className={styles.urlField}>
            <div className={styles.field} style={{ flex: 1 }}>
              <Input
                label={t('add.url')}
                name="url"
                placeholder={t('add.urlPlaceholder')}
                value={formData.url}
                onChange={handleChange}
                error={errors.url}
              />
            </div>
            <button
              type="button"
              className={styles.fetchButton}
              onClick={handleFetchContent}
              disabled={isFetching || !formData.url.trim()}
            >
              {isFetching ? (
                <>
                  <Loader2 size={18} className={styles.spinning} />
                  {t('add.fetching')}
                </>
              ) : (
                <>
                  <Download size={18} />
                  {t('add.autoFetch')}
                </>
              )}
            </button>
          </div>

          <p className={styles.hint}>{t('add.fetchHint')}</p>

          <div className={styles.field}>
            <Input
              label={t('add.titleLabel') + ' *'}
              name="title"
              placeholder={t('add.titlePlaceholder')}
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t('add.topic')} *</label>
            <select
              name="topic"
              value={showNewTopicInput ? '__new__' : formData.topic}
              onChange={handleTopicChange}
              className={`${styles.select} ${errors.topic ? styles.hasError : ''}`}
            >
              <option value="">{t('add.selectTopic')}</option>
              {state.topics.map(topic => (
                <option key={topic.id} value={topic.name}>
                  {topic.name}
                </option>
              ))}
              <option value="__new__">{t('add.createTopic')}</option>
            </select>
            {errors.topic && <span className={styles.error}>{errors.topic}</span>}
          </div>

          {showNewTopicInput && (
            <div className={styles.newTopicInput}>
              <Input
                placeholder={t('add.newTopicPlaceholder')}
                value={newTopicName}
                onChange={e => setNewTopicName(e.target.value)}
                onBlur={handleNewTopicBlur}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleNewTopicBlur();
                  }
                }}
              />
            </div>
          )}

          <div className={styles.field}>
            <Textarea
              label={t('add.goals')}
              name="goals"
              placeholder={t('add.goalsPlaceholder')}
              value={formData.goals}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('add.tags')}</h2>

          <div className={styles.field}>
            <label className={styles.label}>{t('add.tags')}</label>
            <div className={styles.tagInput}>
              <Tag size={18} className={styles.tagIcon} />
              <input
                type="text"
                placeholder={t('add.tagsPlaceholder')}
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                className={styles.tagInputField}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className={styles.addTagButton}
              >
                <Plus size={18} />
              </button>
            </div>
            {tags.length > 0 && (
              <div className={styles.tags}>
                {tags.map(tag => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className={styles.removeTag}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('add.notes')}</h2>

          <div className={styles.field}>
            <Textarea
              name="notes"
              placeholder={t('add.notesPlaceholder')}
              value={formData.notes}
              onChange={handleChange}
              className={styles.notesTextarea}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/')}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
          >
            {t('add.saveKnowledge')}
          </Button>
        </div>
      </form>
    </div>
  );
}
