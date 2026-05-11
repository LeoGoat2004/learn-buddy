import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Brain, Globe } from 'lucide-react';
import { Button } from '../common/Button';
import { useI18n } from '../../i18n';
import styles from './Header.module.css';

export function Header() {
  const { language, setLanguage, t } = useI18n();

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <BookOpen size={28} />
          <h1 className={styles.title}>LearnBuddy</h1>
        </Link>

        <nav className={styles.nav}>
          <button 
            className={styles.langButton} 
            onClick={toggleLanguage} 
            title={t('language.switch')}
          >
            <Globe size={18} />
            <span>{language === 'zh' ? 'EN' : '中'}</span>
          </button>
          <Link to="/add">
            <Button variant="primary" icon={<Plus size={18} />}>
              {t('nav.addKnowledge')}
            </Button>
          </Link>
          <Link to="/review">
            <Button variant="secondary" icon={<Brain size={18} />}>
              {t('nav.review')}
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
