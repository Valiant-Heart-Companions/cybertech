'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '~/utils/supabase';

export default function LogoutButton({ className = '' }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);

    try {
      await supabase.auth.signOut();
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`text-sm font-medium ${loading ? 'opacity-50' : ''} ${className}`}
      disabled={loading}
    >
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  );
} 