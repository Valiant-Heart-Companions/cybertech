/* eslint-disable */
'use client';

import { useMemo } from 'react';
import { 
  ShoppingBagIcon,
  CurrencyDollarIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface ProductsReportProps {
  data: {
    summary: {
      totalProducts: number;
      totalSales: number;
      averagePrice: number;
      lowStockCount: number;
      outOfStockCount: number;
    };
    topSellingProducts: Array<{
      product_id: number;
      product_name: string;
      quantity_sold: number;
      total_sales: number;
      average_price: number;
    }>;
    productsByCategory: Array<{
      category_name: string;
      product_count: number;
      total_sales: number;
    }>;
    inventoryStatus: Array<{
      status: string;
      count: number;
    }>;
  };
}

export default function ProductsReport({ data }: ProductsReportProps) {
  const { summary, topSellingProducts, productsByCategory, inventoryStatus } = data;
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // Calculate percentage of total for each category
  const categoriesWithPercentage = useMemo(() => {
    if (!productsByCategory || productsByCategory.length === 0) return [];
    
    const totalProducts = productsByCategory.reduce((sum, cat) => sum + cat.product_count, 0);
    
    return productsByCategory.map(category => ({
      ...category,
      percentage: totalProducts > 0 ? (category.product_count / totalProducts) * 100 : 0
    }));
  }, [productsByCategory]);
  
  // Generate random colors for categories
  const getCategoryColor = (index: number) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    return colors[index % colors.length];
  };

  // Calculate inventory status percentages
  const inventoryStatusWithPercentage = useMemo(() => {
    if (!inventoryStatus || inventoryStatus.length === 0) return [];
    
    const totalCount = inventoryStatus.reduce((sum, status) => sum + status.count, 0);
    
    return inventoryStatus.map(status => ({
      ...status,
      percentage: totalCount > 0 ? (status.count / totalCount) * 100 : 0
    }));
  }, [inventoryStatus]);

  // Get color for inventory status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in stock':
      case 'en stock':
        return 'bg-green-500';
      case 'low stock':
      case 'stock bajo':
        return 'bg-yellow-500';
      case 'out of stock':
      case 'agotado':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!summary) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-900">No hay datos disponibles</h3>
        <p className="mt-1 text-sm text-gray-500">
          No se encontraron datos de productos para el período seleccionado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-900">Reporte de Productos</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBagIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Productos</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {summary.totalProducts}
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
                <TagIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Precio Promedio</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {formatCurrency(summary.averagePrice)}
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
                <ArrowTrendingDownIcon className="h-6 w-6 text-yellow-500" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Productos con Stock Bajo</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {summary.lowStockCount}
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
                <ArrowTrendingDownIcon className="h-6 w-6 text-red-500" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Productos Agotados</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {summary.outOfStockCount}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Status */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Estado del Inventario</h3>
        
        {inventoryStatusWithPercentage && inventoryStatusWithPercentage.length > 0 ? (
          <div className="space-y-4">
            {inventoryStatusWithPercentage.map((status, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status.status)} mr-2`}></div>
                    <span className="text-sm font-medium text-gray-700">
                      {status.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {status.count} ({Math.round(status.percentage)}%)
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${getStatusColor(status.status)}`} 
                    style={{ width: `${status.percentage}%` }}
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

      {/* Products by Category */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Productos por Categoría</h3>
        
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
                    {category.product_count} productos ({Math.round(category.percentage)}%)
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

      {/* Top Selling Products */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Productos Más Vendidos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad Vendida
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ventas Totales
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio Promedio
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topSellingProducts && topSellingProducts.length > 0 ? (
                topSellingProducts.map((product, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.quantity_sold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(product.total_sales)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(product.average_price)}
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