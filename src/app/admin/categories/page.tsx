'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '~/utils/supabase';

export default function CategoriesPage() {
    interface Category {
        id: number;
        name: string;
        slug: string;
        parent_id: number | null;
    }   
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('id, name, slug, parent_id').order('created_at', { ascending: false });
      if (!error) setCategories(data || []);
      setLoading(false);
    };
    void fetchCategories();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Categorías</h2>
        <Link href="/admin/categories/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Crear categoría</Link>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="w-full table-auto border">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Nombre</th>
              <th className="p-2">Slug</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-t">
                <td className="p-2">{cat.name}</td>
                <td className="p-2">{cat.slug}</td>
                <td className="p-2">
                  <Link href={`/admin/categories/edit/${cat.id}`} className="text-blue-600 hover:underline">Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
