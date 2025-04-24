import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { theme } from '../theme';

const SETTINGS_KEY = 'amc_settings';

const loadSettings = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : { defaultPrice: 0 };
  } catch {
    return { defaultPrice: 0 };
  }
};

const saveSettings = (settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

const Settings = () => {
  const { language, changeLanguage, t } = useLanguage();
  const [currency, setCurrency] = useState('€');
  const [saved, setSaved] = useState(false);
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'bs', label: 'Bosnian' },
  ];
  const currencyOptions = [
    { value: '€', label: 'EUR (€)' },
    { value: '$', label: 'USD ($)' },
    { value: '£', label: 'GBP (£)' },
    { value: 'BAM', label: 'BAM (KM)' },
    { value: 'KM', label: 'KM' },
    { value: 'CHF', label: 'CHF' },
    { value: 'RSD', label: 'RSD' },
    { value: 'HRK', label: 'HRK' },
  ];

  useEffect(() => {
    const settings = loadSettings();
    setCurrency(settings.currency || '€');
    // Optionally restore language from settings if desired
    if (settings.language && settings.language !== language) {
      changeLanguage(settings.language);
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    // Save both currency and language
    saveSettings({ currency, language });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <div className="container mx-auto max-w-md p-6" style={{ color: theme.colors.text }}>
      <h2 className="text-xl font-semibold mb-6">{t('settings')}</h2>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium">{t('language')}</label>
          <select
            value={language}
            onChange={e => changeLanguage(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            style={{ background: theme.colors.surface, color: theme.colors.text }}
          >
            {languageOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-2 font-medium">{t('currency')}</label>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            style={{ background: theme.colors.surface, color: theme.colors.text }}
          >
            {currencyOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="px-6 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
        >
          {t('saveSettings')}
        </button>
        {saved && <div className="text-green-600 mt-2">{t('settingsSaved')}</div>}
      </form>
    </div>
  );
};

export default Settings;
