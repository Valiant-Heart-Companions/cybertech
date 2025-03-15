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
  
  if (!userRole || !['admin', 'manager'].includes(userRole.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Get query parameters
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  
  // Calculate offset
  const offset = (page - 1) * limit;
  
  try {
    // Build the query
    let query = supabase.from('promotions').select('*', { count: 'exact' });
    
    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (type) {
      query = query.eq('promotion_type', type);
    }
    
    if (search) {
      query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // Apply sorting
    query = query.order(sortBy as any, { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute the query
    const { data: promotions, count, error } = await query;
    
    if (error) {
      console.error('Error fetching promotions:', error);
      return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 });
    }
    
    // Return the data with pagination info
    return NextResponse.json({
      promotions,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in promotions API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Create a new promotion
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
    const {
      code,
      name,
      description,
      promotion_type,
      discount_value,
      discount_unit,
      minimum_purchase,
      maximum_discount,
      starts_at,
      expires_at,
      usage_limit,
      applicable_products,
      excluded_products,
      status
    } = await request.json();
    
    // Validate required fields
    if (!code || !name || !promotion_type || !discount_value || !discount_unit) {
      return NextResponse.json({ 
        error: 'Missing required fields: code, name, promotion_type, discount_value, discount_unit' 
      }, { status: 400 });
    }
    
    // Check if code already exists
    const { data: existingPromo, error: checkError } = await supabase
      .from('promotions')
      .select('id')
      .eq('code', code)
      .maybeSingle();
    
    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }
    
    if (existingPromo) {
      return NextResponse.json({ error: 'Promotion code already exists' }, { status: 400 });
    }
    
    // Create promotion
    const { data: newPromotion, error } = await supabase
      .from('promotions')
      .insert({
        code,
        name,
        description,
        promotion_type,
        discount_value,
        discount_unit,
        minimum_purchase: minimum_purchase || null,
        maximum_discount: maximum_discount || null,
        starts_at: starts_at || new Date().toISOString(),
        expires_at: expires_at || null,
        usage_limit: usage_limit || null,
        applicable_products: applicable_products || null,
        excluded_products: excluded_products || null,
        status: status || 'active',
        created_by: session.user.id
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Log the creation in the audit log
    await supabase.from('admin_audit_log').insert({
      user_id: session.user.id,
      action: 'create_promotion',
      table_name: 'promotions',
      record_id: newPromotion.id,
      old_data: null,
      new_data: newPromotion
    });
    
    return NextResponse.json({ 
      success: true,
      promotion: newPromotion
    });
  } catch (error) {
    console.error('Error creating promotion:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Update a promotion
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
    const { id, ...updateData } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Promotion ID is required' }, { status: 400 });
    }
    
    // Check if promotion exists
    const { data: existingPromo, error: fetchError } = await supabase
      .from('promotions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }
    
    // If code is being updated, check if it already exists
    if (updateData.code && updateData.code !== existingPromo.code) {
      const { data: codeExists, error: checkError } = await supabase
        .from('promotions')
        .select('id')
        .eq('code', updateData.code)
        .neq('id', id)
        .maybeSingle();
      
      if (checkError) {
        return NextResponse.json({ error: checkError.message }, { status: 500 });
      }
      
      if (codeExists) {
        return NextResponse.json({ error: 'Promotion code already exists' }, { status: 400 });
      }
    }
    
    // Update promotion
    const { data: updatedPromotion, error } = await supabase
      .from('promotions')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Log the update in the audit log
    await supabase.from('admin_audit_log').insert({
      user_id: session.user.id,
      action: 'update_promotion',
      table_name: 'promotions',
      record_id: id,
      old_data: existingPromo,
      new_data: updatedPromotion
    });
    
    return NextResponse.json({ 
      success: true,
      promotion: updatedPromotion
    });
  } catch (error) {
    console.error('Error updating promotion:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 