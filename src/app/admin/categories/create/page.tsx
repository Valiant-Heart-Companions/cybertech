'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '~/utils/supabase';

export default function CreateCategoryPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    parent_id: '',
  });
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    supabase
      .from('categories')
      .select('id, name')
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
        ...form,
        parent_id: form.parent_id === '' ? null : form.parent_id,
      };
      
      const { error } = await supabase
        .from('categories')
        .insert([payload]);

        if (error) {
            console.error(error);
            setFormError('Error al guardar los cambios.');
        } else {
          router.push('/admin/categories');
        }    
   
  };

  if (formError) return <p className="p-4 text-red-600">{formError}</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Crear categoría</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nombre" className="w-full border p-2" />
        <input name="slug" value={form.slug} onChange={handleChange} placeholder="Slug" className="w-full border p-2" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Descripción" className="w-full border p-2" />
        <input name="image_url" value={form.image_url} onChange={handleChange} placeholder="URL de imagen" className="w-full border p-2" />
        <select name="parent_id" value={form.parent_id} onChange={handleChange} className="w-full border p-2">
          <option value="">Sin categoría padre</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Guardar</button>
      </form>
    </div>
  );
}
