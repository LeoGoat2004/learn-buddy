import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FolderOpen, Plus, Settings, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const { state, addTopic, deleteTopic } = useApp();
  const { t } = useI18n();
  const location = useLocation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  const handleAddTopic = () => {
    if (!newTopicName.trim()) return;
    const topic = {
      id: Date.now().toString(),
      name: newTopicName.trim(),
      color: generateRandomColor(),
      createdAt: new Date().toISOString(),
    };
    addTopic(topic);
    setNewTopicName('');
    setIsAddModalOpen(false);
  };

  const generateRandomColor = () => {
    const colors = ['#E17055', '#00B894', '#0984E3', '#6C5CE7', '#FDCB6E', '#E84393'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getTopicCount = (topicName: string) => {
    return state.knowledgeList.filter(k => k.topic === topicName).length;
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <FolderOpen size={18} />
          <span>{t('topics.title')}</span>
          <button className={styles.addButton} onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} />
          </button>
        </div>

        <nav className={styles.nav}>
          <Link
            to="/"
            className={`${styles.navItem} ${location.pathname === '/' && !state.selectedTopic ? styles.active : ''}`}
          >
            <span className={styles.dot} style={{ backgroundColor: '#636E72' }} />
            <span>{t('common.search')} {t('home.title')}</span>
            <span className={styles.count}>{state.knowledgeList.length}</span>
          </Link>

          {state.topics.map(topic => (
            <Link
              key={topic.id}
              to={`/?topic=${topic.id}`}
              className={`${styles.navItem} ${state.selectedTopic === topic.id ? styles.active : ''}`}
            >
              <span className={styles.dot} style={{ backgroundColor: topic.color }} />
              <span>{topic.name}</span>
              <span className={styles.count}>{getTopicCount(topic.name)}</span>
              <button
                className={styles.deleteButton}
                onClick={e => {
                  e.preventDefault();
                  deleteTopic(topic.id);
                }}
              >
                ×
              </button>
            </Link>
          ))}
        </nav>
      </div>

      <div className={styles.footer}>
        <Link to="/settings" className={styles.footerLink}>
          <Settings size={18} />
          <span>{t('nav.settings')}</span>
        </Link>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('topics.createNew')}
        size="sm"
      >
        <div className={styles.modalContent}>
          <Input
            label={t('add.topic')}
            placeholder={t('add.newTopicPlaceholder')}
            value={newTopicName}
            onChange={e => setNewTopicName(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleAddTopic()}
          />
          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleAddTopic}>
              {t('common.add')}
            </Button>
          </div>
        </div>
      </Modal>
    </aside>
  );
}
