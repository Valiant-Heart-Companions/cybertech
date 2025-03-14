'use client';

import { apiPlugin, storyblokInit, useStoryblokState } from '@storyblok/react';
import { type ReactNode, useEffect, useState } from 'react';

// Import your Storyblok components here
import Page from './storyblok/Page';
import Hero from './storyblok/Hero';
import Feature from './storyblok/Feature';
import Grid from './storyblok/Grid';
import ProductList from './storyblok/ProductList';
import CategoryNavigation from './storyblok/CategoryNavigation';
import PromotionalBanner from './storyblok/PromotionalBanner';

// Initialize Storyblok components
const components = {
  page: Page,
  hero: Hero,
  feature: Feature,
  grid: Grid,
  'product-list': ProductList,
  'category-navigation': CategoryNavigation,
  'promotional-banner': PromotionalBanner,
};

// Initialize Storyblok
let storyblokInitialized = false;

// Create a cache version timestamp
const CACHE_VERSION = Math.floor(Date.now() / 1000);

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Select the appropriate token based on environment
const getStoryblokToken = () => {
  // In development, use preview token to see draft content
  if (isDevelopment) {
    return process.env.STORYBLOK_PREVIEW_TOKEN || process.env.NEXT_PUBLIC_STORYBLOK_API_TOKEN;
  }
  
  // In production, use public token for published content
  return process.env.STORYBLOK_PUBLIC_TOKEN || process.env.NEXT_PUBLIC_STORYBLOK_API_TOKEN;
};

// Get the token for the current environment
const STORYBLOK_TOKEN = getStoryblokToken();

// Log which token we're using (masked for security)
if (STORYBLOK_TOKEN) {
  const maskedToken = STORYBLOK_TOKEN.length > 8 
    ? `${STORYBLOK_TOKEN.substring(0, 4)}...${STORYBLOK_TOKEN.substring(STORYBLOK_TOKEN.length - 4)}`
    : '(invalid token)';
  console.log(`StoryblokProvider: Using ${isDevelopment ? 'preview' : 'public'} token: ${maskedToken} with cache version ${CACHE_VERSION}`);
} else {
  console.error('StoryblokProvider: No token available!');
}

try {
  if (!storyblokInitialized) {
    if (!STORYBLOK_TOKEN) {
      throw new Error('No Storyblok token available');
    }
    
    // Initialize with additional query params to include cache version
    const queryParams = { cv: CACHE_VERSION.toString() };
    
    storyblokInit({
      accessToken: STORYBLOK_TOKEN,
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
      bridge: isDevelopment // Only enable bridge in development mode
    });
    storyblokInitialized = true;
    console.log(`StoryblokProvider: Initialized successfully in ${isDevelopment ? 'development' : 'production'} mode with US region`);
  }
} catch (error) {
  console.error('StoryblokProvider: Failed to initialize Storyblok:', error);
}

type StoryblokProviderProps = {
  children: ReactNode;
  story: any;
};

export default function StoryblokProvider({ children, story }: StoryblokProviderProps) {
  const [hasError, setHasError] = useState(false);

  // Handle story content state
  let storyContent;
  try {
    storyContent = useStoryblokState(story);
  } catch (error) {
    console.error('StoryblokProvider: Error in useStoryblokState:', error);
    setHasError(true);
  }

  // Monitor for errors
  useEffect(() => {
    if (hasError) {
      console.error('StoryblokProvider: Rendering with errors. Check your Storyblok configuration.');
    }
  }, [hasError]);

  return (
    <>
      {hasError && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading Storyblok content. Please check your configuration.
              </p>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
} 