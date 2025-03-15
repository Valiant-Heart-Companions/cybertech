/* eslint-disable */
'use client';

import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import Image from 'next/image';
import Link from 'next/link';

interface Category {
  name: string;
  slug: string;
  image?: { filename: string; alt: string };
  link: { url: string; target?: string };
}

interface CategoryNavigationProps {
  blok: SbBlokData & {
    title: string;
    categories: Category[];
    display_type?: 'grid' | 'list' | 'carousel';
    columns?: number;
  };
}

export default function CategoryNavigation({ blok }: CategoryNavigationProps) {
  const categories = blok.categories || [];
  const displayType = blok.display_type || 'grid';
  const columns = blok.columns || 4;

  if (!categories.length) {
    return <div className="mb-12 p-4 bg-gray-100 rounded text-center">No categories configured</div>;
  }

  return (
    <div {...storyblokEditable(blok)} className="mb-12">
      <h2 className="text-2xl font-bold mb-6">{blok.title || 'Shop by Category'}</h2>
      
      {displayType === 'grid' && (
        <div 
          className={`grid grid-cols-2 sm:grid-cols-${Math.min(columns, 2)} md:grid-cols-${Math.min(columns, 4)} gap-4`}
        >
          {categories.map((category, index) => (
            <Link 
              key={index}
              href={category.link?.url || `/category/${category.slug}`}
              target={category.link?.target || '_self'}
              className="group"
            >
              <div className="border rounded-md p-4 text-center hover:bg-gray-50 transition-colors active:bg-gray-100 h-full flex flex-col items-center justify-center touch-manipulation">
                <div className="relative h-20 w-20 rounded-full overflow-hidden mb-4 bg-gray-100 mx-auto">
                  {category.image?.filename ? (
                    <Image
                      src={category.image.filename}
                      alt={category.image.alt || category.name}
                      fill
                      sizes="80px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-500">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="currentColor"
                        className="w-10 h-10"
                      >
                        <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z" />
                        <path fillRule="evenodd" d="M3.087 9l.54 9.176A3 3 0 006.62 21h10.757a3 3 0 002.995-2.824L20.913 9H3.087zm6.133 2.845a.75.75 0 011.06 0l1.72 1.72 1.72-1.72a.75.75 0 111.06 1.06l-1.72 1.72 1.72 1.72a.75.75 0 11-1.06 1.06L12 15.685l-1.72 1.72a.75.75 0 11-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {displayType === 'list' && (
        <ul className="divide-y border-t border-b">
          {categories.map((category, index) => (
            <li key={index}>
              <Link 
                href={category.link?.url || `/category/${category.slug}`}
                target={category.link?.target || '_self'}
                className="flex items-center py-3 px-2 hover:bg-gray-50 transition-colors active:bg-gray-100 touch-manipulation"
              >
                {category.image?.filename && (
                  <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3 bg-gray-100">
                    <Image
                      src={category.image.filename}
                      alt={category.image.alt || category.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <span className="font-medium text-gray-900">{category.name}</span>
                <svg 
                  className="ml-auto w-5 h-5 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}
      
      {displayType === 'carousel' && (
        <div className="flex overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 -mx-4 px-4 touch-pan-x">
          <div className="flex space-x-4">
            {categories.map((category, index) => (
              <Link 
                key={index}
                href={category.link?.url || `/category/${category.slug}`}
                target={category.link?.target || '_self'}
                className="flex-shrink-0 w-36 group"
              >
                <div className="border rounded-md p-3 text-center hover:bg-gray-50 transition-colors active:bg-gray-100 h-full flex flex-col items-center justify-center touch-manipulation">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden mb-3 bg-gray-100">
                    {category.image?.filename ? (
                      <Image
                        src={category.image.filename}
                        alt={category.image.alt || category.name}
                        fill
                        sizes="64px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-500">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="currentColor"
                          className="w-8 h-8"
                        >
                          <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z" />
                          <path fillRule="evenodd" d="M3.087 9l.54 9.176A3 3 0 006.62 21h10.757a3 3 0 002.995-2.824L20.913 9H3.087zm6.133 2.845a.75.75 0 011.06 0l1.72 1.72 1.72-1.72a.75.75 0 111.06 1.06l-1.72 1.72 1.72 1.72a.75.75 0 11-1.06 1.06L12 15.685l-1.72 1.72a.75.75 0 11-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 