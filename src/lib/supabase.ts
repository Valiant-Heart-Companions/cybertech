/* eslint-disable */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Product = {
  id: number;
  name: string;
  sku: string;
  current_price: number;
  list_price: number | null;
  discount_percentage: number | null;
  discount_label: string | null;
  product_url: string | null;
  image_url: string | null;
  specifications: Record<string, any> | null;
  all_specifications: Record<string, any> | null;
  images: string[] | null;
  created_at: string;
  updated_at: string;
}; 