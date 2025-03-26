import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../translations/translations';

// Create the language context
const LanguageContext = createContext();

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Language provider component
export const LanguageProvider = ({ children }) => {
  // Get the saved language from localStorage or default to English
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('metalCalculator.language');
    return savedLanguage || 'en';
  });

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('metalCalculator.language', language);
  }, [language]);

  // Function to change the language
  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  // Function to get a translation
  const t = (key) => {
    if (!translations[language] || !translations[language][key]) {
      // Fallback to English if translation is missing
      return translations.en[key] || key;
    }
    return translations[language][key];
  };

  // Value to be provided by the context
  const value = {
    language,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
