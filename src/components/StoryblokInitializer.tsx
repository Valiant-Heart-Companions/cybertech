/* eslint-disable */
'use client';

import { storyblokInit, apiPlugin } from '@storyblok/react';
import { useEffect, useState } from 'react';

// Import Storyblok components
import Page from './storyblok/Page';
import Hero from './storyblok/Hero';
import Feature from './storyblok/Feature';
import Grid from './storyblok/Grid';
import ProductList from './storyblok/ProductList';
import CategoryNavigation from './storyblok/CategoryNavigation';
import PromotionalBanner from './storyblok/PromotionalBanner';
import Teaser from './storyblok/Teaser';

// Component mapping
const components = {
  page: Page,
  hero: Hero,
  feature: Feature,
  grid: Grid,
  teaser: Teaser,
  'product-list': ProductList,
  'category-navigation': CategoryNavigation,
  'promotional-banner': PromotionalBanner,
};

// Create a cache version timestamp
const CACHE_VERSION = Math.floor(Date.now() / 1000);

export default function StoryblokInitializer({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Initialize Storyblok only on the client side
    const initStoryblok = async () => {
      try {
        // Determine if we're in development mode
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        // Select the appropriate token based on environment
        let token;
        if (isDevelopment) {
          // In development, use preview token to see draft content
          token = process.env.STORYBLOK_PREVIEW_TOKEN || process.env.NEXT_PUBLIC_STORYBLOK_API_TOKEN;
        } else {
          // In production, use public token for published content
          token = process.env.STORYBLOK_PUBLIC_TOKEN || process.env.NEXT_PUBLIC_STORYBLOK_API_TOKEN;
        }
        
        if (!token) {
          throw new Error('No Storyblok token available');
        }
        
        // Log which token we're using (masked for security)
        const maskedToken = token.length > 8 
          ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}`
          : '(invalid token)';
        console.log(`StoryblokInitializer: Using ${isDevelopment ? 'preview' : 'public'} token: ${maskedToken}`);

        storyblokInit({
          accessToken: token,
          use: [apiPlugin],
          components,
          apiOptions: {
            region: 'us',
            cache: {
              type: 'memory',
              clear: 'auto'
            },
            https: true,
            rateLimit: 5,
            timeout: 10000
          },
          bridge: isDevelopment
        });
        
        console.log(`StoryblokInitializer: Successfully initialized in ${isDevelopment ? 'development' : 'production'} mode with cache version ${CACHE_VERSION}`);
        setInitialized(true);
      } catch (err) {
        console.error('StoryblokInitializer: Failed to initialize Storyblok:', err);
        setError(err instanceof Error ? err : new Error('Unknown error initializing Storyblok'));
        // Still set initialized to true to render the children
        setInitialized(true);
      }
    };

    initStoryblok();
  }, []);

  // Show a loading state until Storyblok is initialized
  if (!initialized) {
    return <div className="p-4 text-center">Loading Storyblok components...</div>;
  }

  // Show error state if initialization failed
  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Error initializing Storyblok:</strong> {error.message}
              </p>
              <p className="text-sm text-red-700 mt-2">
                Please check your Storyblok configuration and API keys.
              </p>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return <>{children}</>;
} 