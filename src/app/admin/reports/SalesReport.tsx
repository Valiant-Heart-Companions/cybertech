'use client';

import { useMemo } from 'react';
import { 
  ArrowDownIcon, 
  ArrowUpIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface SalesReportProps {
  data: {
    summary: {
      totalSales: number;
      completedSales: number;
      orderCount: number;
      completedOrderCount: number;
      averageOrderValue: number;
      conversionRate: number;
    };
    salesByDate: Array<{
      date: string;
      total_sales: number;
      order_count: number;
      average_order_value: number;
    }>;
    salesByCategory: Array<{
      category_name: string;
      total_sales: number;
      order_count: number;
    }>;
  };
}

export default function SalesReport({ data }: SalesReportProps) {
  const { summary, salesByDate, salesByCategory } = data;
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // Calculate max value for chart scaling
  const maxSales = useMemo(() => {
    if (!salesByDate || salesByDate.length === 0) return 1000;
    return Math.max(...salesByDate.map(day => day.total_sales)) * 1.1;
  }, [salesByDate]);
  
  // Calculate percentage of total for each category
  const categoriesWithPercentage = useMemo(() => {
    if (!salesByCategory || salesByCategory.length === 0) return [];
    
    const totalCategorySales = salesByCategory.reduce((sum, cat) => sum + cat.total_sales, 0);
    
    return salesByCategory.map(category => ({
      ...category,
      percentage: totalCategorySales > 0 ? (category.total_sales / totalCategorySales) * 100 : 0
    }));
  }, [salesByCategory]);
  
  // Generate random colors for categories
  const getCategoryColor = (index: number) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    return colors[index % colors.length];
  };

  if (!summary) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-900">No hay datos disponibles</h3>
        <p className="mt-1 text-sm text-gray-500">
          No se encontraron datos de ventas para el período seleccionado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-900">Reporte de Ventas</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Ventas Totales</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {formatCurrency(summary.totalSales)}
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Número de Pedidos</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {summary.orderCount}
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Valor Promedio de Pedido</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {formatCurrency(summary.averageOrderValue)}
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
                <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pedidos Completados</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {summary.completedOrderCount} ({Math.round(summary.conversionRate)}%)
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
                <CurrencyDollarIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Ventas Completadas</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {formatCurrency(summary.completedSales)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ventas por Día</h3>
        
        {salesByDate && salesByDate.length > 0 ? (
          <div className="h-80">
            <div className="h-full flex items-end space-x-2">
              {salesByDate.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-indigo-500 rounded-t"
                    style={{ 
                      height: `${(day.total_sales / maxSales) * 100}%`,
                      minHeight: '4px'
                    }}
                  >
                    <div className="invisible h-0 overflow-hidden">{day.total_sales}</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                    {format(parseISO(day.date), 'dd/MM')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No hay datos disponibles para el período seleccionado.</p>
          </div>
        )}
      </div>

      {/* Sales by Category */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ventas por Categoría</h3>
        
        {categoriesWithPercentage && categoriesWithPercentage.length > 0 ? (
          <div className="space-y-4">
            {categoriesWithPercentage.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(index)} mr-2`}></div>
                    <span className="text-sm font-medium text-gray-700">
                      {category.category_name || 'Sin categoría'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatCurrency(category.total_sales)} ({Math.round(category.percentage)}%)
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${getCategoryColor(index)}`} 
                    style={{ width: `${category.percentage}%` }}
                  ></div>
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

      {/* Sales Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Detalle de Ventas por Día</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ventas Totales
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número de Pedidos
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Promedio
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesByDate && salesByDate.length > 0 ? (
                salesByDate.map((day, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {format(parseISO(day.date), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(day.total_sales)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {day.order_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(day.average_order_value)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
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