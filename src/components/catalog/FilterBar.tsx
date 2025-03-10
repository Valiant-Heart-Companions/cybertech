'use client';

import { useState } from 'react';

export default function FilterBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-white border rounded-lg shadow-sm"
      >
        <span className="font-medium">Filters</span>
        <svg
          className={`w-4 h-4 transform transition-transform ${
            isOpen ? 'rotate-180' : ''
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

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg p-4 z-50">
          <div className="space-y-4">
            {/* Price Range */}
            <div>
              <h3 className="font-medium mb-2">Price Range</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-24 px-2 py-1 border rounded"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-24 px-2 py-1 border rounded"
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <h3 className="font-medium mb-2">Minimum Rating</h3>
              <select className="w-full px-2 py-1 border rounded">
                <option value="">Any</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>

            {/* Availability */}
            <div>
              <h3 className="font-medium mb-2">Availability</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  In Stock
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Out of Stock
                </label>
              </div>
            </div>

            {/* Apply Button */}
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 