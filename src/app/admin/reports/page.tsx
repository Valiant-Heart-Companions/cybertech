/* eslint-disable */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAdminAuth } from '@/providers/AdminAuthProvider';
import { 
  ChartBarIcon, 
  ShoppingBagIcon, 
  UserGroupIcon, 
  ArchiveBoxIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { format, subDays, parseISO } from 'date-fns';
import SalesReport from './SalesReport';
import ProductsReport from './ProductsReport';
import CustomersReport from './CustomersReport';
import InventoryReport from './InventoryReport';

const reportTypes = [
  { id: 'sales', name: 'Ventas', icon: ChartBarIcon },
  { id: 'products', name: 'Productos', icon: ShoppingBagIcon },
  { id: 'customers', name: 'Clientes', icon: UserGroupIcon },
  { id: 'inventory', name: 'Inventario', icon: ArchiveBoxIcon },
];

const periodOptions = [
  { id: 'today', name: 'Hoy' },
  { id: 'yesterday', name: 'Ayer' },
  { id: 'last7days', name: 'Últimos 7 días' },
  { id: 'last30days', name: 'Últimos 30 días' },
  { id: 'thisMonth', name: 'Este mes' },
  { id: 'lastMonth', name: 'Mes pasado' },
  { id: 'custom', name: 'Personalizado' },
];

export default function ReportsPage() {
  const { user } = useAdminAuth();
  
  const [activeTab, setActiveTab] = useState('sales');
  const [period, setPeriod] = useState('last7days');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCustomPeriod = useMemo(() => period === 'custom', [period]);

  useEffect(() => {
    if (period === 'custom') return; // Don't fetch automatically for custom period
    fetchReportData();
  }, [activeTab, period]);

  const fetchReportData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let queryParams = new URLSearchParams();
      queryParams.append('type', activeTab);
      queryParams.append('period', period);
      
      if (period === 'custom') {
        queryParams.append('startDate', customDateRange.startDate);
        queryParams.append('endDate', customDateRange.endDate);
      }
      
      const response = await fetch(`/api/admin/reports?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error al obtener los datos: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Error desconocido al cargar los datos');
      }
      
      setReportData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar los datos');
      console.error('Error fetching report data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = () => {
    if (!reportData) return;
    
    let csvContent = '';
    let filename = '';
    
    switch (activeTab) {
      case 'sales':
        csvContent = generateSalesReportCSV(reportData);
        filename = `ventas_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        break;
      case 'products':
        csvContent = generateProductsReportCSV(reportData);
        filename = `productos_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        break;
      case 'customers':
        csvContent = generateCustomersReportCSV(reportData);
        filename = `clientes_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        break;
      case 'inventory':
        csvContent = generateInventoryReportCSV(reportData);
        filename = `inventario_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        break;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateSalesReportCSV = (data: any) => {
    let csv = 'Fecha,Ventas Totales,Número de Pedidos,Valor Promedio\n';
    
    if (data.salesByDate && data.salesByDate.length > 0) {
      data.salesByDate.forEach((day: any) => {
        csv += `${day.date},${day.total_sales},${day.order_count},${day.average_order_value}\n`;
      });
    }
    
    return csv;
  };

  const generateProductsReportCSV = (data: any) => {
    let csv = 'Producto,Cantidad Vendida,Ventas Totales,Precio Promedio\n';
    
    if (data.topSellingProducts && data.topSellingProducts.length > 0) {
      data.topSellingProducts.forEach((product: any) => {
        csv += `"${product.product_name}",${product.quantity_sold},${product.total_sales},${product.average_price}\n`;
      });
    }
    
    return csv;
  };

  const generateCustomersReportCSV = (data: any) => {
    let csv = 'Cliente,Total Pedidos,Gasto Total,Valor Promedio,Último Pedido\n';
    
    if (data.topCustomers && data.topCustomers.length > 0) {
      data.topCustomers.forEach((customer: any) => {
        csv += `"${customer.name || customer.email}",${customer.total_orders},${customer.total_spent},${customer.average_order_value},${customer.last_order_date}\n`;
      });
    }
    
    return csv;
  };

  const generateInventoryReportCSV = (data: any) => {
    let csv = 'Producto,Categoría,Stock Actual,Nivel de Reorden,Precio,Valor del Stock\n';
    
    if (data.lowStockProducts && data.lowStockProducts.length > 0) {
      data.lowStockProducts.forEach((product: any) => {
        csv += `"${product.product_name}","${product.category_name || 'Sin categoría'}",${product.current_stock},${product.reorder_level},${product.price},${product.stock_value}\n`;
      });
    }
    
    return csv;
  };

  const renderReportContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      );
    }

    if (!reportData) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-500">Seleccione un período para ver el reporte.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'sales':
        return <SalesReport data={reportData} />;
      case 'products':
        return <ProductsReport data={reportData} />;
      case 'customers':
        return <CustomersReport data={reportData} />;
      case 'inventory':
        return <InventoryReport data={reportData} />;
      default:
        return null;
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Reportes</h1>
            <p className="mt-1 text-sm text-gray-500">
              Visualice y exporte reportes detallados sobre ventas, productos, clientes e inventario.
            </p>
          </div>
          {reportData && (
            <button
              type="button"
              onClick={handleExportReport}
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowDownTrayIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Exportar CSV
            </button>
          )}
        </div>

        {/* Report Type Tabs */}
        <div className="mt-6">
          <div className="sm:hidden">
            <label htmlFor="report-type" className="sr-only">
              Seleccionar tipo de reporte
            </label>
            <select
              id="report-type"
              name="report-type"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              {reportTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {reportTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setActiveTab(type.id)}
                      className={`
                        ${activeTab === type.id
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                      `}
                    >
                      <Icon className="h-5 w-5 mr-2" aria-hidden="true" />
                      {type.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Period Selection */}
        <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Período</h3>
              <p className="mt-1 text-sm text-gray-500">
                Seleccione el período de tiempo para el reporte.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="period" className="block text-sm font-medium text-gray-700">
                    Período predefinido
                  </label>
                  <select
                    id="period"
                    name="period"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    {periodOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                {isCustomPeriod && (
                  <>
                    <div className="sm:col-span-3">
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                        Fecha de inicio
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        id="startDate"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={customDateRange.startDate}
                        onChange={(e) => setCustomDateRange({ ...customDateRange, startDate: e.target.value })}
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                        Fecha de fin
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        id="endDate"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={customDateRange.endDate}
                        onChange={(e) => setCustomDateRange({ ...customDateRange, endDate: e.target.value })}
                      />
                    </div>
                    <div className="sm:col-span-6">
                      <button
                        type="button"
                        onClick={fetchReportData}
                        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Aplicar rango de fechas
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          {renderReportContent()}
        </div>
      </div>
    </div>
  );
} 