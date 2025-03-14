'use client';

import { useMemo } from 'react';
import { 
  UserGroupIcon,
  UserIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';

interface CustomersReportProps {
  data: {
    summary: {
      totalCustomers: number;
      newCustomers: number;
      activeCustomers: number;
      averageOrdersPerCustomer: number;
      averageLifetimeValue: number;
      retentionRate: number;
    };
    customersByDate: Array<{
      date: string;
      new_customers: number;
      active_customers: number;
    }>;
    customerSegments: Array<{
      segment: string;
      count: number;
      total_spent: number;
      average_order_value: number;
    }>;
    topCustomers: Array<{
      customer_id: number;
      email: string;
      name: string;
      total_orders: number;
      total_spent: number;
      average_order_value: number;
      last_order_date: string;
    }>;
  };
}

export default function CustomersReport({ data }: CustomersReportProps) {
  const { summary, customersByDate, customerSegments, topCustomers } = data;
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // Calculate max value for chart scaling
  const maxCustomers = useMemo(() => {
    if (!customersByDate || customersByDate.length === 0) return 100;
    
    const maxNewCustomers = Math.max(...customersByDate.map(day => day.new_customers));
    const maxActiveCustomers = Math.max(...customersByDate.map(day => day.active_customers));
    
    return Math.max(maxNewCustomers, maxActiveCustomers) * 1.1;
  }, [customersByDate]);
  
  // Calculate percentage of total for each segment
  const segmentsWithPercentage = useMemo(() => {
    if (!customerSegments || customerSegments.length === 0) return [];
    
    const totalCustomers = customerSegments.reduce((sum, segment) => sum + segment.count, 0);
    
    return customerSegments.map(segment => ({
      ...segment,
      percentage: totalCustomers > 0 ? (segment.count / totalCustomers) * 100 : 0
    }));
  }, [customerSegments]);
  
  // Generate colors for segments
  const getSegmentColor = (segment: string) => {
    switch (segment.toLowerCase()) {
      case 'new':
      case 'nuevo':
        return 'bg-blue-500';
      case 'active':
      case 'activo':
        return 'bg-green-500';
      case 'loyal':
      case 'leal':
        return 'bg-purple-500';
      case 'at risk':
      case 'en riesgo':
        return 'bg-yellow-500';
      case 'inactive':
      case 'inactivo':
        return 'bg-red-500';
      case 'vip':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!summary) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-900">No hay datos disponibles</h3>
        <p className="mt-1 text-sm text-gray-500">
          No se encontraron datos de clientes para el período seleccionado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-900">Reporte de Clientes</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Clientes</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {summary.totalCustomers}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-6 w-6 text-blue-500" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Clientes Nuevos</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {summary.newCustomers}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Clientes Activos</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {summary.activeCustomers}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCartIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pedidos por Cliente</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {summary.averageOrdersPerCustomer.toFixed(2)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Valor de Vida del Cliente</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {formatCurrency(summary.averageLifetimeValue)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowPathIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Tasa de Retención</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {summary.retentionRate.toFixed(1)}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Clientes por Día</h3>
        
        {customersByDate && customersByDate.length > 0 ? (
          <div className="h-80">
            <div className="h-full flex items-end space-x-2">
              {customersByDate.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center space-y-1">
                    <div 
                      className="w-full bg-blue-500 rounded-t"
                      style={{ 
                        height: `${(day.new_customers / maxCustomers) * 100}%`,
                        minHeight: '4px'
                      }}
                      title={`Nuevos: ${day.new_customers}`}
                    ></div>
                    <div 
                      className="w-full bg-green-500 rounded-t"
                      style={{ 
                        height: `${(day.active_customers / maxCustomers) * 100}%`,
                        minHeight: '4px'
                      }}
                      title={`Activos: ${day.active_customers}`}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                    {format(parseISO(day.date), 'dd/MM')}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4 space-x-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Nuevos Clientes</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Clientes Activos</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No hay datos disponibles para el período seleccionado.</p>
          </div>
        )}
      </div>

      {/* Customer Segments */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Segmentos de Clientes</h3>
        
        {segmentsWithPercentage && segmentsWithPercentage.length > 0 ? (
          <div className="space-y-4">
            {segmentsWithPercentage.map((segment, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${getSegmentColor(segment.segment)} mr-2`}></div>
                    <span className="text-sm font-medium text-gray-700">
                      {segment.segment}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {segment.count} clientes ({Math.round(segment.percentage)}%)
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${getSegmentColor(segment.segment)}`} 
                    style={{ width: `${segment.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Gasto promedio: {formatCurrency(segment.average_order_value)}</span>
                  <span>Gasto total: {formatCurrency(segment.total_spent)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No hay datos disponibles para el período seleccionado.</p>
          </div>
        )}
      </div>

      {/* Top Customers */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Mejores Clientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Pedidos
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gasto Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Promedio
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Pedido
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topCustomers && topCustomers.length > 0 ? (
                topCustomers.map((customer, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.name || customer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.total_orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(customer.total_spent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(customer.average_order_value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(parseISO(customer.last_order_date), 'dd/MM/yyyy')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay datos disponibles para el período seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 