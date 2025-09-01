// Language utilities for managing language state and cookies

import { Language, defaultLanguage, availableLanguages } from './translations';

export const LANGUAGE_COOKIE_NAME = 'immich-share-language';
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

/**
 * Parse language from cookie string or return default
 */
export function parseLanguageFromCookie(cookieString?: string): Language {
  if (!cookieString) return defaultLanguage;
  
  const cookies = cookieString.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {} as Record<string, string>);
  
  const language = cookies[LANGUAGE_COOKIE_NAME] as Language;
  return availableLanguages.includes(language) ? language : defaultLanguage;
}

/**
 * Set language cookie (for use in client-side code)
 */
export function setLanguageCookie(language: Language) {
  if (typeof document !== 'undefined') {
    document.cookie = `${LANGUAGE_COOKIE_NAME}=${language}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  }
}

/**
 * Get language from browser cookies (client-side only)
 */
export function getLanguageFromBrowser(): Language {
  if (typeof document === 'undefined') return defaultLanguage;
  return parseLanguageFromCookie(document.cookie);
}

/**
 * Create Set-Cookie header value for language
 */
export function createLanguageCookieHeader(language: Language): string {
  return `${LANGUAGE_COOKIE_NAME}=${language}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}