'use client';

import { useParams } from 'next/navigation';
import EditProductForm from '../../EditProductsForm';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  
  if (!id || typeof id !== 'string') return <p>Producto no encontrado</p>;
  return (
    <div className="p-6">
      <EditProductForm id={id} />
    </div>
  );
}
