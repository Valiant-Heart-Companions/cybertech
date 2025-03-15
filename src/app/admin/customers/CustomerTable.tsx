/* eslint-disable */
'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';

interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  status: 'active' | 'inactive' | 'suspended';
  marketing_preferences: string[];
  created_at: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface CustomerTableProps {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  onStatusUpdate: (userId: string, newStatus: string) => void;
  canUpdateStatus: boolean;
}

const statusStyles = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800',
};

const statusTranslations = {
  active: 'Activo',
  inactive: 'Inactivo',
  suspended: 'Suspendido',
};

export default function CustomerTable({ 
  customers, 
  loading, 
  error, 
  pagination,
  onStatusUpdate,
  canUpdateStatus
}: CustomerTableProps) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-gray-600">Cargando clientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-md">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-900">No hay clientes</h3>
        <p className="mt-1 text-sm text-gray-500">
          No se encontraron clientes con los filtros actuales.
        </p>
      </div>
    );
  }

  return (
    <div>
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
            >
              Cliente
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Contacto
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Fecha Registro
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Pedidos
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Total Gastado
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Estado
            </th>
            <th
              scope="col"
              className="relative py-3.5 pl-3 pr-4 sm:pr-6"
            >
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {customers.map((customer) => (
            <tr key={customer.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {customer.first_name.charAt(0)}{customer.last_name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="font-medium text-gray-900">
                      {customer.first_name} {customer.last_name}
                    </div>
                    <div className="text-gray-500">{customer.email}</div>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <div className="flex items-center">
                  {customer.phone_number ? (
                    <>
                      <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{customer.phone_number}</span>
                    </>
                  ) : (
                    <span className="text-gray-400">No registrado</span>
                  )}
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {format(new Date(customer.created_at), "d 'de' MMMM, yyyy", { locale: es })}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {customer.total_orders > 0 ? (
                  <Link 
                    href={`/admin/orders?search=${customer.email}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    {customer.total_orders} pedidos
                  </Link>
                ) : (
                  '0 pedidos'
                )}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <div className="font-medium">
                  ${customer.total_spent.toFixed(2)}
                </div>
                {customer.last_order_date && (
                  <div className="text-xs text-gray-400">
                    Último: {format(new Date(customer.last_order_date), "dd/MM/yyyy")}
                  </div>
                )}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {canUpdateStatus ? (
                  <select
                    value={customer.status}
                    onChange={(e) => onStatusUpdate(customer.id, e.target.value)}
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      statusStyles[customer.status]
                    }`}
                  >
                    {Object.entries(statusTranslations).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 ${
                    statusStyles[customer.status]
                  }`}>
                    {statusTranslations[customer.status]}
                  </span>
                )}
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <Link
                  href={`/admin/customers/${customer.id}`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Ver perfil
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between sm:px-6">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> a{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              de <span className="font-medium">{pagination.total}</span> resultados
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                  pagination.page === 1 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Anterior</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === pagination.totalPages || 
                  Math.abs(page - pagination.page) <= 1
                )
                .map((page, index, array) => {
                  const prevPage = array[index - 1];
                  // Add ellipsis if there's a gap
                  if (prevPage && page - prevPage > 1) {
                    return [
                      <span key={`ellipsis-${page}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>,
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                          page === pagination.page
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ];
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        page === pagination.page
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                  pagination.page === pagination.totalPages 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Siguiente</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
} 