'use client';

import { storyblokEditable, StoryblokComponent, type SbBlokData } from '@storyblok/react';

interface PageProps {
  blok: SbBlokData & {
    body: SbBlokData[];
    title?: string;
    description?: string;
    use_container?: boolean;
    container_size?: 'small' | 'medium' | 'large' | 'full';
  };
}

export default function Page({ blok }: PageProps) {
  const useContainer = blok.use_container !== false;
  const containerSize = blok.container_size || 'medium';
  
  const containerClasses = {
    small: 'max-w-4xl',
    medium: 'max-w-6xl',
    large: 'max-w-7xl',
    full: 'max-w-full',
  };
  
  return (
    <div {...storyblokEditable(blok)}>
      {/* Use container if specified */}
      <div className={`${useContainer ? `container mx-auto px-4 ${containerClasses[containerSize]}` : ''}`}>
        {/* Optional page title */}
        {blok.title && (
          <h1 className="text-3xl font-bold mb-4">{blok.title}</h1>
        )}
        
        {/* Optional page description */}
        {blok.description && (
          <p className="text-gray-600 mb-8">{blok.description}</p>
        )}
        
        {/* Render nested components */}
        {blok.body?.map((nestedBlok) => (
          <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
        ))}
      </div>
    </div>
  );
} 