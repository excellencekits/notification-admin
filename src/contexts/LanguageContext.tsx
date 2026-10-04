'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCookie, setCookie } from 'cookies-next';
import { getSupportedLanguages } from 'utils/languageConfig';

// ==============================|| LANGUAGE CONTEXT ||============================== //

interface LanguageContextType {
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  supportedLanguages: Array<{ code: string; label: string; flag: string }>;
  getTranslatedValue: (translationsMap?: Record<string, string | undefined>, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_COOKIE_KEY = 'selected_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const supportedLanguages = getSupportedLanguages();
  const [selectedLanguage, setSelectedLanguageState] = useState<string>('en');

  // Load language from cookie on mount
  useEffect(() => {
    const savedLang = getCookie(LANGUAGE_COOKIE_KEY);
    if (savedLang && typeof savedLang === 'string') {
      setSelectedLanguageState(savedLang);
    }
  }, []);

  // Save language to cookie when it changes
  const setSelectedLanguage = (lang: string) => {
    setSelectedLanguageState(lang);
    setCookie(LANGUAGE_COOKIE_KEY, lang, {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: '/'
    });
  };

  // Helper function to get translated value based on selected language
  const getTranslatedValue = (translationsMap?: Record<string, string | undefined>, fallback: string = ''): string => {
    // If no translations map, return fallback
    if (!translationsMap) {
      return fallback;
    }

    // If selected language is English or not set, return fallback
    if (selectedLanguage === 'en') {
      return fallback;
    }

    // Try to get translation for selected language
    const translation = translationsMap[selectedLanguage];
    if (translation && translation.trim()) {
      return translation;
    }

    // Fall back to original value
    return fallback;
  };

  const value: LanguageContextType = {
    selectedLanguage,
    setSelectedLanguage,
    supportedLanguages,
    getTranslatedValue
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
