import React from 'react';
import { ExternalLink, Edit, Trash2, BookOpen, Clock } from 'lucide-react';
import { Knowledge } from '../../types';
import { TopicTag } from '../TopicTag';
import styles from './KnowledgeCard.module.css';

interface KnowledgeCardProps {
  knowledge: Knowledge;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function KnowledgeCard({ knowledge, onEdit, onDelete }: KnowledgeCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{knowledge.title}</h3>
        <div className={styles.actions}>
          <button
            className={styles.actionButton}
            onClick={() => window.open(knowledge.url, '_blank')}
            title="打开链接"
          >
            <ExternalLink size={16} />
          </button>
          <button
            className={styles.actionButton}
            onClick={() => onEdit(knowledge.id)}
            title="编辑"
          >
            <Edit size={16} />
          </button>
          <button
            className={`${styles.actionButton} ${styles.danger}`}
            onClick={() => onDelete(knowledge.id)}
            title="删除"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className={styles.meta}>
        <TopicTag topic={knowledge.topic} />
        {knowledge.mastered && (
          <span className={styles.mastered}>已掌握</span>
        )}
      </div>

      {knowledge.goals && (
        <p className={styles.goals}>{knowledge.goals}</p>
      )}

      {knowledge.tags.length > 0 && (
        <div className={styles.tags}>
          {knowledge.tags.map((tag, index) => (
            <span key={index} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {knowledge.notes && (
        <p className={styles.notes}>{knowledge.notes}</p>
      )}

      <div className={styles.footer}>
        <div className={styles.stats}>
          <span className={styles.stat}>
            <Clock size={14} />
            {formatDate(knowledge.createdAt)}
          </span>
          {knowledge.reviewCount > 0 && (
            <span className={styles.stat}>
              <BookOpen size={14} />
              复习 {knowledge.reviewCount} 次
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
