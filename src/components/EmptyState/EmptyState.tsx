import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen } from 'lucide-react';
import { Button } from '../common/Button';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionPath?: string;
  onAction?: () => void;
  type?: 'knowledge' | 'review' | 'search';
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionPath,
  onAction,
  type = 'knowledge',
}: EmptyStateProps) {
  const renderIcon = () => {
    switch (type) {
      case 'review':
        return (
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="50" fill="#FAF9F7" stroke="#E8E5E1" strokeWidth="2"/>
            <path d="M45 50 L55 60 L45 70" stroke="#E17055" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M55 50 L65 60 L55 70" stroke="#E17055" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M65 50 L75 60 L65 70" stroke="#E17055" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="60" cy="85" r="3" fill="#636E72"/>
          </svg>
        );
      case 'search':
        return (
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="50" fill="#FAF9F7" stroke="#E8E5E1" strokeWidth="2"/>
            <circle cx="50" cy="50" r="20" stroke="#636E72" strokeWidth="3" fill="none"/>
            <line x1="65" y1="65" x2="80" y2="80" stroke="#636E72" strokeWidth="3" strokeLinecap="round"/>
            <path d="M40 50 L50 50" stroke="#E17055" strokeWidth="2" strokeLinecap="round"/>
            <path d="M50 40 L50 50" stroke="#E17055" strokeWidth="2" strokeLinecap="round"/>
            <path d="M60 50 L50 50" stroke="#E17055" strokeWidth="2" strokeLinecap="round"/>
            <path d="M50 60 L50 50" stroke="#E17055" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      default:
        return (
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="50" fill="#FAF9F7" stroke="#E8E5E1" strokeWidth="2"/>
            <rect x="40" y="35" width="40" height="50" rx="4" fill="#FFFFFF" stroke="#E17055" strokeWidth="2"/>
            <line x1="48" y1="50" x2="72" y2="50" stroke="#E8E5E1" strokeWidth="2"/>
            <line x1="48" y1="58" x2="72" y2="58" stroke="#E8E5E1" strokeWidth="2"/>
            <line x1="48" y1="66" x2="65" y2="66" stroke="#E8E5E1" strokeWidth="2"/>
            <circle cx="85" cy="75" r="15" fill="#E17055"/>
            <path d="M85 68 L85 82" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M78 75 L92 75" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.icon}>{renderIcon()}</div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      {(actionLabel && (actionPath || onAction)) && (
        actionPath ? (
          <Link to={actionPath}>
            <Button variant="primary" icon={<Plus size={18} />}>
              {actionLabel}
            </Button>
          </Link>
        ) : (
          <Button variant="primary" icon={<Plus size={18} />} onClick={onAction}>
            {actionLabel}
          </Button>
        )
      )}
    </div>
  );
}
