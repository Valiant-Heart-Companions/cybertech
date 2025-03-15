/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { SupabaseClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const searchParams = request.nextUrl.searchParams;
  
  // Check if the user is authenticated and has admin access
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .single();
  
  if (!userRole || !['admin', 'manager'].includes(userRole.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Get query parameters
  const reportType = searchParams.get('type') || 'sales';
  const period = searchParams.get('period') || '30days';
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  try {
    let data;
    
    // Calculate date range based on period
    const now = new Date();
    let periodStartDate = new Date();
    let periodEndDate = new Date();
    
    if (startDate && endDate) {
      // Use custom date range if provided
      periodStartDate = new Date(startDate);
      periodEndDate = new Date(endDate);
    } else {
      // Calculate date range based on period
      switch (period) {
        case '7days':
          periodStartDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          periodStartDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          periodStartDate.setDate(now.getDate() - 90);
          break;
        case '12months':
          periodStartDate.setMonth(now.getMonth() - 12);
          break;
        case 'year':
          periodStartDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
          break;
        default:
          periodStartDate.setDate(now.getDate() - 30);
      }
    }
    
    // Format dates for SQL queries
    const formattedStartDate = periodStartDate.toISOString();
    const formattedEndDate = periodEndDate.toISOString();
    
    // Fetch report data based on type
    switch (reportType) {
      case 'sales':
        data = await getSalesReport(supabase, formattedStartDate, formattedEndDate);
        break;
      case 'products':
        data = await getProductsReport(supabase, formattedStartDate, formattedEndDate);
        break;
      case 'customers':
        data = await getCustomersReport(supabase, formattedStartDate, formattedEndDate);
        break;
      case 'inventory':
        data = await getInventoryReport(supabase);
        break;
      default:
        data = await getSalesReport(supabase, formattedStartDate, formattedEndDate);
    }
    
    return NextResponse.json({
      success: true,
      data,
      meta: {
        reportType,
        period,
        startDate: formattedStartDate,
        endDate: formattedEndDate
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper functions for different report types
async function getSalesReport(supabase: SupabaseClient, startDate: string, endDate: string) {
  // Get sales summary
  const { data: salesSummary, error: salesError } = await supabase
    .from('orders')
    .select('status, total_amount')
    .gte('created_at', startDate)
    .lte('created_at', endDate);
  
  if (salesError) throw salesError;
  
  // Get sales by date
  const { data: salesByDate, error: dateError } = await supabase
    .rpc('get_sales_by_date', { 
      start_date: startDate,
      end_date: endDate
    });
  
  if (dateError) throw dateError;
  
  // Get sales by category
  const { data: salesByCategory, error: categoryError } = await supabase
    .rpc('get_sales_by_category', { 
      start_date: startDate,
      end_date: endDate
    });
  
  if (categoryError) throw categoryError;
  
  // Calculate summary metrics
  const totalSales = salesSummary.reduce((sum: number, order: any) => sum + order.total_amount, 0);
  const completedSales = salesSummary
    .filter((order: any) => order.status === 'completed')
    .reduce((sum: number, order: any) => sum + order.total_amount, 0);
  
  const orderCount = salesSummary.length;
  const completedOrderCount = salesSummary.filter((order: any) => order.status === 'completed').length;
  const averageOrderValue = orderCount > 0 ? totalSales / orderCount : 0;
  
  return {
    summary: {
      totalSales,
      completedSales,
      orderCount,
      completedOrderCount,
      averageOrderValue,
      conversionRate: orderCount > 0 ? (completedOrderCount / orderCount) * 100 : 0
    },
    salesByDate: salesByDate || [],
    salesByCategory: salesByCategory || []
  };
}

async function getProductsReport(supabase: SupabaseClient, startDate: string, endDate: string) {
  // Get top selling products
  const { data: topProducts, error: topProductsError } = await supabase
    .rpc('get_top_selling_products', { 
      start_date: startDate,
      end_date: endDate,
      limit_count: 10
    });
  
  if (topProductsError) throw topProductsError;
  
  // Get products with no sales
  const { data: noSalesProducts, error: noSalesError } = await supabase
    .rpc('get_products_with_no_sales', { 
      start_date: startDate,
      end_date: endDate,
      limit_count: 10
    });
  
  if (noSalesError) throw noSalesError;
  
  // Get product performance metrics
  const { data: productMetrics, error: metricsError } = await supabase
    .rpc('get_product_performance_metrics', { 
      start_date: startDate,
      end_date: endDate
    });
  
  if (metricsError) throw metricsError;
  
  return {
    topSellingProducts: topProducts || [],
    productsWithNoSales: noSalesProducts || [],
    productPerformance: productMetrics || []
  };
}

async function getCustomersReport(supabase: SupabaseClient, startDate: string, endDate: string) {
  // Get top customers
  const { data: topCustomers, error: topCustomersError } = await supabase
    .rpc('get_top_customers', { 
      start_date: startDate,
      end_date: endDate,
      limit_count: 10
    });
  
  if (topCustomersError) throw topCustomersError;
  
  // Get new customers
  const { data: newCustomers, error: newCustomersError } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, created_at')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (newCustomersError) throw newCustomersError;
  
  // Get customer retention metrics
  const { data: retentionMetrics, error: retentionError } = await supabase
    .rpc('get_customer_retention_metrics', { 
      start_date: startDate,
      end_date: endDate
    });
  
  if (retentionError) throw retentionError;
  
  // Get customer acquisition metrics
  const { data: acquisitionData, error: acquisitionError } = await supabase
    .rpc('get_customer_acquisition_by_date', { 
      start_date: startDate,
      end_date: endDate
    });
  
  if (acquisitionError) throw acquisitionError;
  
  return {
    topCustomers: topCustomers || [],
    newCustomers: newCustomers || [],
    retentionMetrics: retentionMetrics || [],
    customerAcquisition: acquisitionData || []
  };
}

async function getInventoryReport(supabase: SupabaseClient) {
  // Get low stock products
  const { data: lowStockProducts, error: lowStockError } = await supabase
    .from('products')
    .select('id, name, inventory_count, category_id')
    .lt('inventory_count', 10)
    .gt('inventory_count', 0)
    .order('inventory_count', { ascending: true })
    .limit(20);
  
  if (lowStockError) throw lowStockError;
  
  // Get out of stock products
  const { data: outOfStockProducts, error: outOfStockError } = await supabase
    .from('products')
    .select('id, name, inventory_count, category_id')
    .eq('inventory_count', 0)
    .limit(20);
  
  if (outOfStockError) throw outOfStockError;
  
  // Get inventory value
  const { data: inventoryValue, error: valueError } = await supabase
    .rpc('get_total_inventory_value');
  
  if (valueError) throw valueError;
  
  // Get inventory by category
  const { data: inventoryByCategory, error: categoryError } = await supabase
    .rpc('get_inventory_by_category');
  
  if (categoryError) throw categoryError;
  
  return {
    lowStockProducts: lowStockProducts || [],
    outOfStockProducts: outOfStockProducts || [],
    inventoryValue: inventoryValue || { total_value: 0 },
    inventoryByCategory: inventoryByCategory || []
  };
} 