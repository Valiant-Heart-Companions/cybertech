'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '~/utils/supabase';

export default function EditCategoryPage() {
    interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    parent_id: string | null;
    }
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    parent_id: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
        const response = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

    if (response.error || !response.data) {
        setFormError('No se pudo cargar la categoría.');
        return;
      }

        const category = response.data as Category;
        //console.log(category);
      setForm({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description ?? '',
        image_url: category.image_url ?? '',
        parent_id: category.parent_id ?? '',
      });

      const { data: rsponseCategories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name');

      if (categoriesError) {
        setFormError('No se pudo cargar la categoría.');
        return;
      }

      const allCategories = rsponseCategories as Category[];
      setCategories(allCategories || []);
      setLoading(false);
    };

    void fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
        ...form,
        parent_id: form.parent_id === '' ? null : form.parent_id
      };
      
      const { error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', id);
      

    if (error) {
        console.error(error);
        setFormError('Error al guardar los cambios.');
    } else {
      router.push('/admin/categories');
    }
  };

  if (loading) return <p className="p-4">Cargando categoría...</p>;
  if (formError) return <p className="p-4 text-red-600">{formError}</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Editar categoría</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nombre" className="w-full border p-2" />
        <input name="slug" value={form.slug} onChange={handleChange} placeholder="Slug" className="w-full border p-2" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Descripción" className="w-full border p-2" />
        <input name="image_url" value={form.image_url} onChange={handleChange} placeholder="URL de imagen" className="w-full border p-2" />
        <select name="parent_id" value={form.parent_id} onChange={handleChange} className="w-full border p-2">
          <option value="">Sin categoría padre</option>
          {categories
            .filter(cat => cat.id !== id) // Evitar asignarse a sí misma
            .map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
        </select>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
