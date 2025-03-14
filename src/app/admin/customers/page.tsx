'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAdminAuth } from '@/providers/AdminAuthProvider';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  CheckCircleIcon, 
  XCircleIcon 
} from '@heroicons/react/24/outline';
import CustomerFilters from './CustomerFilters';
import CustomerTable from './CustomerTable';

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
  last_order_date: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function CustomersPage() {
  const { isLoading: authLoading, isAdmin, isManager } = useAdminAuth();
  const searchParams = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // Get filter values from URL
  const page = searchParams?.get('page') ? parseInt(searchParams.get('page')!) : 1;
  const limit = searchParams?.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
  const status = searchParams?.get('status') || '';
  const search = searchParams?.get('search') || '';
  const sortBy = searchParams?.get('sortBy') || 'created_at';
  const sortOrder = searchParams?.get('sortOrder') || 'desc';

  useEffect(() => {
    const fetchCustomers = async () => {
      if (authLoading) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Build query string
        const queryParams = new URLSearchParams();
        queryParams.set('page', page.toString());
        queryParams.set('limit', limit.toString());
        if (status) queryParams.set('status', status);
        if (search) queryParams.set('search', search);
        queryParams.set('sortBy', sortBy);
        queryParams.set('sortOrder', sortOrder);
        
        const response = await fetch(`/api/admin/customers?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        
        const data = await response.json();
        setCustomers(data.customers);
        setPagination(data.pagination);
      } catch (err: any) {
        console.error('Error fetching customers:', err);
        setError(err.message || 'Error fetching customers');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomers();
  }, [page, limit, status, search, sortBy, sortOrder, authLoading]);

  const handleStatusUpdate = async (userId: string, newStatus: string) => {
    // Only admins and managers can update customer status
    if (!isAdmin && !isManager) {
      alert('No tienes permisos para actualizar el estado de los clientes');
      return;
    }
    
    try {
      const response = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          status: newStatus,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update customer status');
      }
      
      // Update the customer in the local state
      setCustomers(customers.map(customer => 
        customer.id === userId ? { ...customer, status: newStatus as any } : customer
      ));
    } catch (err: any) {
      console.error('Error updating customer status:', err);
      alert('Error: ' + (err.message || 'Failed to update customer status'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Clientes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todos los clientes registrados en la plataforma.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Exportar Clientes
          </button>
        </div>
      </div>

      <CustomerFilters 
        initialFilters={{
          status,
          search
        }}
      />
      
      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
              <CustomerTable 
                customers={customers} 
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
    </div>
  );
} 