'use client';

import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import Image from 'next/image';
import Link from 'next/link';

interface PromotionalBannerProps {
  blok: SbBlokData & {
    title: string;
    subtitle?: string;
    cta_text?: string;
    cta_link?: { url: string; target?: string };
    background_color?: string;
    text_color?: string;
    background_image?: { filename: string; alt: string };
    orientation?: 'left' | 'center' | 'right';
    style?: 'solid' | 'gradient' | 'image';
    size?: 'small' | 'medium' | 'large';
  };
}

export default function PromotionalBanner({ blok }: PromotionalBannerProps) {
  // Default values
  const textColor = blok.text_color || 'text-gray-900';
  const orientation = blok.orientation || 'left';
  const style = blok.style || 'solid';
  const size = blok.size || 'medium';
  
  // Size variations
  const sizeClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8 md:p-10',
  };
  
  // Text alignment based on orientation
  const textAlignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  
  // Background color variations (with fallback)
  const getBackgroundColor = () => {
    if (style === 'image') return 'bg-gray-900 bg-opacity-60'; // Overlay for image
    if (style === 'gradient') return `from-${blok.background_color || 'blue-600'} to-${getGradientEndColor()}`;
    return `bg-${blok.background_color || 'yellow-100'}`;
  };
  
  // Get gradient end color (default is a darker version of the background color)
  const getGradientEndColor = () => {
    const color = blok.background_color || 'blue-600';
    const colorParts = color.split('-');
    const colorBase = colorParts[0];
    const colorNumber = parseInt(colorParts[1] || '600', 10);
    const darkerNumber = Math.min(colorNumber + 200, 900);
    return `${colorBase}-${darkerNumber}`;
  };
  
  return (
    <div 
      {...storyblokEditable(blok)} 
      className={`
        mb-12 rounded-lg overflow-hidden relative
        ${sizeClasses[size]} 
        ${textAlignmentClasses[orientation]}
        ${style === 'gradient' ? `bg-gradient-to-tr ${getBackgroundColor()}` : getBackgroundColor()}
      `}
    >
      {/* Background image with overlay if style is 'image' */}
      {style === 'image' && blok.background_image?.filename && (
        <div className="absolute inset-0 -z-10">
          <Image
            src={blok.background_image.filename}
            alt={blok.background_image.alt || ''}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority={false}
            quality={80} // Compression for performance
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
      )}
      
      <div className={`relative z-10 ${style === 'image' ? 'text-white' : textColor}`}>
        {blok.title && (
          <h2 className={`font-bold mb-2 ${size === 'large' ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
            {blok.title}
          </h2>
        )}
        
        {blok.subtitle && (
          <p className={`mb-4 ${size === 'small' ? 'text-sm' : ''}`}>
            {blok.subtitle}
          </p>
        )}
        
        {blok.cta_text && blok.cta_link?.url && (
          <Link
            href={blok.cta_link.url}
            target={blok.cta_link.target || '_self'}
            className={`
              inline-block px-4 py-2 rounded-md font-medium transition-colors
              ${style === 'image' 
                ? 'bg-white text-gray-900 hover:bg-gray-100' 
                : 'bg-blue-600 text-white hover:bg-blue-700'}
            `}
          >
            {blok.cta_text}
          </Link>
        )}
      </div>
    </div>
  );
} 