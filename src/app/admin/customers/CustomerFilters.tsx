/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface CustomerFiltersProps {
  initialFilters?: {
    status?: string;
    search?: string;
  };
}

const statusOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'suspended', label: 'Suspendido' },
];

export default function CustomerFilters({ initialFilters = {} }: CustomerFiltersProps) {
  const router = useRouter();
  const pathname = usePathname() || '';
  
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
  const [status, setStatus] = useState(initialFilters.status || '');
  const [isFiltering, setIsFiltering] = useState(false);

  // Apply filters to the URL
  const applyFilters = () => {
    setIsFiltering(true);
    
    const params = new URLSearchParams();
    params.set('page', '1'); // Reset to first page on filter change
    
    if (searchTerm) params.set('search', searchTerm);
    if (status) params.set('status', status);
    
    router.push(`${pathname}?${params.toString()}`);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatus('');
    
    router.push(pathname);
  };

  // Debounce search to avoid too many URL updates
  useEffect(() => {
    if (!isFiltering) return;
    
    const debounceTimeout = setTimeout(() => {
      applyFilters();
    }, 500);
    
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, status]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Filtros</h2>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Buscar cliente
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              name="search"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Nombre, email o teléfono"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Estado
          </label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end space-x-3">
        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Limpiar
        </button>
        <button
          type="button"
          onClick={() => {
            setIsFiltering(true);
            applyFilters();
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
} 