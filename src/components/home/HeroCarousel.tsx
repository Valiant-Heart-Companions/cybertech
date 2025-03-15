/* eslint-disable */
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface HeroCarouselProps {
  title: string;
  subtitle: string;
  cta: string;
}

interface Slide {
  id: number;
  type: 'video' | 'image';
  src: string;
  href: string;
}

const slides: Slide[] = [
  {
    id: 1,
    type: 'video',
    src: '/images/Hero/generated.mp4',
    href: '/shop/new-arrivals',
  },
  {
    id: 2,
    type: 'image',
    src: '/images/Hero/electronics_for_s_image.jpg',
    href: '/shop/sale',
  },
  {
    id: 3,
    type: 'image',
    src: '/images/Hero/_electronics_for_s_image(1).jpg',
    href: '/about',
  },
];

export default function HeroCarousel({ title, subtitle, cta }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        // If we're on the video slide and it's not finished, don't advance
        if (prev === 0 && videoRef.current && !videoRef.current.ended) {
          return prev;
        }
        return (prev + 1) % slides.length;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Handle video end
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleVideoEnd = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      };
      video.addEventListener('ended', handleVideoEnd);
      return () => video.removeEventListener('ended', handleVideoEnd);
    }
  }, []);

  return (
    <div className="relative h-[300px] md:h-[400px] lg:h-[500px] w-full overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {slide.type === 'video' ? (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              >
                <source src={slide.src} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
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
          ) : (
            <div className="relative w-full h-full">
              <Image
                src={slide.src}
                alt={`Slide ${slide.id}`}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
              />
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
          )}
        </div>
      ))}
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentSlide(index);
              if (index === 0 && videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.play();
              }
            }}
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