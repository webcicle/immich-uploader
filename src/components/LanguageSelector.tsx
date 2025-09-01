"use client"

import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { availableLanguages, Language } from '@/lib/translations';

interface LanguageSelectorProps {
  className?: string;
}

export default function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  const { language, translations, setLanguage } = useLanguage();

  const getLanguageName = (lang: Language): string => {
    switch (lang) {
      case 'en':
        return translations.english;
      case 'sv':
        return translations.swedish;
      default:
        return lang;
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Languages className="w-4 h-4 text-gray-600" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="bg-transparent border-none text-sm text-gray-600 focus:outline-none cursor-pointer"
        aria-label={translations.language}
      >
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {getLanguageName(lang)}
          </option>
        ))}
      </select>
    </div>
  );
}