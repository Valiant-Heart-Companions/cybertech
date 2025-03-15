/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

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
  
  if (!userRole || !['admin', 'manager', 'staff'].includes(userRole.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  const period = searchParams.get('period') || '30d';
  
  try {
    // Calculate date range based on period
    let startDate = new Date();
    const endDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30); // Default to 30 days
    }
    
    // Format dates for PostgreSQL
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();
    
    // Get order stats
    const { data: orderStats, error: orderStatsError } = await supabase.rpc('admin_get_order_stats', {
      p_start_date: startDateStr,
      p_end_date: endDateStr
    });
    
    if (orderStatsError) {
      console.error('Error fetching order stats:', orderStatsError);
      return NextResponse.json({ error: 'Failed to fetch order statistics' }, { status: 500 });
    }
    
    // Get top selling products
    const { data: topProducts, error: topProductsError } = await supabase.rpc('admin_get_top_products', {
      p_limit: 10,
      p_start_date: startDateStr,
      p_end_date: endDateStr
    });
    
    if (topProductsError) {
      console.error('Error fetching top products:', topProductsError);
      return NextResponse.json({ error: 'Failed to fetch top products' }, { status: 500 });
    }
    
    // Get low stock products
    const { data: lowStockProducts, error: lowStockError } = await supabase
      .from('admin_inventory_view')
      .select('product_id, product_name, sku, current_stock')
      .lt('current_stock', 10)
      .gt('current_stock', 0)
      .order('current_stock', { ascending: true })
      .limit(10);
    
    if (lowStockError) {
      console.error('Error fetching low stock products:', lowStockError);
      return NextResponse.json({ error: 'Failed to fetch low stock products' }, { status: 500 });
    }
    
    // Get out of stock products count
    const { count: outOfStockCount, error: outOfStockError } = await supabase
      .from('admin_inventory_view')
      .select('product_id', { count: 'exact', head: true })
      .lte('current_stock', 0);
    
    if (outOfStockError) {
      console.error('Error fetching out of stock count:', outOfStockError);
      return NextResponse.json({ error: 'Failed to fetch out of stock count' }, { status: 500 });
    }
    
    // Get recent orders
    const { data: recentOrders, error: recentOrdersError } = await supabase
      .from('admin_orders_view')
      .select('order_id, created_at, status, total_amount, customer_email')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentOrdersError) {
      console.error('Error fetching recent orders:', recentOrdersError);
      return NextResponse.json({ error: 'Failed to fetch recent orders' }, { status: 500 });
    }
    
    // Return all the statistics
    return NextResponse.json({
      orderStats: orderStats[0],
      topProducts,
      lowStockProducts,
      outOfStockCount,
      recentOrders,
      period
    });
  } catch (error) {
    console.error('Error in stats API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 