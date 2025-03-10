'use client';

import Link from 'next/link';

interface FeaturedProductsProps {
  title: string;
  viewAll: string;
}

export default function FeaturedProducts({ title, viewAll }: FeaturedProductsProps) {
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200"></div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Product Name</h3>
                <p className="text-gray-600 mb-4">$99.99</p>
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 