// ==============================|| LANGUAGE CONFIGURATION ||============================== //

export interface Language {
  code: string;
  label: string;
  flag: string;
}

/**
 * Parse languages from environment variable
 * Format: code:label:flag (comma-separated)
 * Example: ar:Arabic:🇸🇦,fr:French:🇫🇷,es:Spanish:🇪🇸
 */
export function getSupportedLanguages(): Language[] {
  const languagesEnv = process.env.NEXT_PUBLIC_SUPPORTED_LANGUAGES;

  if (!languagesEnv) {
    // Default fallback languages
    return [
      { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
      { code: 'fr', label: 'French', flag: '🇫🇷' },
      { code: 'es', label: 'Spanish', flag: '🇪🇸' }
    ];
  }

  try {
    return languagesEnv.split(',').map((lang) => {
      const [code, label, flag] = lang.trim().split(':');
      return { code, label, flag };
    });
  } catch (error) {
    console.error('Failed to parse NEXT_PUBLIC_SUPPORTED_LANGUAGES:', error);
    // Return default fallback
    return [
      { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
      { code: 'fr', label: 'French', flag: '🇫🇷' },
      { code: 'es', label: 'Spanish', flag: '🇪🇸' }
    ];
  }
}

/**
 * Get language codes only
 */
export function getLanguageCodes(): string[] {
  return getSupportedLanguages().map((lang) => lang.code);
}
