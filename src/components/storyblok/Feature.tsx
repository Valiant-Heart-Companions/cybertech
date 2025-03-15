/* eslint-disable */
'use client';

import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import Image from 'next/image';
import Link from 'next/link';

interface FeatureProps {
  blok: SbBlokData & {
    name: string;
    description?: string;
    icon?: { filename: string; alt: string };
    link?: { url: string; target?: string };
    cta_text?: string;
    alignment?: 'left' | 'center' | 'right';
    style?: 'card' | 'minimal' | 'highlight';
    icon_position?: 'top' | 'left';
  };
}

export default function Feature({ blok }: FeatureProps) {
  const alignment = blok.alignment || 'center';
  const style = blok.style || 'card';
  const iconPosition = blok.icon_position || 'top';
  
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  
  const styleClasses = {
    card: 'border rounded-lg p-6 h-full shadow-sm hover:shadow-md transition-shadow',
    minimal: 'p-4 h-full',
    highlight: 'border-l-4 border-blue-600 pl-4 py-2 h-full',
  };
  
  const containerClasses = `
    ${alignmentClasses[alignment]} 
    ${styleClasses[style]}
    ${iconPosition === 'left' ? 'flex items-start' : 'flex flex-col'}
  `;
  
  const iconWrapperClasses = `
    ${iconPosition === 'left' ? 'mr-4 flex-shrink-0' : 'mb-4 mx-auto'}
    ${alignment === 'center' && iconPosition === 'top' ? 'mx-auto' : ''}
    ${alignment === 'right' && iconPosition === 'top' ? 'ml-auto' : ''}
  `;
  
  const renderIcon = () => {
    if (blok.icon?.filename) {
      return (
        <div className={`relative h-12 w-12 ${iconWrapperClasses}`}>
          <Image
            src={blok.icon.filename}
            alt={blok.icon.alt || blok.name || 'Feature icon'}
            fill
            sizes="48px"
            className="object-contain"
            loading="lazy"
          />
        </div>
      );
    }
    
    // Default icon if none provided
    return (
      <div className={`h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 ${iconWrapperClasses}`}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-6 h-6"
        >
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
      </div>
    );
  };
  
  const content = (
    <>
      {renderIcon()}
      
      <div className={iconPosition === 'left' ? 'flex-grow' : ''}>
        <h3 className="font-semibold text-lg mb-2">{blok.name}</h3>
        
        {blok.description && (
          <p className="text-gray-600 mb-4">{blok.description}</p>
        )}
        
        {blok.cta_text && blok.link?.url && (
          <Link
            href={blok.link.url}
            target={blok.link.target || '_self'}
            className="text-blue-600 hover:underline font-medium inline-flex items-center"
          >
            {blok.cta_text}
            <svg 
              className="ml-1 w-4 h-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </>
  );
  
  // If there's a link but no CTA text, make the whole component clickable
  if (blok.link?.url && !blok.cta_text) {
    return (
      <Link 
        href={blok.link.url} 
        target={blok.link.target || '_self'}
        className={`block ${containerClasses}`}
        {...storyblokEditable(blok)}
      >
        {content}
      </Link>
    );
  }
  
  // Otherwise, render as a div with an optional link button
  return (
    <div className={containerClasses} {...storyblokEditable(blok)}>
      {content}
    </div>
  );
} 