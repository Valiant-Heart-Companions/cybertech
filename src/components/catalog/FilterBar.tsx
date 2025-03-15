/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '~/lib/supabase';
import { useLanguage } from '~/i18n/LanguageContext';
import { translations } from '~/i18n/translations';

interface FilterBarProps {
  isMobileDrawer?: boolean;
}

export default function FilterBar({ isMobileDrawer = false }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const t = translations[language];

  const [isOpen, setIsOpen] = useState(isMobileDrawer);
  const [minPrice, setMinPrice] = useState(searchParams?.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams?.get('maxPrice') || '');
  const [inStock, setInStock] = useState(searchParams?.get('inStock') === 'true');
  const [loading, setLoading] = useState(false);

  // Get current filters from URL
  const currentCategory = searchParams?.get('category') || '';
  const currentSearch = searchParams?.get('search') || '';

  const applyFilters = () => {
    setLoading(true);

    // Build URL parameters
    const params = new URLSearchParams();
    
    // Keep existing category and search params if they exist
    if (currentCategory) params.set('category', currentCategory);
    if (currentSearch) params.set('search', currentSearch);
    
    // Add price filters if set
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    
    // Add stock filters
    if (inStock) params.set('inStock', 'true');
    
    // Navigate to the new URL with filters
    router.push(`/shop?${params.toString()}`);
    setIsOpen(false);
    setLoading(false);
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setInStock(false);
    
    // Keep only category and search terms if they exist
    const params = new URLSearchParams();
    if (currentCategory) params.set('category', currentCategory);
    if (currentSearch) params.set('search', currentSearch);
    
    router.push(`/shop?${params.toString()}`);
    setIsOpen(false);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h3 className={`font-medium mb-4 ${isMobileDrawer ? 'text-lg' : ''}`}>{t.shop.filters.priceRange}</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label htmlFor="min-price" className="sr-only">{t.shop.filters.min}</label>
            <input
              id="min-price"
              type="number"
              placeholder={t.shop.filters.min}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <span className="text-gray-500">-</span>
          <div className="flex-1">
            <label htmlFor="max-price" className="sr-only">{t.shop.filters.max}</label>
            <input
              id="max-price"
              type="number"
              placeholder={t.shop.filters.max}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className={`font-medium mb-4 ${isMobileDrawer ? 'text-lg' : ''}`}>{t.shop.filters.availability}</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
            />
            <span className={`ml-3 ${isMobileDrawer ? 'text-base' : 'text-sm'}`}>{t.shop.filters.inStock}</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col space-y-3">
        <button 
          onClick={applyFilters}
          disabled={loading}
          className={`w-full bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 
            ${isMobileDrawer ? 'py-3 text-base' : 'py-2 text-sm'}`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t.shop.filters.applying}
            </span>
          ) : (
            t.shop.filters.apply
          )}
        </button>
        <button 
          onClick={clearFilters}
          className={`w-full bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 
            ${isMobileDrawer ? 'py-3 text-base' : 'py-2 text-sm'}`}
        >
          {t.shop.filters.clear}
        </button>
      </div>
    </div>
  );

  // For mobile drawer, always show content
  if (isMobileDrawer) {
    return <FilterContent />;
  }

  // For desktop, show dropdown
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-white border rounded-lg shadow-sm"
      >
        <span className="font-medium">{t.shop.filters.title}</span>
        <svg
          className={`w-4 h-4 transform transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg p-4 z-50">
          <FilterContent />
        </div>
      )}
    </div>
  );
} 