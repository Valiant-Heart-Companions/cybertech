'use client';

import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  TagIcon, 
  PencilIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Promotion {
  id: string;
  code: string;
  name: string;
  description: string;
  promotion_type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
  discount_value: number;
  discount_unit: 'percentage' | 'amount';
  minimum_purchase: number | null;
  maximum_discount: number | null;
  starts_at: string;
  expires_at: string | null;
  usage_limit: number | null;
  usage_count: number;
  applicable_products: string[] | null;
  excluded_products: string[] | null;
  status: 'active' | 'inactive' | 'expired';
  created_at: string;
  updated_at: string | null;
  created_by: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PromotionTableProps {
  promotions: Promotion[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  onStatusUpdate: (promotionId: string, newStatus: string) => void;
  canUpdateStatus: boolean;
}

const statusStyles = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  expired: 'bg-red-100 text-red-800',
};

const statusTranslations = {
  active: 'Activo',
  inactive: 'Inactivo',
  expired: 'Expirado',
};

const typeTranslations = {
  percentage: 'Porcentaje',
  fixed_amount: 'Monto fijo',
  free_shipping: 'Envío gratis',
  buy_x_get_y: 'Compra X lleva Y',
};

export default function PromotionTable({ 
  promotions, 
  loading, 
  error, 
  pagination,
  onStatusUpdate,
  canUpdateStatus
}: PromotionTableProps) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const formatDiscount = (promotion: Promotion) => {
    if (promotion.promotion_type === 'percentage') {
      return `${promotion.discount_value}%`;
    } else if (promotion.promotion_type === 'fixed_amount') {
      return `$${promotion.discount_value.toFixed(2)}`;
    } else if (promotion.promotion_type === 'free_shipping') {
      return 'Envío gratis';
    } else if (promotion.promotion_type === 'buy_x_get_y') {
      return `Compra ${promotion.discount_value} lleva Y`;
    }
    return '';
  };

  const getTimeStatus = (promotion: Promotion) => {
    const now = new Date();
    const startsAt = parseISO(promotion.starts_at);
    
    if (isBefore(now, startsAt)) {
      return 'pending';
    }
    
    if (promotion.expires_at) {
      const expiresAt = parseISO(promotion.expires_at);
      if (isAfter(now, expiresAt)) {
        return 'expired';
      }
    }
    
    return 'active';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-gray-600">Cargando promociones...</p>
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

  if (promotions.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-900">No hay promociones</h3>
        <p className="mt-1 text-sm text-gray-500">
          No se encontraron promociones con los filtros actuales.
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
              Código
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Nombre
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Tipo
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Descuento
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Vigencia
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
          {promotions.map((promotion) => {
            const timeStatus = getTimeStatus(promotion);
            
            return (
              <tr key={promotion.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  <div className="flex items-center">
                    <TagIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span>{promotion.code}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <div className="font-medium text-gray-900">{promotion.name}</div>
                  <div className="text-gray-500 truncate max-w-xs">{promotion.description}</div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {typeTranslations[promotion.promotion_type] || promotion.promotion_type}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <div className="font-medium">{formatDiscount(promotion)}</div>
                  {promotion.minimum_purchase && (
                    <div className="text-xs text-gray-400">
                      Mínimo: ${promotion.minimum_purchase.toFixed(2)}
                    </div>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">Desde:</span> {format(parseISO(promotion.starts_at), "dd/MM/yyyy")}
                  </div>
                  {promotion.expires_at && (
                    <div>
                      <span className="font-medium">Hasta:</span> {format(parseISO(promotion.expires_at), "dd/MM/yyyy")}
                    </div>
                  )}
                  {timeStatus === 'pending' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      Pendiente
                    </span>
                  )}
                  {timeStatus === 'expired' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XCircleIcon className="h-3 w-3 mr-1" />
                      Expirado
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {canUpdateStatus ? (
                    <select
                      value={promotion.status}
                      onChange={(e) => onStatusUpdate(promotion.id, e.target.value)}
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        statusStyles[promotion.status]
                      }`}
                    >
                      {Object.entries(statusTranslations).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 ${
                      statusStyles[promotion.status]
                    }`}>
                      {statusTranslations[promotion.status]}
                    </span>
                  )}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <Link
                    href={`/admin/promotions/${promotion.id}`}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Ver
                  </Link>
                  {canUpdateStatus && (
                    <Link
                      href={`/admin/promotions/${promotion.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Editar
                    </Link>
                  )}
                </td>
              </tr>
            );
          })}
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