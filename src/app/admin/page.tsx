'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/providers/AdminAuthProvider';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
  const { isLoading: authLoading } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/admin/stats?period=${period}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard statistics');
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
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
          </h2>
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
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ingresos Totales
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      ${stats.orderStats.total_revenue.toFixed(2)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        {/* Orders */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCartIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pedidos Totales
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats.orderStats.total_orders}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        {/* Average Order Value */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TagIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Valor Promedio
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      ${stats.orderStats.average_order_value.toFixed(2)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        {/* Out of Stock */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Productos Sin Stock
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats.outOfStockCount}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Orders */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Pedidos Recientes
          </h3>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Ver todos
          </Link>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Pedido
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentOrders.map((order) => (
                  <tr key={order.order_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <Link href={`/admin/orders/${order.order_id}`} className="text-indigo-600 hover:text-indigo-900">
                        {order.order_id.substring(0, 8)}...
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(order.created_at), "d 'de' MMMM", { locale: es })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customer_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${order.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorMap[order.status]}`}>
                        {statusTranslations[order.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Top Products and Low Stock Products - Two columns on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Productos Más Vendidos
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul>
              {stats.topProducts.slice(0, 5).map((product, idx) => (
                <li key={product.product_id} className={idx === 0 ? "" : "border-t border-gray-200"}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {product.product_name}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {product.units_sold} unidades
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          SKU: {product.sku}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          ${product.revenue.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Low Stock Products */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Productos con Stock Bajo
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul>
              {stats.lowStockProducts.slice(0, 5).map((product, idx) => (
                <li key={product.product_id} className={idx === 0 ? "" : "border-t border-gray-200"}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {product.product_name}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.current_stock <= 3 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.current_stock} unidades
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          SKU: {product.sku}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <Link 
                          href={`/admin/inventory?product=${product.product_id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Gestionar stock
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Order Status Summary */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Resumen de Estados de Pedidos
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-800">Pendientes</p>
              <p className="mt-2 text-3xl font-semibold text-yellow-700">
                {stats.orderStats.pending_orders}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-800">Procesando</p>
              <p className="mt-2 text-3xl font-semibold text-blue-700">
                {stats.orderStats.processing_orders}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm font-medium text-green-800">Completados</p>
              <p className="mt-2 text-3xl font-semibold text-green-700">
                {stats.orderStats.completed_orders}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800">Cancelados</p>
              <p className="mt-2 text-3xl font-semibold text-red-700">
                {stats.orderStats.cancelled_orders}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 