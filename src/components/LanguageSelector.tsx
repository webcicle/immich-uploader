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
    <div className={`w-full bg-white rounded-xl shadow-lg p-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <Languages className="w-5 h-5 text-gray-600" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="flex-1 bg-transparent border-none text-base text-gray-700 focus:outline-none cursor-pointer font-medium"
          aria-label={translations.language}
        >
          {availableLanguages.map((lang) => (
            <option key={lang} value={lang}>
              {getLanguageName(lang)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}