'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, usePathname } from 'next/navigation';

type User = {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  firstName?: string;
  lastName?: string;
};

type AdminAuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // If no session and on admin page, redirect to login
          if (pathname?.startsWith('/admin') && pathname !== '/admin/login') {
            router.push('/admin/login');
          }
          setUser(null);
          return;
        }
        
        // Get user profile with role
        const { data: profile, error } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (error || !profile) {
          console.error('Error fetching admin profile:', error);
          setUser(null);
          
          // If on admin page but no profile, redirect to login
          if (pathname?.startsWith('/admin') && pathname !== '/admin/login') {
            router.push('/admin/login');
          }
          return;
        }
        
        // Set user with role
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: profile.role,
          firstName: profile.first_name,
          lastName: profile.last_name
        });
        
        // If user is not admin/manager and trying to access admin pages
        if (
          profile.role !== 'admin' && 
          profile.role !== 'manager' && 
          pathname?.startsWith('/admin') && 
          pathname !== '/admin/login'
        ) {
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Auth provider error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Initial check
    checkUser();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, pathname]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/admin/login');
  };

  const value = {
    user,
    isLoading,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'admin' || user?.role === 'manager',
    isStaff: user?.role === 'admin' || user?.role === 'manager' || user?.role === 'staff',
    signOut
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  
  return context;
} 