'use client';

import { Fragment } from 'react';
import { useAdminAuth } from '@/providers/AdminAuthProvider';
import { Menu, Transition } from '@headlessui/react';
import { UserIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AdminHeader() {
  const { user, role, signOut, isLoading } = useAdminAuth();

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/admin" className="text-xl font-bold text-gray-800">
              Panel de Administración
            </Link>
          </div>
          
          <div className="ml-4 flex items-center">
            {isLoading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-200 h-8 w-8"></div>
              </div>
            ) : user ? (
              <Menu as="div" className="ml-3 relative">
                <div>
                  <Menu.Button className="max-w-xs bg-gray-100 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <span className="sr-only">Abrir menú de usuario</span>
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                      {user.email ? user.email.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />}
                    </div>
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-2">
                      <p className="text-sm text-gray-700">{user.email}</p>
                      <p className="text-xs font-medium text-gray-500 capitalize">{role}</p>
                    </div>
                    <hr />
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={signOut}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } block w-full text-left px-4 py-2 text-sm text-red-700`}
                        >
                          Cerrar sesión
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <Link 
                href="/admin/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 