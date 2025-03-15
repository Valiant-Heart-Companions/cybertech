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
  
  // Get query parameters
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search');
  const stockLevel = searchParams.get('stockLevel'); // 'low', 'out', 'all'
  const sortBy = searchParams.get('sortBy') || 'product_name';
  const sortOrder = searchParams.get('sortOrder') || 'asc';
  
  // Calculate offset for pagination
  const offset = (page - 1) * limit;
  
  try {
    // Build the query
    let query = supabase.from('admin_inventory_view').select('*', { count: 'exact' });
    
    // Apply filters
    if (search) {
      query = query.or(`product_name.ilike.%${search}%,sku.ilike.%${search}%`);
    }
    
    if (stockLevel === 'low') {
      query = query.lt('current_stock', 10).gt('current_stock', 0);
    } else if (stockLevel === 'out') {
      query = query.lte('current_stock', 0);
    }
    
    // Apply sorting
    query = query.order(sortBy as any, { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute the query
    const { data: inventory, count, error } = await query;
    
    if (error) {
      console.error('Error fetching inventory:', error);
      return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
    }
    
    // Return the data with pagination info
    return NextResponse.json({
      inventory,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in inventory API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Add inventory stock
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
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
  
  try {
    const { productId, quantity, notes } = await request.json();
    
    if (!productId || !quantity) {
      return NextResponse.json({ error: 'Product ID and quantity are required' }, { status: 400 });
    }
    
    // Use the admin function to add inventory stock
    const { data, error } = await supabase.rpc('admin_add_inventory_stock', {
      p_product_id: productId,
      p_quantity: quantity,
      p_notes: notes || null
    });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: true,
      transactionId: data
    });
  } catch (error) {
    console.error('Error adding inventory stock:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Adjust inventory
export async function PATCH(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
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
  
  try {
    const { productId, adjustment, notes } = await request.json();
    
    if (!productId || adjustment === undefined) {
      return NextResponse.json({ error: 'Product ID and adjustment value are required' }, { status: 400 });
    }
    
    // Use the admin function to adjust inventory
    const { data, error } = await supabase.rpc('admin_adjust_inventory_stock', {
      p_product_id: productId,
      p_adjustment: adjustment,
      p_notes: notes || null
    });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: true,
      transactionId: data
    });
  } catch (error) {
    console.error('Error adjusting inventory:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 