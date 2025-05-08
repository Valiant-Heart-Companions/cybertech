'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '~/utils/supabase';

interface ProductFromDB {
  id?: string;
  sku: string;
  name: string;
  description: string | null;
  current_price: number | null;
  list_price: number | null;
  discount_percentage: number | null;
  discount_label: string | null;
  product_url: string | null;
  image_url: string | null;
  category: string | null;
  brand: string | null;
  model: string | null;
  color: string | null;
  material: string | null;
  dimension: string | null;
  weight: string | null;
}

type ProductForm = Omit<ProductFromDB, 'created_at' | 'updated_at' | 'current_price' | 'list_price' | 'discount_percentage'> & {
  current_price: string;
  list_price: string;
  discount_percentage: string;
};

interface EditProductFormProps {
  id: string;
}

export default function EditProductForm({ id }: EditProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProductForm | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);

  useEffect(() => {

    const fetchProduct = async () => {
      const response = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (response.error) {
        setError(response.error.message);
      } else if (response.data) {
        const data = response.data as ProductFromDB;

        const product: ProductForm = {
          id: data.id,
          sku: data.sku ?? '',
          name: data.name ?? '',
          description: data.description ?? '',
          current_price: data.current_price?.toString() ?? '',
          list_price: data.list_price?.toString() ?? '',
          discount_percentage: data.discount_percentage?.toString() ?? '',
          discount_label: data.discount_label ?? '',
          product_url: data.product_url ?? '',
          image_url: data.image_url ?? '',
          category: data.category ?? '',
          brand: data.brand ?? '',
          model: data.model ?? '',
          color: data.color ?? '',
          material: data.material ?? '',
          dimension: data.dimension ?? '',
          weight: data.weight ?? '',
        };

        setForm(product);
      }
    };

    if (id) void fetchProduct();
  }, [id]);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      setError("Debes iniciar sesión para actualizar productos.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from('products')
      .update({
        ...form,
        current_price: parseFloat(form.current_price),
        list_price: parseFloat(form.list_price),
        discount_percentage: parseFloat(form.discount_percentage),
      })
      .eq('id', id);

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push('/admin/products');
    }
  };

  if (!form) return <p className="p-4">Cargando producto...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Editar producto</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {(Object.keys(form) as (keyof ProductForm)[]).map(
          (key) =>
            key !== 'id' && key !== 'category' && (
              <div key={key}>
                <label className="block text-sm font-medium capitalize" htmlFor={key}>
                  {key.replace('_', ' ')}
                </label>
                <input
                  id={key}
                  name={key}
                  type="text"
                  value={form[key] ?? ''}
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
        )}

        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Actualizar producto'}
        </button>
      </form>
    </div>
  );
}
