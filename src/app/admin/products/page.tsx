// app/admin/products/page.tsx
'use client';
import Link from 'next/link';

import { useEffect, useState } from 'react';
import { supabase } from '~/utils/supabase';

export default function AdminProducts() {
  interface Product {
    id: number;
    name: string;
    current_price: number;
    brand: string;
    model: string;
  }

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error) setProducts(data || []);
      setLoading(false);
    };
    void fetchProducts();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Productos</h2>
        <Link href="/admin/products/create">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Crear producto
          </button>
        </Link>
      </div>
      {loading ? (
        <p>Cargando productos...</p>
      ) : (
        <table className="w-full border table-auto">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Nombre</th>
              <th className="p-2">Precio</th>
              <th className="p-2">Marca</th>
              <th className="p-2">Modelo</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-t">
                <td className="p-2">{product.name}</td>
                <td className="p-2">${product.current_price}</td>
                <td className="p-2">{product.brand}</td>
                <td className="p-2">{product.model}</td>
                <td className="p-2">
                  <Link
                    href={`/admin/products/edit/${product.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
