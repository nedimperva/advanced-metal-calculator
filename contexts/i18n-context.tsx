"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, Translations, translations, getTranslation } from '@/lib/i18n'

interface I18nContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: keyof Translations) => string
  availableLanguages: { code: Language; name: string; nativeName: string }[]
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>('en')

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('metal-calculator-language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'bs')) {
      setLanguageState(savedLanguage)
    } else {
      // Detect browser language
      const browserLanguage = navigator.language.toLowerCase()
      if (browserLanguage.startsWith('bs') || browserLanguage.includes('bosnia')) {
        setLanguageState('bs')
      }
    }
  }, [])

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    localStorage.setItem('metal-calculator-language', newLanguage)
  }

  const t = (key: keyof Translations): string => {
    return getTranslation(language, key)
  }

  const availableLanguages = [
    { code: 'en' as Language, name: 'English', nativeName: 'English' },
    { code: 'bs' as Language, name: 'Bosnian', nativeName: 'Bosanski' }
  ]

  const value: I18nContextType = {
    language,
    setLanguage,
    t,
    availableLanguages
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
} 