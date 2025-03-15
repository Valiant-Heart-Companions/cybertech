/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAdminAuth } from '@/providers/AdminAuthProvider';
import { 
  TagIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import PromotionFilters from './PromotionFilters';
import PromotionTable from './PromotionTable';
import CreatePromotionModal from './CreatePromotionModal';

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

export default function PromotionsPage() {
  const { isLoading: authLoading, isAdmin, isManager } = useAdminAuth();
  const searchParams = useSearchParams();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Get filter values from URL
  const page = searchParams?.get('page') ? parseInt(searchParams.get('page')!) : 1;
  const limit = searchParams?.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
  const status = searchParams?.get('status') || '';
  const type = searchParams?.get('type') || '';
  const search = searchParams?.get('search') || '';
  const sortBy = searchParams?.get('sortBy') || 'created_at';
  const sortOrder = searchParams?.get('sortOrder') || 'desc';

  useEffect(() => {
    const fetchPromotions = async () => {
      if (authLoading) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Build query string
        const queryParams = new URLSearchParams();
        queryParams.set('page', page.toString());
        queryParams.set('limit', limit.toString());
        if (status) queryParams.set('status', status);
        if (type) queryParams.set('type', type);
        if (search) queryParams.set('search', search);
        queryParams.set('sortBy', sortBy);
        queryParams.set('sortOrder', sortOrder);
        
        const response = await fetch(`/api/admin/promotions?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch promotions');
        }
        
        const data = await response.json();
        setPromotions(data.promotions);
        setPagination(data.pagination);
      } catch (err: any) {
        console.error('Error fetching promotions:', err);
        setError(err.message || 'Error fetching promotions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPromotions();
  }, [page, limit, status, type, search, sortBy, sortOrder, authLoading]);

  const handleStatusUpdate = async (promotionId: string, newStatus: string) => {
    // Only admins and managers can update promotion status
    if (!isAdmin && !isManager) {
      alert('No tienes permisos para actualizar el estado de las promociones');
      return;
    }
    
    try {
      const response = await fetch('/api/admin/promotions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: promotionId,
          status: newStatus,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update promotion status');
      }
      
      // Update the promotion in the local state
      setPromotions(promotions.map(promotion => 
        promotion.id === promotionId ? { ...promotion, status: newStatus as any } : promotion
      ));
    } catch (err: any) {
      console.error('Error updating promotion status:', err);
      alert('Error: ' + (err.message || 'Failed to update promotion status'));
    }
  };

  const handleCreatePromotion = async (promotionData: any) => {
    try {
      const response = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promotionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create promotion');
      }
      
      // Refresh the promotions list
      const queryParams = new URLSearchParams();
      queryParams.set('page', '1');
      queryParams.set('limit', limit.toString());
      if (status) queryParams.set('status', status);
      if (type) queryParams.set('type', type);
      if (search) queryParams.set('search', search);
      queryParams.set('sortBy', sortBy);
      queryParams.set('sortOrder', sortOrder);
      
      const refreshResponse = await fetch(`/api/admin/promotions?${queryParams.toString()}`);
      
      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh promotions');
      }
      
      const data = await refreshResponse.json();
      setPromotions(data.promotions);
      setPagination(data.pagination);
      
      // Close the modal
      setIsCreateModalOpen(false);
      
      // Show success message
      alert('Promoción creada exitosamente');
    } catch (err: any) {
      console.error('Error creating promotion:', err);
      alert('Error: ' + (err.message || 'Failed to create promotion'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Promociones</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestiona las promociones, descuentos y cupones para tus productos.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          {(isAdmin || isManager) && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Nueva Promoción
            </button>
          )}
        </div>
      </div>

      <PromotionFilters 
        initialFilters={{
          status,
          type,
          search
        }}
      />
      
      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
              <PromotionTable 
                promotions={promotions} 
                loading={loading} 
                error={error}
                pagination={pagination}
                onStatusUpdate={handleStatusUpdate}
                canUpdateStatus={isAdmin || isManager}
              />
            </div>
          </div>
        </div>
      </div>

      {isCreateModalOpen && (
        <CreatePromotionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreatePromotion}
        />
      )}
    </div>
  );
} 