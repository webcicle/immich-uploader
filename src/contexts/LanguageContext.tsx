"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translations, getTranslations, defaultLanguage } from '@/lib/translations';
import { getLanguageFromBrowser, setLanguageCookie } from '@/lib/language';

interface LanguageContextType {
  language: Language;
  translations: Translations;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
}

export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(initialLanguage || defaultLanguage);
  const [translations, setTranslations] = useState<Translations>(getTranslations(language));

  useEffect(() => {
    // On initial load, get language from cookie if not provided as prop
    if (!initialLanguage) {
      const browserLanguage = getLanguageFromBrowser();
      if (browserLanguage !== language) {
        setLanguageState(browserLanguage);
        setTranslations(getTranslations(browserLanguage));
      }
    }
  }, [initialLanguage, language]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    setTranslations(getTranslations(newLanguage));
    setLanguageCookie(newLanguage);
  };

  useEffect(() => {
    setTranslations(getTranslations(language));
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, translations, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}