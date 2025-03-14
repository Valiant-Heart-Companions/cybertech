import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
import React from 'react';
import type { IntersectionObserverCallback, IntersectionObserverInit, IntersectionObserverEntry } from '~/types/intersection-observer';
import { useLanguage } from '@/mocks/contexts/LanguageContext';
import { MockLanguageProvider } from '@/mocks/contexts/MockLanguageProvider';

// Extend expect matchers
expect.extend({
  toHaveNoViolations: () => ({
    pass: true,
    message: () => '',
  }),
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: ReadonlyArray<number> = [0];

  constructor(private callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {}

  disconnect(): void {
    // Implementation
  }

  observe(target: Element): void {
    // Implementation
  }

  unobserve(target: Element): void {
    // Implementation
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

global.IntersectionObserver = MockIntersectionObserver;

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({ 
    src, 
    alt, 
    className, 
    ...props 
  }: React.ImgHTMLAttributes<HTMLImageElement>) {
    return React.createElement('img', { src, alt, className, ...props });
  }
}));

jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    forEach: jest.fn(),
    entries: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    toString: jest.fn(),
  }),
}));

// Mock PayPal components
jest.mock('@paypal/react-paypal-js', () => ({
  __esModule: true,
  PayPalButtons: function MockPayPalButtons() {
    return React.createElement('div', { 'data-testid': 'mock-paypal-buttons' });
  },
  PayPalScriptProvider: function MockPayPalScriptProvider({ children }: { children: React.ReactNode }) {
    return React.createElement('div', { 'data-testid': 'mock-paypal-provider' }, children);
  }
}));

// Mock Supabase client
jest.mock('~/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

// Mock Language Context
jest.mock('@/i18n/LanguageContext', () => ({
  useLanguage,
  LanguageProvider: MockLanguageProvider
}));

// Suppress React 18 Strict Mode warnings
const originalError = console.error;
console.error = (...args) => {
  if (/Warning.*not wrapped in act/.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
}; 