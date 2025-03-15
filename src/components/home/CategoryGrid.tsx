/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCategories, type Category } from '~/lib/products';

interface CategoryGridProps {
  title: string;
}

function CategoryCard({ 
  category, 
  isExpanded, 
  onToggle 
}: { 
  category: Category; 
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const hasSubcategories = category.subcategories && category.subcategories.length > 0;
  
  return (
    <div className="flex flex-col">
      <div 
        className={`group flex flex-col justify-between p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-gray-200 cursor-pointer ${isExpanded ? 'border-blue-200' : ''}`}
        onClick={hasSubcategories ? onToggle : undefined}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
              {category.name}
            </h3>
            {category.description && (
              <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                {category.description}
              </p>
            )}
          </div>
          {hasSubcategories && (
            <div className="flex items-center text-sm text-gray-600 ml-4">
              <span className="mr-2">{category.subcategories!.length}</span>
              <svg 
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </div>
        <Link
          href={`/shop?category=${category.slug}`}
          className="mt-4 text-sm text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center"
          onClick={(e) => e.stopPropagation()}
        >
          Ver productos
          <svg 
            className="ml-1 w-4 h-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
      
      {/* Subcategories expansion panel */}
      {hasSubcategories && isExpanded && (
        <div className="mt-2 ml-4 space-y-2 animate-fadeIn">
          {category.subcategories!.map((subCategory) => (
            <Link
              key={subCategory.id}
              href={`/shop?category=${subCategory.slug}`}
              className="block p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="font-medium text-gray-900">{subCategory.name}</div>
              {subCategory.description && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                  {subCategory.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryGrid({ title }: CategoryGridProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadCategories = async () => {
      const dbCategories = await getCategories();
      setCategories(dbCategories);
      setLoading(false);
    };

    loadCategories();
  }, []);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">{title}</h2>
        {loading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-6 bg-gray-100 rounded-lg animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard 
                key={category.id} 
                category={category}
                isExpanded={expandedCategories.has(category.id.toString())}
                onToggle={() => toggleCategory(category.id.toString())}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No hay categorías disponibles
          </div>
        )}
      </div>
    </section>
  );
} 