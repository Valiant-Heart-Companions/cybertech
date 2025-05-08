// src/actions/get-admin-stats.ts
'use server';

import { createClient } from '@/lib/supabase/server';

export async function getAdminStats(period = '30d') {
  const supabase = createClient();
  
  // 1. Verificar sesión
  const { data: { session }, error: authError } = await supabase.auth.getSession();
  if (authError || !session) throw new Error('Unauthorized');

  // 2. Verificar rol (sin tipos complejos)
  const user = session.user;
  interface UserMetadata {
    app_metadata?: { role?: string };
    user_metadata?: { role?: string };
  }

  const role = (user as UserMetadata).app_metadata?.role ?? (user as UserMetadata).user_metadata?.role;
  if (!role || !['admin', 'manager'].includes(role)) throw new Error('Forbidden');

  // 3. Consulta simple sin RPC (ejemplo básico)
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .limit(5);

  if (error) throw error;

  return {
    products,
    period
  };
}