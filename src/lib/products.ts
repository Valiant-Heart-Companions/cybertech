import { supabase } from './supabase';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  current_price: number;
  list_price: number | null;
  discount_percentage: number | null;
  discount_label: string | null;
  product_url: string | null;
  image_url: string | null;
  specifications: Record<string, any> | null;
  all_specifications: Record<string, any> | null;
  images: string[] | null;
  category: string | null;
  brand: string | null;
  model: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  subcategories?: Category[];
}

export async function getFeaturedProducts(limit = 6) {
  // For now, we'll just get the most recently added products
  // Later we can add a sales_count column or featured flag
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }

  return data as Product[];
}

export async function getRootCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .is('parent_id', null)
    .order('name');

  if (error) {
    console.error('Error fetching root categories:', error);
    return [];
  }

  return data as Category[];
}

export async function getCategories() {
  // First, get all categories
  const { data: allCategories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  // Create a map for quick lookup
  const categoryMap = new Map<string, Category>();
  allCategories.forEach(category => {
    categoryMap.set(category.id, { ...category, subcategories: [] });
  });

  // Build the hierarchy
  const rootCategories: Category[] = [];
  allCategories.forEach(category => {
    const categoryWithSubs = categoryMap.get(category.id)!;
    if (category.parent_id === null) {
      rootCategories.push(categoryWithSubs);
    } else {
      const parent = categoryMap.get(category.parent_id);
      if (parent) {
        parent.subcategories!.push(categoryWithSubs);
      }
    }
  });

  return rootCategories;
}

export async function getCategoryWithChildren(categoryId: string) {
  // Get the specified category
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .single();

  if (categoryError || !category) {
    console.error('Error fetching category:', categoryError);
    return null;
  }

  // Get all subcategories
  const { data: subcategories, error: subcategoriesError } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', categoryId)
    .order('name');

  if (subcategoriesError) {
    console.error('Error fetching subcategories:', subcategoriesError);
    return null;
  }

  return {
    ...category,
    subcategories: subcategories
  } as Category;
} 