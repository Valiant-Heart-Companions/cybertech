export type Language = 'en' | 'es';

export interface Translations {
  products: Record<string, string>;
  cart: Record<string, string>;
  checkout: Record<string, string>;
  common: {
    loading: string;
    error: string;
    success: string;
  };
}

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: Translations;
}

export const mockTranslations: Translations = {
  products: {},
  cart: {},
  checkout: {},
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success'
  }
};

export const mockLanguageContext: LanguageContextType = {
  language: 'es',
  setLanguage: jest.fn(),
  translations: mockTranslations
};

export const useLanguage = () => mockLanguageContext; 