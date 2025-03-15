/* eslint-disable */
import { notFound } from 'next/navigation';
import { supabase } from '~/lib/supabase';
import ProductDetail from '~/components/catalog/ProductDetail';

interface ProductPageProps {
  params: Promise<{
    sku: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { sku } = await params;
  
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('sku', sku)
    .single();

  if (error || !product) {
    notFound();
  }

  return <ProductDetail product={product} />;
} 