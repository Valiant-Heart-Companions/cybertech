'use client';

import { useState } from 'react';

// Temporary mock data - this would typically come from your database
const categories = [
  {
    id: 1,
    name: 'Electronics',
    subcategories: [
      { id: 11, name: 'Laptops', count: 24 },
      { id: 12, name: 'Smartphones', count: 36 },
      { id: 13, name: 'Tablets', count: 18 },
    ],
  },
  {
    id: 2,
    name: 'Audio',
    subcategories: [
      { id: 21, name: 'Headphones', count: 42 },
      { id: 22, name: 'Speakers', count: 28 },
      { id: 23, name: 'Microphones', count: 15 },
    ],
  },
  {
    id: 3,
    name: 'Wearables',
    subcategories: [
      { id: 31, name: 'Smart Watches', count: 32 },
      { id: 32, name: 'Fitness Trackers', count: 25 },
      { id: 33, name: 'VR Headsets', count: 12 },
    ],
  },
];

export default function CategorySidebar() {
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4">Categories</h2>
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id}>
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between py-2 text-left hover:text-blue-600"
            >
              <span className="font-medium">{category.name}</span>
              <svg
                className={`w-4 h-4 transform transition-transform ${
                  expandedCategories.includes(category.id) ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {expandedCategories.includes(category.id) && (
              <div className="ml-4 space-y-2 mt-2">
                {category.subcategories.map((subcategory) => (
                  <a
                    key={subcategory.id}
                    href={`/products/${category.name.toLowerCase()}/${subcategory.name.toLowerCase()}`}
                    className="block text-sm text-gray-600 hover:text-blue-600"
                  >
                    {subcategory.name}
                    <span className="ml-2 text-gray-400">
                      ({subcategory.count})
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 