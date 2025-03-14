'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCart } from './CartContext';
import CartItemComponent from './CartItem';
import Link from 'next/link';
import { useLanguage } from '~/i18n/LanguageContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, totalItems, totalPrice } = useCart();
  const { language } = useLanguage();

  const t = {
    title: language === 'es' ? 'Carrito de Compras' : 'Shopping Cart',
    items: language === 'es' ? 'artículos' : 'items',
    closePanel: language === 'es' ? 'Cerrar panel' : 'Close panel',
    subtotal: language === 'es' ? 'Subtotal' : 'Subtotal',
    shippingNote: language === 'es' 
      ? 'Envío e impuestos calculados al finalizar la compra.' 
      : 'Shipping and taxes calculated at checkout.',
    checkout: language === 'es' ? 'Proceder al Pago' : 'Checkout',
    or: language === 'es' ? 'o' : 'or',
    continueShopping: language === 'es' ? 'Continuar Comprando' : 'Continue Shopping'
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          {t.title} ({totalItems} {t.items})
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={onClose}
                          >
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">{t.closePanel}</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          <ul role="list" className="-my-6 divide-y divide-gray-200">
                            {items.map((item) => (
                              <CartItemComponent key={item.productId} item={item} />
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <p>{t.subtotal}</p>
                        <p>${totalPrice.toFixed(2)}</p>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {t.shippingNote}
                      </p>
                      <div className="mt-6">
                        <Link
                          href="/checkout"
                          onClick={onClose}
                          className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                        >
                          {t.checkout}
                        </Link>
                      </div>
                      <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                        <p>
                          {t.or}{' '}
                          <button
                            type="button"
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                            onClick={onClose}
                          >
                            {t.continueShopping}
                            <span aria-hidden="true"> &rarr;</span>
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 