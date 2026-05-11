import React from 'react';
import { useApp } from '../../context/AppContext';
import styles from './TopicTag.module.css';

interface TopicTagProps {
  topic: string;
  size?: 'sm' | 'md';
  clickable?: boolean;
}

export function TopicTag({ topic, size = 'md', clickable = false }: TopicTagProps) {
  const { state } = useApp();
  const topicData = state.topics.find(t => t.name === topic);
  const color = topicData?.color || '#636E72';

  return (
    <span
      className={`${styles.tag} ${styles[size]} ${clickable ? styles.clickable : ''}`}
      style={{ backgroundColor: `${color}15`, color: color, borderColor: `${color}40` }}
    >
      <span className={styles.dot} style={{ backgroundColor: color }} />
      {topic}
    </span>
  );
}
