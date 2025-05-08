/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '~/utils/supabase';

import {
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationCircleIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UsersIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import DashboardSkeleton from '@/components/admin/DashboardSkeleton';

interface OrderStats {
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  completed_orders: number;
  cancelled_orders: number;
  pending_orders: number;
  processing_orders: number;
}

interface TopProduct {
  product_id: string;
  product_name: string;
  sku: string;
  units_sold: number;
  revenue: number;
}

interface LowStockProduct {
  product_id: string;
  product_name: string;
  sku: string;
  current_stock: number;
}

interface RecentOrder {
  order_id: string;
  created_at: string;
  status: string;
  total_amount: number;
  customer_email: string;
}

interface DashboardStats {
  orderStats: OrderStats;
  topProducts: TopProduct[];
  lowStockProducts: LowStockProduct[];
  outOfStockCount: number;
  recentOrders: RecentOrder[];
  period: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [error, setError] = useState<string | null>(null);

  // Validación de acceso admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user || user.user_metadata?.role !== 'admin') {
        router.replace('/');
        return;
      }

      setAuthLoading(false);
    };

    checkAdmin();
  }, [router]);

  // Obtener estadísticas si es admin
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Unauthorized');
        }
        const response = await fetch(`/api/admin/stats?period=${period}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}` // Enviamos el token manualmente
          },
          credentials: 'include' // Esto es crucial para las cookies
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard statistics!');
        }

        const data = await response.json();
        setStats(data);
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.message || 'Error fetching dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchStats();
    }
  }, [period, authLoading]);

  if (authLoading || loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
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

  if (!stats) {
    return null;
  }

  const statusColorMap: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusTranslations: Record<string, string> = {
    pending: 'Pendiente',
    processing: 'Procesando',
    completed: 'Completado',
    cancelled: 'Cancelado',
  };

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h4 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
          </h4>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="1y">Último año</option>
          </select>
        </div>
      </div>

      {/* ...el resto del contenido queda igual como lo tenías... */}

      {/* Aquí se renderiza el dashboard completo como ya lo tenías definido */}
      {/* Productos, pedidos, resumen, etc. */}
    </div>
  );
}
