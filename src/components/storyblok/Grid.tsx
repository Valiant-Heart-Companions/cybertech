'use client';

import { storyblokEditable, StoryblokComponent, type SbBlokData } from '@storyblok/react';

interface GridProps {
  blok: SbBlokData & {
    columns?: number;
    gap?: 'small' | 'medium' | 'large';
    columns_mobile?: number;
    columns_tablet?: number;
    body: SbBlokData[];
  };
}

export default function Grid({ blok }: GridProps) {
  const columns = blok.columns || 3;
  const columnsTablet = blok.columns_tablet || Math.min(columns, 2);
  const columnsMobile = blok.columns_mobile || 1;
  
  // Gap classes based on prop
  const gapClasses = {
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-8',
  };
  
  // Use the gap prop or default to medium
  const gap = blok.gap ? gapClasses[blok.gap] : gapClasses.medium;
  
  return (
    <div
      {...storyblokEditable(blok)}
      className={`grid grid-cols-${columnsMobile} sm:grid-cols-${columnsTablet} md:grid-cols-${columns} ${gap}`}
    >
      {blok.body?.map((nestedBlok) => (
        <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
    </div>
  );
} 