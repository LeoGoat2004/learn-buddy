import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon, Key, Globe, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import { useI18n } from '../../i18n';
import { storage } from '../../services/storage';
import { aiService } from '../../services/aiService';
import { AIConfig, AI_PROVIDERS, AIProvider } from '../../types';
import styles from './Settings.module.css';

export function Settings() {
  const { showToast, t } = useI18n();
  const [aiConfig, setAIConfig] = useState<AIConfig>({
    provider: 'openai',
    apiKey: '',
    baseUrl: '',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    enabled: false,
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const savedConfig = storage.getAIConfig();
    if (savedConfig) {
      setAIConfig(savedConfig);
      if (savedConfig.enabled) {
        aiService.setConfig(savedConfig);
      }
    }
  }, []);

  const handleProviderChange = (provider: AIProvider) => {
    const providerConfig = AI_PROVIDERS.find(p => p.id === provider);
    setAIConfig(prev => ({
      ...prev,
      provider,
      baseUrl: providerConfig?.baseUrl || '',
      model: providerConfig?.defaultModel || 'gpt-4',
    }));
    setTestResult(null);
  };

  const handleSave = () => {
    if (!aiConfig.apiKey.trim()) {
      showToast(t('settings.apiKey') + ' required', 'error');
      return;
    }

    storage.saveAIConfig(aiConfig);
    aiService.setConfig(aiConfig);
    showToast(t('common.success'), 'success');
  };

  const handleTest = async () => {
    if (!aiConfig.apiKey.trim()) {
      showToast(t('settings.apiKey') + ' required', 'error');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await aiService.testConnection(aiConfig);
      setTestResult(result);
      if (result.success) {
        showToast(result.message, 'success');
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Test failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={20} />
          <span>{t('common.back')}</span>
        </Link>
        <h1 className={styles.title}>{t('settings.title')}</h1>
      </div>

      <div className={styles.sections}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <SettingsIcon size={20} />
            <h2>{t('settings.aiConfig')}</h2>
          </div>
          <p className={styles.description}>{t('settings.aiConfigDescription')}</p>

          <div className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>{t('settings.provider')}</label>
              <div className={styles.providers}>
                {AI_PROVIDERS.map(provider => (
                  <button
                    key={provider.id}
                    type="button"
                    className={`${styles.providerButton} ${aiConfig.provider === provider.id ? styles.active : ''}`}
                    onClick={() => handleProviderChange(provider.id)}
                  >
                    <span className={styles.providerName}>{t(provider.nameKey)}</span>
                    <span className={styles.providerDesc}>{t(provider.descriptionKey)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <Input
                label={t('settings.apiKey')}
                type="password"
                placeholder="sk-..."
                value={aiConfig.apiKey}
                onChange={e => {
                  setAIConfig(prev => ({ ...prev, apiKey: e.target.value }));
                  setTestResult(null);
                }}
                icon={<Key size={18} />}
              />
              <p className={styles.hint}>{t('settings.apiKeyHint')}</p>
            </div>

            {aiConfig.provider === 'custom' && (
              <div className={styles.field}>
                <Input
                  label={t('settings.apiUrl')}
                  type="url"
                  placeholder="https://api.example.com/v1"
                  value={aiConfig.baseUrl}
                  onChange={e => setAIConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                  icon={<Globe size={18} />}
                />
                <p className={styles.hint}>{t('settings.apiUrlHint')}</p>
              </div>
            )}

            <div className={styles.field}>
              <Input
                label={t('settings.model')}
                placeholder={`e.g. ${AI_PROVIDERS.find(p => p.id === aiConfig.provider)?.defaultModel}`}
                value={aiConfig.model}
                onChange={e => setAIConfig(prev => ({ ...prev, model: e.target.value }))}
              />
              <p className={styles.hint}>{t('settings.modelHint')}</p>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>{t('settings.temperature')}</label>
                <div className={styles.sliderContainer}>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={aiConfig.temperature}
                    onChange={e => setAIConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className={styles.slider}
                  />
                  <span className={styles.sliderValue}>{aiConfig.temperature}</span>
                </div>
                <p className={styles.hint}>{t('settings.temperatureHint')}</p>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t('settings.maxTokens')}</label>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  value={aiConfig.maxTokens}
                  onChange={e => setAIConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 2000 }))}
                  className={styles.numberInput}
                />
                <p className={styles.hint}>{t('settings.maxTokensHint')}</p>
              </div>
            </div>

            <div className={styles.toggle}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={aiConfig.enabled}
                  onChange={e => setAIConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                  className={styles.checkbox}
                />
                <span className={styles.toggleSwitch} />
                <span>{t('settings.enableAI')}</span>
              </label>
              <p className={styles.hint}>{t('settings.enableAIHint')}</p>
            </div>

            {testResult && (
              <div className={`${styles.testResult} ${testResult.success ? styles.success : styles.error}`}>
                {testResult.success ? <CheckCircle size={20} /> : <XCircle size={20} />}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className={styles.actions}>
              <Button
                variant="secondary"
                onClick={handleTest}
                isLoading={isTesting}
                disabled={!aiConfig.apiKey.trim()}
              >
                {isTesting ? t('settings.testing') : t('settings.testConnection')}
              </Button>
              <Button variant="primary" onClick={handleSave}>
                {t('settings.saveSettings')}
              </Button>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Key size={20} />
            <h2>{t('settings.dataManagement')}</h2>
          </div>

          <div className={styles.dataActions}>
            <Button variant="secondary" onClick={() => {
              const data = storage.exportData();
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `learn-buddy-backup-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
              showToast(t('common.success'), 'success');
            }}>
              {t('settings.exportData')}
            </Button>

            <div className={styles.importSection}>
              <input
                type="file"
                accept=".json"
                id="importFile"
                className={styles.fileInput}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = event => {
                      const content = event.target?.result as string;
                      if (storage.importData(content)) {
                        showToast(t('common.success'), 'success');
                        window.location.reload();
                      } else {
                        showToast(t('common.error'), 'error');
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
              <label htmlFor="importFile">
                <Button variant="secondary" as="span">
                  {t('settings.importData')}
                </Button>
              </label>
            </div>

            <Button
              variant="danger"
              onClick={() => {
                if (confirm('Clear all data? This cannot be undone.')) {
                  storage.clearAllData();
                  showToast(t('common.success'), 'success');
                  window.location.reload();
                }
              }}
            >
              {t('settings.clearData')}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
