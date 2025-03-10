import { notFound } from 'next/navigation';
import { supabase } from '~/lib/supabase';
import ProductDetail from '~/components/catalog/ProductDetail';

interface ProductPageProps {
  params: {
    sku: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('sku', params.sku)
    .single();

  if (error || !product) {
    notFound();
  }

  return <ProductDetail product={product} />;
} 