/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '~/lib/supabase';
import { useLanguage } from '~/i18n/LanguageContext';
import { translations } from '~/i18n/translations';
import type { Language } from '~/i18n/translations';

type Order = {
  id: string;
  created_at: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  items: {
    id: string;
    product: {
      name: string;
      price: number;
    };
    quantity: number;
  }[];
};

type SupabaseOrderResponse = {
  id: string;
  created_at: string;
  status: Order['status'];
  total_amount: number;
  items: {
    id: string;
    quantity: number;
    product: Array<{
      name: string;
      price: number;
    }>;
  }[];
};

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError(t.account.orders.notLoggedIn);
          setLoading(false);
          return;
        }

        const { data, error: supabaseError } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            status,
            total_amount,
            items:order_items (
              id,
              quantity,
              product:products (
                name,
                price
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (supabaseError?.code === 'PGRST116' || supabaseError?.code === 'PGRST200') {
          setOrders([]);
          setLoading(false);
          return;
        }

        if (supabaseError) {
          setError(t.account.orders.fetchError);
          console.error('Error fetching orders:', supabaseError);
          return;
        }

        const formattedOrders: Order[] = ((data || []) as SupabaseOrderResponse[]).map(order => ({
          ...order,
          items: order.items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            product: {
              name: item.product?.[0]?.name || t.account.orders.productNotFound,
              price: item.product?.[0]?.price || 0
            }
          }))
        }));

        setOrders(formattedOrders);
      } catch (err) {
        setError(t.account.orders.unexpectedError);
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [language, t.account.orders.fetchError, t.account.orders.notLoggedIn, t.account.orders.productNotFound, t.account.orders.unexpectedError]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-2">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="text-blue-500 hover:text-blue-700 underline text-sm"
        >
          {t.account.orders.tryAgain}
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">{t.account.orders.noOrders}</div>
        <a
          href="/shop"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {t.account.orders.startShopping}
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">
                {new Date(order.created_at).toLocaleDateString(language === 'es' ? 'es-DO' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-lg font-medium">
                #{order.id.slice(-8).toUpperCase()}
              </p>
            </div>
            <div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${
                  order.status === 'delivered'
                    ? 'bg-green-100 text-green-800'
                    : order.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : order.status === 'shipped'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }
              `}>
                {t.account.orders.status[order.status]}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flow-root">
              <ul className="-my-4 divide-y divide-gray-200">
                {order.items.map((item) => (
                  <li key={item.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <p className="text-sm font-medium text-gray-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Total</p>
                <p>${order.total_amount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 