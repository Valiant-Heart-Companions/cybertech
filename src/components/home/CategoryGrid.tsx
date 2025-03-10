'use client';

import Link from 'next/link';

interface Category {
  name: string;
  href: string;
  image: string;
}

interface CategoryGridProps {
  title: string;
  categories: Category[];
}

export default function CategoryGrid({ title, categories }: CategoryGridProps) {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative overflow-hidden rounded-lg bg-gray-100"
            >
              <div className="relative h-48">
                <div className="absolute inset-0 bg-gray-200" />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <h3 className="text-xl font-semibold text-white">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 