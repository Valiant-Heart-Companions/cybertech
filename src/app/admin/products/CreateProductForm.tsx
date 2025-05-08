'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '~/utils/supabase';

type ProductForm = {
  sku: string;
  name: string;
  description: string;
  current_price: string;
  list_price: string;
  discount_percentage: string;
  discount_label: string;
  product_url: string;
  image_url: string;
  category: string;
  brand: string;
  model: string;
  color: string;
  material: string;
  dimension: string;
  weight: string;
};

export default function CreateProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<ProductForm>({
    sku: '',
    name: '',
    description: '',
    current_price: '',
    list_price: '',
    discount_percentage: '',
    discount_label: '',
    product_url: '',
    image_url: '',
    category: '',
    brand: '',
    model: '',
    color: '',
    material: '',
    dimension: '',
    weight: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('slug, name')
        .order('name', { ascending: true });
  
      if (!error && data) {
        setCategories(data);
      }
    };
  
    void fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.from('products').insert([
      {
        ...form,
        current_price: parseFloat(form.current_price),
        list_price: parseFloat(form.list_price),
        discount_percentage: parseFloat(form.discount_percentage),
      },
    ]);

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push('/admin/products');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Crear nuevo producto</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {(Object.keys(form) as (keyof ProductForm)[]).map((key) => (
          key !== 'category' && (
            <div key={key}>
              <label className="block text-sm font-medium capitalize" htmlFor={key}>
                {key.replace('_', ' ')}
              </label>
              <input
                id={key}
                name={key}
                type="text"
                value={form[key]}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
            ) || key === 'category' && (
              <div>
                <label htmlFor="category" className="block text-sm font-medium capitalize">
                  Categoría
                </label>
                <select
                  id="category"
                  name="category"
                  value={form.category ?? ''}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )
        ))}

        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Crear producto'}
        </button>
      </form>
    </div>
  );
}
