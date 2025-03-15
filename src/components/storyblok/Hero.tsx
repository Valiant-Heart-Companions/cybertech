/* eslint-disable */
'use client';

import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface HeroSlide {
  image: { filename: string; alt: string };
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: { url: string; target?: string };
}

interface HeroProps {
  blok: SbBlokData & {
    slides: HeroSlide[];
    autoplay?: boolean;
    autoplay_speed?: number;
  };
}

export default function Hero({ blok }: HeroProps) {
  // Check if blok and slides exist to avoid errors
  if (!blok) {
    console.error('Hero component: Missing blok data');
    return <div className="h-64 bg-gray-200 rounded-md mb-8 flex items-center justify-center">Hero component error: Missing data</div>;
  }

  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = Array.isArray(blok.slides) ? blok.slides : [];
  const maxSlides = Math.min(slides.length, 3); // Enforce max 3 slides as per spec
  const autoplaySpeed = blok.autoplay_speed || 5000;

  // Handle autoplay
  useEffect(() => {
    if (!blok.autoplay || slides.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % maxSlides);
    }, autoplaySpeed);
    
    return () => clearInterval(interval);
  }, [blok.autoplay, maxSlides, autoplaySpeed, slides.length]);

  // Navigate to next/prev slide
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (!slides.length) {
    return (
      <div className="h-64 bg-gray-200 rounded-md mb-8 flex items-center justify-center">
        <p className="text-gray-500">Hero content not configured</p>
      </div>
    );
  }

  return (
    <div {...storyblokEditable(blok)} className="relative overflow-hidden rounded-lg mb-8 w-full">
      <div 
        className="flex transition-transform duration-500 ease-in-out h-[300px] md:h-[400px] lg:h-[500px]" 
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.slice(0, maxSlides).map((slide, index) => (
          <div key={index} className="w-full flex-shrink-0 relative">
            {slide.image?.filename ? (
              <Image
                src={slide.image.filename}
                alt={slide.image.alt || 'Hero image'}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
                priority={index === 0} // Prioritize loading the first slide
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-blue-100 flex items-center justify-center">
                <p className="text-blue-500">Image not available</p>
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-start p-6 md:p-10">
              {slide.title && <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">{slide.title}</h2>}
              {slide.subtitle && <p className="text-lg md:text-xl text-white mb-6">{slide.subtitle}</p>}
              {slide.cta_text && slide.cta_link?.url && (
                <a 
                  href={slide.cta_link.url}
                  target={slide.cta_link.target || '_self'}
                  className="bg-white text-blue-600 px-6 py-2 rounded-md font-medium hover:bg-blue-100 transition-colors"
                >
                  {slide.cta_text}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Slide indicators/navigation */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {slides.slice(0, maxSlides).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                currentSlide === index ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
} 