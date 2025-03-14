'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/providers/AdminAuthProvider';
import {
  HomeIcon,
  ShoppingCartIcon,
  UsersIcon,
  TagIcon,
  ArchiveBoxIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

type AdminRole = 'admin' | 'manager' | 'staff';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon, requiredRole: 'staff' },
  { name: 'Pedidos', href: '/admin/orders', icon: ShoppingCartIcon, requiredRole: 'staff' },
  { name: 'Clientes', href: '/admin/customers', icon: UsersIcon, requiredRole: 'staff' },
  { name: 'Inventario', href: '/admin/inventory', icon: ArchiveBoxIcon, requiredRole: 'staff' },
  { name: 'Promociones', href: '/admin/promotions', icon: TagIcon, requiredRole: 'manager' },
  { name: 'Reportes', href: '/admin/reports', icon: ChartBarIcon, requiredRole: 'manager' },
  { name: 'Auditoría', href: '/admin/audit', icon: ClipboardDocumentListIcon, requiredRole: 'admin' },
  { name: 'Configuración', href: '/admin/settings', icon: Cog6ToothIcon, requiredRole: 'admin' },
];

export default function AdminSidebar() {
  const pathname = usePathname() || '';
  const { isAdmin, isManager, isStaff, isLoading } = useAdminAuth();

  // Helper function to check if user has required role
  const hasPermission = (requiredRole: AdminRole): boolean => {
    switch (requiredRole) {
      case 'admin':
        return isAdmin;
      case 'manager':
        return isManager;
      case 'staff':
        return isStaff;
      default:
        return false;
    }
  };

  if (isLoading) {
    return (
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-gray-800">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex-1 px-2 space-y-1 bg-gray-800">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex px-2 py-2 rounded-md">
                    <div className="rounded-md bg-gray-600 h-5 w-5 mr-3"></div>
                    <div className="rounded-md bg-gray-600 h-5 w-32"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-gray-800">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex-1 px-2 space-y-1 bg-gray-800">
              {navigation.map((item) => {
                // Only show links the user has permission to access
                if (!hasPermission(item.requiredRole as AdminRole)) {
                  return null;
                }
                
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <item.icon
                      className={`${
                        isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 