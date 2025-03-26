import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { theme } from '../../theme';

const LanguageSelector = () => {
  const { language, changeLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-2 border rounded-md p-1 px-2" 
      style={{ 
        backgroundColor: theme.colors.background, 
        borderColor: theme.colors.border 
      }}
    >
      <span className="text-sm font-medium" style={{ color: theme.colors.textLight }}>
        {t('language')}:
      </span>
      <button
        onClick={() => changeLanguage('en')}
        className={`text-sm px-2 py-1 rounded-md ${language === 'en' ? 'font-bold' : ''}`}
        style={{ 
          color: language === 'en' ? theme.colors.primary : theme.colors.text,
          backgroundColor: language === 'en' ? `${theme.colors.primary}20` : 'transparent'
        }}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('bs')}
        className={`text-sm px-2 py-1 rounded-md ${language === 'bs' ? 'font-bold' : ''}`}
        style={{ 
          color: language === 'bs' ? theme.colors.primary : theme.colors.text,
          backgroundColor: language === 'bs' ? `${theme.colors.primary}20` : 'transparent'
        }}
      >
        BS
      </button>
    </div>
  );
};

export default LanguageSelector;
