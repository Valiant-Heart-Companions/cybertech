'use client';

import { storyblokEditable, type SbBlokData } from '@storyblok/react';

interface TeaserProps {
  blok: SbBlokData & {
    headline?: string;
    subheadline?: string;
    cta_text?: string;
    cta_link?: string;
    image?: {
      filename: string;
      alt?: string;
    };
  };
}

export default function Teaser({ blok }: TeaserProps) {
  return (
    <div {...storyblokEditable(blok)} className="py-10">
      <div className="max-w-5xl mx-auto px-4">
        {blok.headline && (
          <h2 className="text-4xl font-bold mb-4">{blok.headline}</h2>
        )}
        
        {blok.subheadline && (
          <p className="text-xl text-gray-600 mb-6">{blok.subheadline}</p>
        )}
        
        {blok.cta_text && blok.cta_link && (
          <a 
            href={blok.cta_link} 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            {blok.cta_text}
          </a>
        )}
      </div>
    </div>
  );
} 