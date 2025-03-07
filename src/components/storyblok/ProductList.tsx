'use client';

import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  image: { filename: string; alt: string };
}

interface ProductListProps {
  blok: SbBlokData & {
    title: string;
    products: Product[] | string; // Can be direct array or reference to fetch
    show_prices?: boolean;
    show_cta?: boolean;
    cta_text?: string;
    columns?: number;
    view_all_link?: string;
  };
}

export default function ProductList({ blok }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If products is a string, assume it's a reference to fetch
    if (typeof blok.products === 'string') {
      // In a real implementation, fetch products from API
      // For now, create placeholder data
      setIsLoading(true);
      setTimeout(() => {
        setProducts(
          Array(6).fill(null).map((_, i) => ({
            id: `product-${i}`,
            name: `Product Name ${i + 1}`,
            slug: `product-${i + 1}`,
            price: 99.99,
            sale_price: i % 3 === 0 ? 79.99 : undefined,
            image: {
              filename: 'https://via.placeholder.com/300',
              alt: `Product ${i + 1}`
            }
          }))
        );
        setIsLoading(false);
      }, 500);
    } else {
      // Direct product array
      setProducts(blok.products || []);
      setIsLoading(false);
    }
  }, [blok.products]);

  // Default to 3 columns if not specified
  const columns = blok.columns || 3;
  
  return (
    <div {...storyblokEditable(blok)} className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{blok.title || 'Featured Products'}</h2>
        {blok.view_all_link && (
          <Link href={blok.view_all_link} className="text-blue-600 hover:underline">
            View All
          </Link>
        )}
      </div>
      
      {isLoading ? (
        // Loading skeleton
        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-6`}>
          {Array(columns).fill(null).map((_, i) => (
            <div key={i} className="animate-pulse border rounded-md p-4">
              <div className="bg-gray-200 h-40 mb-4 rounded-md"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        // Actual products
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${columns} gap-6`}>
          {products.map((product) => (
            <div key={product.id} className="border rounded-md p-4 transition-transform hover:shadow-md">
              <Link href={`/product/${product.slug}`} className="block">
                <div className="relative h-40 mb-4 bg-gray-100 rounded-md overflow-hidden">
                  <Image
                    src={product.image.filename}
                    alt={product.image.alt || product.name}
                    fill
                    sizes={`(max-width: 640px) 100vw, (max-width: 768px) 50vw, ${100 / columns}vw`}
                    className="object-contain"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-medium mb-2 text-gray-900">{product.name}</h3>
                {blok.show_prices !== false && (
                  <div className="flex items-center mb-3">
                    {product.sale_price ? (
                      <>
                        <p className="text-gray-400 line-through mr-2">${product.price.toFixed(2)}</p>
                        <p className="text-red-600 font-semibold">${product.sale_price.toFixed(2)}</p>
                      </>
                    ) : (
                      <p className="text-gray-900 font-semibold">${product.price.toFixed(2)}</p>
                    )}
                  </div>
                )}
              </Link>
              {blok.show_cta !== false && (
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md w-full hover:bg-blue-700 transition-colors">
                  {blok.cta_text || 'Add to Cart'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 