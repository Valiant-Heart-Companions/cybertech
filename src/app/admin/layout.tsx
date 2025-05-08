'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '~/utils/supabase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.role === 'admin') {
        setIsAdmin(true);
      } else {
        router.push('/');
      }
      setLoading(false);
    };
    void checkAdmin();
  }, [router]);

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header global aquí si quieres mostrarlo */}
      <header className="bg-white shadow p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Zona Admin</h1>
        <nav className="space-x-4">
          <Link href="/admin/products" className="text-blue-600 hover:underline">Productos</Link>
          <Link href="/admin/categories" className="text-blue-600 hover:underline">Categorías</Link>
          <Link href="/admin/orders" className="text-blue-600 hover:underline">Órdenes</Link>
        </nav>
      </header>

      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
