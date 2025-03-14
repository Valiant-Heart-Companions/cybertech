'use client';

import { useCart } from '../_components/cart/CartContext';
import CartItemComponent from '../_components/cart/CartItem';
import Link from 'next/link';
import { useLanguage } from '~/i18n/LanguageContext';

export default function CartPage() {
  const { items, totalItems, totalPrice } = useCart();
  const { language } = useLanguage();
  const t = {
    emptyCart: {
      title: language === 'es' ? 'Tu carrito está vacío' : 'Your cart is empty',
      message: language === 'es' ? 'Agrega algunos productos a tu carrito para comenzar.' : 'Add some items to your cart to get started.',
      browseButton: language === 'es' ? 'Ver Productos' : 'Browse Products'
    },
    cart: {
      title: language === 'es' ? 'Carrito de Compras' : 'Shopping Cart',
      summary: language === 'es' ? 'Resumen del pedido' : 'Order summary',
      subtotal: language === 'es' ? 'Subtotal' : 'Subtotal',
      items: language === 'es' ? 'productos' : 'items',
      total: language === 'es' ? 'Total del pedido' : 'Order total',
      checkout: language === 'es' ? 'Proceder al Pago' : 'Proceed to Checkout'
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-semibold mb-4">{t.emptyCart.title}</h1>
        <p className="text-gray-600 mb-8">{t.emptyCart.message}</p>
        <Link
          href="/shop"
          className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
        >
          {t.emptyCart.browseButton}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6 lg:max-w-7xl lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">
        {t.cart.title}
      </h1>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        <div className="lg:col-span-7">
          <ul role="list" className="divide-y divide-gray-200">
            {items.map((item) => (
              <CartItemComponent key={item.productId} item={item} />
            ))}
          </ul>
        </div>

        <div className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
          <h2 className="text-lg font-medium text-gray-900">{t.cart.summary}</h2>
          
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {t.cart.subtotal} ({totalItems} {t.cart.items})
              </p>
              <p className="text-sm font-medium text-gray-900">${totalPrice.toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <p className="text-base font-medium text-gray-900">{t.cart.total}</p>
              <p className="text-base font-medium text-gray-900">${totalPrice.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href="/checkout"
              className="w-full flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              {t.cart.checkout}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 