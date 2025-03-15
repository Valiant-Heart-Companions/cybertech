/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedProducts, type Product } from '~/lib/products';
import { formatCurrency } from '~/utils/format';

interface FeaturedProductsProps {
  title: string;
  viewAll: string;
}

export default function FeaturedProducts({ title, viewAll }: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      const featuredProducts = await getFeaturedProducts(6);
      setProducts(featuredProducts);
      setLoading(false);
    };

    loadProducts();
  }, []);

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <Link
            href="/shop"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {viewAll}
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {loading ? (
            // Loading skeleton
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : (
            products.map((product) => (
              <Link
                href={`/shop/${product.sku}`}
                key={product.id}
                className="group"
              >
                <div className="relative w-full pb-[100%]">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  {product.discount_percentage && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-medium">
                      -{product.discount_percentage}%
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{product.name}</h3>
                  <div className="mb-4">
                    <p className="text-gray-600">
                      {product.list_price && product.list_price > product.current_price && (
                        <span className="line-through text-sm mr-2">
                          {formatCurrency(product.list_price)}
                        </span>
                      )}
                      <span className="text-lg font-semibold text-blue-600">
                        {formatCurrency(product.current_price)}
                      </span>
                    </p>
                  </div>
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Ver Detalles
                  </button>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
} 