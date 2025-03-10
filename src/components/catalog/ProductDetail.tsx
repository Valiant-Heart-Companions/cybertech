'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import type { Product } from '~/lib/supabase';

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Convert relative URLs to absolute URLs
  const getAbsoluteImageUrl = (url: string | null): string => {
    if (!url) return '/placeholder.png';
    if (url.startsWith('http')) return url;
    return `https://www.cecomsa.com${url}`;
  };

  const images = (product.images?.map(getAbsoluteImageUrl) || 
    (product.image_url ? [getAbsoluteImageUrl(product.image_url)] : []))
    .filter((url): url is string => url !== null);

  useEffect(() => {
    console.log('Product data:', product);
    console.log('Images:', images);
  }, [product, images]);

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-white">
            <Image
              src={images[selectedImageIndex] || getAbsoluteImageUrl(product.image_url)}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={90}
              priority
            />
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden ${
                    selectedImageIndex === index ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} - Imagen ${index + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 25vw"
                    quality={75}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          
          <div className="flex items-center gap-4">
            <p className="text-2xl font-semibold">
              ${product.current_price.toLocaleString()}
            </p>
            {product.list_price && product.list_price > product.current_price && (
              <>
                <p className="text-lg text-gray-500 line-through">
                  ${product.list_price.toLocaleString()}
                </p>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                  {product.discount_percentage}% OFF
                </span>
              </>
            )}
          </div>

          {/* Specifications */}
          {product.specifications && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Especificaciones</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <p className="text-sm text-gray-500 capitalize">{key}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 