'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductGrid from '~/components/catalog/ProductGrid';
import CategorySidebar from '~/components/catalog/CategorySidebar';
import FilterBar from '~/components/catalog/FilterBar';
import { useLanguage } from '~/i18n/LanguageContext';
import { translations } from '~/i18n/translations';
import { ListBulletIcon, XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

export default function ShopPage() {
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const t = translations[language];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const params = new URLSearchParams(searchParams?.toString());
      params.set('search', searchTerm.trim());
      router.push(`/shop?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Mobile header with compact buttons */}
        <div className="lg:hidden space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setIsCategoryDrawerOpen(true)}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="flex items-center justify-center">
                <ListBulletIcon className="h-4 w-4 mr-1" />
                {t.shop.categories.title}
              </span>
            </button>
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="flex items-center justify-center">
                <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1" />
                {t.shop.filters.title}
              </span>
            </button>
          </div>

          {/* Mobile search bar */}
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="search"
                name="search"
                placeholder={t.search.placeholder}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar with categories and filters - hidden on mobile */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-sm font-medium text-gray-900 mb-3">{t.shop.categories.title}</h2>
              <CategorySidebar />
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-sm font-medium text-gray-900 mb-3">{t.shop.filters.title}</h2>
              <FilterBar />
            </div>
          </aside>
          
          {/* Main content area */}
          <main className="flex-1">
            <ProductGrid />
          </main>
        </div>
      </div>

      {/* Mobile category drawer */}
      <div
        className={`fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity lg:hidden ${
          isCategoryDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsCategoryDrawerOpen(false)}
      />
      <div
        className={`fixed inset-x-0 bottom-0 transform transition-transform lg:hidden ${
          isCategoryDrawerOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-white rounded-t-xl shadow-lg max-h-[80vh] overflow-y-auto">
          <div className="p-3 sticky top-0 bg-white border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-medium">{t.shop.categories.title}</h2>
            <button
              onClick={() => setIsCategoryDrawerOpen(false)}
              className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="p-3">
            <CategorySidebar />
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <div
        className={`fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity lg:hidden ${
          isFilterDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsFilterDrawerOpen(false)}
      />
      <div
        className={`fixed inset-x-0 bottom-0 transform transition-transform lg:hidden ${
          isFilterDrawerOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-white rounded-t-xl shadow-lg max-h-[85vh] overflow-y-auto">
          <div className="p-4 sticky top-0 bg-white border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium">{t.shop.filters.title}</h2>
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="p-6">
            <FilterBar isMobileDrawer={true} />
          </div>
        </div>
      </div>
    </div>
  );
} 