'use client';

import Image from 'next/image';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '~/i18n/LanguageContext';
import { formatCurrency } from '../../utils/formatCurrency';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function OrderSummary() {
  const { items, totalItems, totalPrice } = useCart();
  const { language } = useLanguage();

  const t = {
    title: language === 'es' ? 'Resumen del Pedido' : 'Order Summary',
    items: {
      singular: language === 'es' ? 'artículo' : 'item',
      plural: language === 'es' ? 'artículos' : 'items'
    },
    quantity: language === 'es' ? 'Cantidad' : 'Quantity',
    subtotal: language === 'es' ? 'Subtotal' : 'Subtotal',
    shipping: {
      title: language === 'es' ? 'Envío' : 'Shipping',
      free: language === 'es' ? 'Gratis' : 'Free'
    },
    itbis: language === 'es' ? 'ITBIS (18%)' : 'VAT (18%)',
    total: language === 'es' ? 'Total' : 'Total',
    empty: language === 'es' ? 'No hay artículos en el carrito' : 'No items in cart'
  };

  // Calculate ITBIS (18% VAT in Dominican Republic)
  const subtotal = totalPrice;
  const itbis = subtotal * 0.18;
  const total = subtotal + itbis;

  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        {t.empty}
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="px-4 py-6 sm:px-6">
        <h2 className="text-lg font-medium text-gray-900">
          {t.title} ({totalItems} {totalItems === 1 ? t.items.singular : t.items.plural})
        </h2>

        <div className="mt-6 flow-root">
          <ul role="list" className="-my-6 divide-y divide-gray-200">
            {items.map((item: CartItem) => (
              <li key={item.id} className="flex py-6">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                <div className="ml-4 flex flex-1 flex-col">
                  <div>
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <h3>{item.name}</h3>
                      <p className="ml-4">{formatCurrency(item.price)}</p>
                    </div>
                  </div>
                  <div className="flex flex-1 items-end justify-between text-sm">
                    <p className="text-gray-500">
                      {t.quantity}: {item.quantity}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex justify-between text-base font-medium text-gray-900">
            <p>{t.subtotal}</p>
            <p>{formatCurrency(subtotal)}</p>
          </div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <p>{t.shipping.title}</p>
            <p className="text-green-600">{t.shipping.free}</p>
          </div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <p>{t.itbis}</p>
            <p>{formatCurrency(itbis)}</p>
          </div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <p>{t.total}</p>
            <p>{formatCurrency(total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 