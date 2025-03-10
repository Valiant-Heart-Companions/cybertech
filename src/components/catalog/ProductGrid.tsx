'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '~/lib/supabase';
import type { Product } from '~/lib/supabase';

export default function ProductGrid() {
  const [sortBy, setSortBy] = useState('featured');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        console.log('Fetching products from Supabase...');
        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 10) + '...');

        // Test the connection first
        const { data: testData, error: testError } = await supabase
          .from('products')
          .select('count')
          .limit(1);

        if (testError) {
          console.error('Supabase connection test failed:', testError);
          throw testError;
        }

        console.log('Supabase connection test successful');

        let query = supabase
          .from('products')
          .select('*');

        // Apply sorting
        switch (sortBy) {
          case 'price-asc':
            query = query.order('current_price', { ascending: true });
            break;
          case 'price-desc':
            query = query.order('current_price', { ascending: false });
            break;
          case 'rating':
            // We'll implement rating sorting later
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }

        console.log('Fetched products:', data?.length || 0);
        setProducts(data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [sortBy]);

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
    <div>
      {/* Sort options */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Products</h1>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white"
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/shop/${product.sku}`}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="relative aspect-square">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {product.name}
              </h3>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {product.discount_percentage && (
                    <span className="text-sm text-red-600 font-medium mr-2">
                      {product.discount_percentage}% OFF
                    </span>
                  )}
                  <span className="text-lg font-semibold text-gray-900">
                    ${product.current_price.toFixed(2)}
                  </span>
                  {product.list_price && product.list_price > product.current_price && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      ${product.list_price.toFixed(2)}
                    </span>
                  )}
                </div>
                {product.discount_label && (
                  <span className="text-sm text-red-600 font-medium">
                    {product.discount_label}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                SKU: {product.sku}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 