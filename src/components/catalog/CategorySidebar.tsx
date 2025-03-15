/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '~/lib/supabase';
import { useLanguage } from '~/i18n/LanguageContext';
import { translations } from '~/i18n/translations';

type Category = {
  id: string;
  slug: string;
  name: string;
  parent_id: string | null;
  description: string | null;
  image_url: string | null;
  children?: Category[];
  product_count?: number;
};

type CategoryTree = Category & {
  children: CategoryTree[];
  level: number;
};

export default function CategorySidebar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];
  
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategoryPath, setActiveCategoryPath] = useState<Category[]>([]);

  // Get current category from URL
  const currentCategorySlug = searchParams?.get('category') || '';
  
  // Build the category tree from flat categories
  const buildCategoryTree = (
    categories: Category[],
    parentId: string | null = null,
    level: number = 0
  ): CategoryTree[] => {
    return categories
      .filter(category => category.parent_id === parentId)
      .map(category => {
        const children = buildCategoryTree(categories, category.id, level + 1);
        return {
          ...category,
          children,
          level
        };
      });
  };

  // Find a category and its ancestors by slug
  const findCategoryPathBySlug = (
    slug: string,
    categories: Category[]
  ): Category[] => {
    // Find the category with the given slug
    const category = categories.find(c => c.slug === slug);
    if (!category) return [];

    // If it has no parent, return just this category
    if (!category.parent_id) return [category];

    // Otherwise, find the parent's path and append this category
    const parentPath = findCategoryPathBySlug(
      categories.find(c => c.id === category.parent_id)?.slug || '',
      categories
    );
    return [...parentPath, category];
  };

  useEffect(() => {
    async function fetchCategories() {
      try {
        // First, fetch the categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (categoriesError) {
          throw categoriesError;
        }

        // Initialize categories with count = 0
        const categoriesWithCounts = (categoriesData || []).map((category: Category) => ({
          ...category,
          product_count: 0
        }));

        // Fetch all product_categories to count products per category
        const { data: productCategoriesData, error: productCategoriesError } = await supabase
          .from('product_categories')
          .select('category_id');

        if (productCategoriesError) {
          console.error('Error fetching product categories:', productCategoriesError);
        } else if (productCategoriesData) {
          // Count products for each category
          productCategoriesData.forEach(item => {
            const category = categoriesWithCounts.find(c => c.id === item.category_id);
            if (category) {
              category.product_count = (category.product_count || 0) + 1;
            }
          });
        }

        setCategories(categoriesWithCounts);
        setCategoryTree(buildCategoryTree(categoriesWithCounts));

        // If we have a current category, find its path
        if (currentCategorySlug) {
          const path = findCategoryPathBySlug(currentCategorySlug, categoriesWithCounts);
          setActiveCategoryPath(path);
          
          // Expand all parent categories in the path
          const parentIds = path.slice(0, -1).map(cat => cat.id);
          setExpandedCategories(parentIds);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [currentCategorySlug]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Generate breadcrumbs for the current category
  const renderBreadcrumbs = () => {
    if (activeCategoryPath.length === 0) return null;

    return (
      <div className="mb-4 text-sm">
        <Link href="/shop" className="text-blue-600 hover:underline">
          {t.shop.title}
        </Link>
        {activeCategoryPath.map((category, index) => (
          <span key={category.id}>
            <span className="mx-1 text-gray-500">/</span>
            {index === activeCategoryPath.length - 1 ? (
              <span className="font-medium">{category.name}</span>
            ) : (
              <Link
                href={`/shop?category=${category.slug}`}
                className="text-blue-600 hover:underline"
              >
                {category.name}
              </Link>
            )}
          </span>
        ))}
      </div>
    );
  };

  // Recursively render the category tree
  const renderCategoryTree = (categories: CategoryTree[]) => {
    return categories.map((category) => (
      <div 
        key={category.id}
        className={`${category.level > 0 ? 'ml-' + (category.level * 3) : ''}`}
      >
        <div className="py-1">
          {category.children.length > 0 ? (
            <div className="flex items-center">
              <button
                onClick={() => toggleCategory(category.id)}
                className="p-1 mr-1 text-gray-500 focus:outline-none"
              >
                <svg
                  className={`w-3 h-3 transform transition-transform ${
                    expandedCategories.includes(category.id) ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <Link
                href={`/shop?category=${category.slug}`}
                className={`text-sm hover:text-blue-600 ${
                  currentCategorySlug === category.slug ? 'font-semibold text-blue-600' : ''
                }`}
              >
                {category.name}
                {category.product_count !== undefined && (
                  <span className="ml-1 text-gray-400">({category.product_count})</span>
                )}
              </Link>
            </div>
          ) : (
            <Link
              href={`/shop?category=${category.slug}`}
              className={`text-sm hover:text-blue-600 ml-4 ${
                currentCategorySlug === category.slug ? 'font-semibold text-blue-600' : ''
              }`}
            >
              {category.name}
              {category.product_count !== undefined && (
                <span className="ml-1 text-gray-400">({category.product_count})</span>
              )}
            </Link>
          )}
        </div>

        {expandedCategories.includes(category.id) && category.children.length > 0 && (
          <div className="mt-1">
            {renderCategoryTree(category.children)}
          </div>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-4">{t.shop.categories.title}</h2>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-5 bg-gray-200 rounded w-3/4"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-4">{t.shop.categories.title}</h2>
        <p className="text-red-500">Error loading categories</p>
      </div>
    );
  }

  if (categoryTree.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-4">{t.shop.categories.title}</h2>
        <p className="text-gray-500">No categories found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {currentCategorySlug && renderBreadcrumbs()}
      <h2 className="text-lg font-semibold mb-3">{t.shop.categories.title}</h2>
      <div className="space-y-1">
        <Link
          href="/shop"
          className={`block text-sm py-1 hover:text-blue-600 ${
            !currentCategorySlug ? 'font-semibold text-blue-600' : ''
          }`}
        >
          {t.shop.categories.all}
        </Link>
        {renderCategoryTree(categoryTree)}
      </div>
    </div>
  );
} 