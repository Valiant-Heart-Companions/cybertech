'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import OrdersTable from './OrdersTable';
import OrderFilters from './OrderFilters';
import { useAdminAuth } from '@/providers/AdminAuthProvider';

interface Order {
  order_id: string;
  created_at: string;
  status: string;
  total_amount: number;
  customer_email: string;
  items: any[];
  shipping_address: any;
  billing_address: any;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function OrdersPage() {
  const { isLoading: authLoading } = useAdminAuth();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // Get filter values from URL
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
  const status = searchParams.get('status') || 'all';
  const search = searchParams.get('search') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  useEffect(() => {
    const fetchOrders = async () => {
      if (authLoading) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Build query string
        const queryParams = new URLSearchParams();
        queryParams.set('page', page.toString());
        queryParams.set('limit', limit.toString());
        if (status !== 'all') queryParams.set('status', status);
        if (search) queryParams.set('search', search);
        if (startDate) queryParams.set('startDate', startDate);
        if (endDate) queryParams.set('endDate', endDate);
        queryParams.set('sortBy', sortBy);
        queryParams.set('sortOrder', sortOrder);
        
        const response = await fetch(`/api/admin/orders?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        setOrders(data.orders);
        setPagination(data.pagination);
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Error fetching orders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [page, limit, status, search, startDate, endDate, sortBy, sortOrder, authLoading]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      // Update the order in the local state
      setOrders(orders.map(order => 
        order.order_id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err: any) {
      console.error('Error updating order status:', err);
      alert('Error: ' + (err.message || 'Failed to update order status'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Pedidos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todos los pedidos con detalles del cliente y estado del pedido.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Exportar Pedidos
          </button>
        </div>
      </div>

      <OrderFilters 
        initialFilters={{
          status,
          search,
          startDate,
          endDate
        }}
      />
      
      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
              <OrdersTable 
                orders={orders} 
                loading={loading} 
                error={error}
                pagination={pagination}
                onStatusUpdate={handleStatusUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 