'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface HeroCarouselProps {
  title: string;
  subtitle: string;
  cta: string;
}

const slides = [
  {
    id: 1,
    image: '/images/hero/slide1.jpg',
    href: '/shop/new-arrivals',
  },
  {
    id: 2,
    image: '/images/hero/slide2.jpg',
    href: '/shop/sale',
  },
  {
    id: 3,
    image: '/images/hero/slide3.jpg',
    href: '/about',
  },
];

export default function HeroCarousel({ title, subtitle, cta }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[300px] md:h-[400px] lg:h-[500px] w-full overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Placeholder div until we have actual images */}
          <div className="relative w-full h-full bg-gray-200">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-black bg-opacity-40 text-white">
              <h2 className="text-2xl md:text-4xl font-bold mb-2">{title}</h2>
              <p className="text-lg md:text-xl mb-4">{subtitle}</p>
              <a
                href={slide.href}
                className="bg-white text-black px-6 py-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                {cta}
              </a>
            </div>
          </div>
        </div>
      ))}
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
} 