import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import { Input, Textarea } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { KnowledgeCard } from '../../components/KnowledgeCard';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';
import { Knowledge } from '../../types';
import styles from './Home.module.css';

export function Home() {
  const { state, deleteKnowledge, updateKnowledge, dispatch } = useApp();
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredKnowledge, setFilteredKnowledge] = useState(state.knowledgeList);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<Knowledge | null>(null);
  const { showToast } = useToast();

  const topicParam = searchParams.get('topic');

  useEffect(() => {
    if (topicParam) {
      const topic = state.topics.find(t => t.id === topicParam);
      if (topic) {
        dispatch({ type: 'SET_SELECTED_TOPIC', payload: topicParam });
      }
    } else {
      dispatch({ type: 'SET_SELECTED_TOPIC', payload: null });
    }
  }, [topicParam, state.topics, dispatch]);

  useEffect(() => {
    let result = state.knowledgeList;

    if (topicParam) {
      const topic = state.topics.find(t => t.id === topicParam);
      if (topic) {
        result = result.filter(k => k.topic === topic.name);
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        k =>
          k.title.toLowerCase().includes(query) ||
          k.notes.toLowerCase().includes(query) ||
          k.tags.some(tag => tag.toLowerCase().includes(query)) ||
          k.topic.toLowerCase().includes(query)
      );
    }

    setFilteredKnowledge(result);
  }, [state.knowledgeList, topicParam, searchQuery, state.topics]);

  const handleEdit = (id: string) => {
    const knowledge = state.knowledgeList.find(k => k.id === id);
    if (knowledge) {
      setEditingKnowledge({ ...knowledge });
      setEditModalOpen(true);
    }
  };

  const handleEditChange = (field: keyof Knowledge, value: any) => {
    if (editingKnowledge) {
      setEditingKnowledge({ ...editingKnowledge, [field]: value });
    }
  };

  const handleSaveEdit = () => {
    if (editingKnowledge) {
      updateKnowledge(editingKnowledge.id, editingKnowledge);
      showToast(t('knowledge.updateSuccess'), 'success');
      setEditModalOpen(false);
      setEditingKnowledge(null);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteKnowledge(deleteId);
      showToast(t('knowledge.deleteSuccess'), 'success');
      setDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const currentTopic = topicParam ? state.topics.find(t => t.id === topicParam) : null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{t('home.title')}</h1>
          <p className={styles.subtitle}>
            {currentTopic
              ? t('home.browsingTopic', { topic: currentTopic.name })
              : t('home.subtitle', { count: state.knowledgeList.length })}
          </p>
        </div>

        <div className={styles.actions}>
          <div className={styles.searchBox}>
            <Input
              placeholder={t('home.searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Link to="/add">
            <Button variant="primary" icon={<span>+</span>}>
              {t('common.add')}
            </Button>
          </Link>
        </div>
      </div>

      {filteredKnowledge.length === 0 ? (
        searchQuery ? (
          <EmptyState
            title={t('home.noResults', { query: searchQuery })}
            description=""
            type="search"
          />
        ) : (
          <EmptyState
            title={t('home.emptyTitle')}
            description={t('home.emptyDescription')}
            actionLabel={t('home.addFirst')}
            actionPath="/add"
            type="knowledge"
          />
        )
      ) : (
        <div className={styles.grid}>
          {filteredKnowledge.map((knowledge, index) => (
            <div
              key={knowledge.id}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <KnowledgeCard
                knowledge={knowledge}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={t('knowledge.editKnowledge')}
        size="lg"
      >
        {editingKnowledge && (
          <div className={styles.editForm}>
            <div className={styles.formField}>
              <Input
                label={t('add.titleLabel')}
                value={editingKnowledge.title}
                onChange={e => handleEditChange('title', e.target.value)}
              />
            </div>

            <div className={styles.formField}>
              <Input
                label={t('add.url')}
                value={editingKnowledge.url}
                onChange={e => handleEditChange('url', e.target.value)}
              />
            </div>

            <div className={styles.formField}>
              <Input
                label={t('add.topic')}
                value={editingKnowledge.topic}
                onChange={e => handleEditChange('topic', e.target.value)}
              />
            </div>

            <div className={styles.formField}>
              <Textarea
                label={t('add.goals')}
                value={editingKnowledge.goals}
                onChange={e => handleEditChange('goals', e.target.value)}
              />
            </div>

            <div className={styles.formField}>
              <Textarea
                label={t('add.notes')}
                value={editingKnowledge.notes}
                onChange={e => handleEditChange('notes', e.target.value)}
              />
            </div>

            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" onClick={handleSaveEdit}>
                {t('common.save')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={t('knowledge.confirmDelete')}
        size="sm"
      >
        <div className={styles.modalContent}>
          <p>{t('knowledge.deleteWarning')}</p>
          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
