/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '~/lib/supabase';
import type { Product } from '~/lib/supabase';
import { useLanguage } from '~/i18n/LanguageContext';
import { translations } from '~/i18n/translations';
import AddToCartButton from '~/app/_components/cart/AddToCartButton';
import { HeartIcon } from '@heroicons/react/24/outline';

export default function ProductGrid() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams?.get('search') || '';
  const categorySlug = searchParams?.get('category') || '';
  const minPrice = searchParams?.get('minPrice') || '';
  const maxPrice = searchParams?.get('maxPrice') || '';
  const inStock = searchParams?.get('inStock') === 'true';
  
  const [sortBy, setSortBy] = useState('featured');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categoryName, setCategoryName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        let categoryId: string | null = null;
        
        // If we have a category slug, get the category ID
        if (categorySlug) {
          const { data: categoryData, error: categoryError } = await supabase
            .from('categories')
            .select('id, name')
            .eq('slug', categorySlug)
            .single();
          
          if (categoryError) {
            console.error('Error fetching category:', categoryError);
          } else if (categoryData) {
            categoryId = categoryData.id;
            setCategoryName(categoryData.name);
          }
        } else {
          setCategoryName('');
        }
        
        // Create a base query to fetch products
        let query = supabase
          .from('products')
          .select('*', { count: 'exact' });

        // Apply category filter if specified
        if (categoryId) {
          // Get product IDs in this category
          const { data: productCategoryData, error: productCategoryError } = await supabase
            .from('product_categories')
            .select('product_id')
            .eq('category_id', categoryId);
          
          if (productCategoryError) {
            console.error('Error fetching product categories:', productCategoryError);
          } else if (productCategoryData && productCategoryData.length > 0) {
            // Extract product IDs and filter the query
            const productIds = productCategoryData.map(item => item.product_id);
            query = query.in('id', productIds);
          } else {
            // No products in this category, return empty result
            setProducts([]);
            setTotalProducts(0);
            setLoading(false);
            return;
          }
        }

        // Apply search filter if specified
        if (searchTerm) {
          query = query.textSearch('name', searchTerm, {
            type: 'websearch',
            config: 'english'
          });
        }

        // Apply price filters if specified
        if (minPrice) {
          query = query.gte('current_price', parseFloat(minPrice));
        }
        
        if (maxPrice) {
          query = query.lte('current_price', parseFloat(maxPrice));
        }
        
        // Apply stock filter if specified
        if (inStock) {
          query = query.gt('inventory_count', 0);
        }

        // Apply sorting
        switch (sortBy) {
          case 'price-asc':
            query = query.order('current_price', { ascending: true });
            break;
          case 'price-desc':
            query = query.order('current_price', { ascending: false });
            break;
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          default:
            // Featured is the default sort
            query = query.order('created_at', { ascending: false });
        }

        // Execute the query
        const { data, error, count } = await query;

        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }

        console.log('Fetched products:', data?.length || 0);
        setProducts(data || []);
        setTotalProducts(count || 0);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [sortBy, searchTerm, categorySlug, minPrice, maxPrice, inStock]);

  const getPageTitle = () => {
    if (categoryName) {
      return categoryName;
    } else if (searchTerm) {
      return `${t.search?.resultsFor || 'Results for'} "${searchTerm}"`;
    } else {
      return t.shop.title;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title and sort options - mobile optimized */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {getPageTitle()}
          </h1>
          <p className="text-sm text-gray-500">
            {totalProducts} {totalProducts === 1 ? t.shop.items.singular : t.shop.items.plural}
          </p>
        </div>
        <div className="flex items-center">
          <label htmlFor="sort-by" className="sr-only">
            {t.shop.sort.label}
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="block w-full sm:w-auto px-4 py-2 border rounded-lg bg-white text-sm"
          >
            <option value="featured">{t.shop.sort.options.featured}</option>
            <option value="price-asc">{t.shop.sort.options.priceAsc}</option>
            <option value="price-desc">{t.shop.sort.options.priceDesc}</option>
            <option value="newest">{t.shop.sort.options.newest}</option>
          </select>
        </div>
      </div>

      {/* No results message */}
      {products.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-lg text-gray-500">{t.shop.noResults}</p>
          {(searchTerm || categorySlug) && (
            <Link href="/shop" className="mt-4 inline-block text-blue-600 hover:underline">
              {t.shop.categories.all}
            </Link>
          )}
        </div>
      )}

      {/* Product grid - single column on mobile */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
            >
              <div className="flex flex-col h-full">
                <Link href={`/shop/${product.sku}`} className="flex flex-col flex-1" title="Ver Detalles">
                  <div className="relative w-full aspect-square">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">{t.shop.noImage}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <div className="flex items-center">
                        <span className="text-base sm:text-lg font-semibold text-gray-900">
                          Bs.{product.current_price.toFixed(2)}
                        </span>
                        {product.list_price && product.list_price > product.current_price && (
                          <span className="text-xs sm:text-sm text-gray-500 line-through ml-2">
                            Bs{product.list_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {product.discount_percentage && (
                        <span className="text-xs sm:text-sm text-red-600 font-medium">
                          {product.discount_percentage}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                <div className="px-3 pb-4 flex space-x-2">
                  <AddToCartButton
                    product={{
                      id: product.id.toString(),
                      name: product.name,
                      price: product.current_price,
                      image: product.image_url || undefined
                    }}
                  />
                  <button
                    type="button"
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                    aria-label="Agregar a lista de deseos"
                    title="Añadir a la lista de deseo"
                    onClick={() => alert('Añadido a favoritos')}
                  >
                    <HeartIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
} 