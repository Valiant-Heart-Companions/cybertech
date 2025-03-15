/* eslint-disable */
'use client';

import { StoryblokComponent } from '@storyblok/react';
import { useState, useEffect } from 'react';
import type { SbBlokData } from '@storyblok/react';

interface StoryblokContentWrapperProps {
  content: SbBlokData;
}

export default function StoryblokContentWrapper({ content }: StoryblokContentWrapperProps) {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Reset error state when content changes
    setHasError(false);
    setErrorMessage(null);
  }, [content]);

  if (!content) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-8">
        <p className="text-sm text-yellow-700">
          No Storyblok content available to render.
        </p>
      </div>
    );
  }

  // Safely render the StoryblokComponent
  try {
    return <StoryblokComponent blok={content} />;
  } catch (error) {
    // If an error occurs during rendering, show an error message
    if (!hasError) {
      console.error('Error rendering Storyblok content:', error);
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    }

    return (
      <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              <strong>Error rendering Storyblok content:</strong> {errorMessage || 'An unknown error occurred'}
            </p>
            <p className="text-sm text-red-700 mt-2">
              Please check your Storyblok components and content structure.
            </p>
          </div>
        </div>
      </div>
    );
  }
} 