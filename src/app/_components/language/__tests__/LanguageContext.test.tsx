/* eslint-disable */
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '~/i18n/LanguageContext';
import { Language } from '~/i18n/translations';

describe.skip('LanguageContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LanguageProvider>{children}</LanguageProvider>
  );

  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with default language', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    expect(result.current.language).toBe('es'); // Spanish is default per spec
  });

  it('changes language to English', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    act(() => {
      result.current.setLanguage('en');
    });

    expect(result.current.language).toBe('en');
  });

  it('persists language preference in localStorage', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    act(() => {
      result.current.setLanguage('en');
    });

    expect(localStorage.getItem('language')).toBe('en');
  });

  it('loads language preference from localStorage on initialization', () => {
    localStorage.setItem('language', 'en');
    const { result } = renderHook(() => useLanguage(), { wrapper });
    expect(result.current.language).toBe('en');
  });

  it('provides access to available languages', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    expect(result.current.languages).toBeDefined();
    expect(result.current.languages).toHaveProperty('en', 'English');
    expect(result.current.languages).toHaveProperty('es', 'Español');
  });

  it('maintains language preference across page reloads', () => {
    localStorage.setItem('language', 'en');
    const { result } = renderHook(() => useLanguage(), { wrapper });
    expect(result.current.language).toBe('en');

    act(() => {
      result.current.setLanguage('es');
    });

    const { result: reloadedResult } = renderHook(() => useLanguage(), { wrapper });
    expect(reloadedResult.current.language).toBe('es');
  });

  it('throws error when used outside provider', () => {
    expect(() => renderHook(() => useLanguage())).toThrow('useLanguage must be used within a LanguageProvider');
  });
}); 