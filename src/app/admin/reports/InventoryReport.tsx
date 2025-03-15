/* eslint-disable */
'use client';

import { useMemo } from 'react';
import { 
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface InventoryReportProps {
  data: {
    summary: {
      totalProducts: number;
      totalStockValue: number;
      lowStockCount: number;
      outOfStockCount: number;
      averageStockLevel: number;
      stockTurnoverRate: number;
    };
    inventoryByCategory: Array<{
      category_name: string;
      product_count: number;
      total_stock: number;
      stock_value: number;
    }>;
    lowStockProducts: Array<{
      product_id: number;
      product_name: string;
      current_stock: number;
      reorder_level: number;
      price: number;
      stock_value: number;
      category_name: string;
    }>;
    stockMovement: Array<{
      date: string;
      incoming: number;
      outgoing: number;
      net_change: number;
    }>;
  };
}

export default function InventoryReport({ data }: InventoryReportProps) {
  const { summary, inventoryByCategory, lowStockProducts, stockMovement } = data;
  
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
    if (!inventoryByCategory || inventoryByCategory.length === 0) return [];
    
    const totalStockValue = inventoryByCategory.reduce((sum, cat) => sum + cat.stock_value, 0);
    
    return inventoryByCategory.map(category => ({
      ...category,
      percentage: totalStockValue > 0 ? (category.stock_value / totalStockValue) * 100 : 0
    }));
  }, [inventoryByCategory]);
  
  // Generate random colors for categories
  const getCategoryColor = (index: number) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    return colors[index % colors.length];
  };

  // Calculate max value for chart scaling
  const maxStockMovement = useMemo(() => {
    if (!stockMovement || stockMovement.length === 0) return 100;
    
    const maxIncoming = Math.max(...stockMovement.map(day => day.incoming));
    const maxOutgoing = Math.max(...stockMovement.map(day => day.outgoing));
    
    return Math.max(maxIncoming, maxOutgoing) * 1.1;
  }, [stockMovement]);

  if (!summary) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-900">No hay datos disponibles</h3>
        <p className="mt-1 text-sm text-gray-500">
          No se encontraron datos de inventario para el período seleccionado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-900">Reporte de Inventario</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArchiveBoxIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Valor del Inventario</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {formatCurrency(summary.totalStockValue)}
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
                <ArchiveBoxIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Nivel Promedio de Stock</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {summary.averageStockLevel.toFixed(1)} unidades
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
                <ArrowTrendingUpIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Tasa de Rotación</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {summary.stockTurnoverRate.toFixed(2)}x
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
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" aria-hidden="true" />
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
                <ExclamationTriangleIcon className="h-6 w-6 text-red-500" aria-hidden="true" />
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

      {/* Stock Movement Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Movimiento de Inventario</h3>
        
        {stockMovement && stockMovement.length > 0 ? (
          <div className="h-80">
            <div className="h-full flex items-end space-x-2">
              {stockMovement.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center space-y-1">
                    <div 
                      className="w-full bg-green-500 rounded-t"
                      style={{ 
                        height: `${(day.incoming / maxStockMovement) * 100}%`,
                        minHeight: '4px'
                      }}
                      title={`Entradas: ${day.incoming}`}
                    ></div>
                    <div 
                      className="w-full bg-red-500 rounded-t"
                      style={{ 
                        height: `${(day.outgoing / maxStockMovement) * 100}%`,
                        minHeight: '4px'
                      }}
                      title={`Salidas: ${day.outgoing}`}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                    {day.date}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4 space-x-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Entradas</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Salidas</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No hay datos disponibles para el período seleccionado.</p>
          </div>
        )}
      </div>

      {/* Inventory by Category */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Inventario por Categoría</h3>
        
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
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Stock total: {category.total_stock} unidades</span>
                  <span>Valor: {formatCurrency(category.stock_value)}</span>
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

      {/* Low Stock Products */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Productos con Stock Bajo</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Actual
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nivel de Reorden
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor del Stock
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lowStockProducts && lowStockProducts.length > 0 ? (
                lowStockProducts.map((product, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category_name || 'Sin categoría'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.current_stock === 0 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.current_stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.reorder_level}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(product.stock_value)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay productos con stock bajo para el período seleccionado.
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