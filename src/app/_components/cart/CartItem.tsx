'use client';

import Image from 'next/image';
import { MinusIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCart, CartItem } from './CartContext';
import { useLanguage } from '~/i18n/LanguageContext';

interface CartItemProps {
  item: CartItem;
}

export default function CartItemComponent({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const { language } = useLanguage();

  const t = {
    noImage: language === 'es' ? 'Sin imagen' : 'No image',
    remove: language === 'es' ? 'Eliminar' : 'Remove',
    decreaseQuantity: language === 'es' ? 'Disminuir cantidad' : 'Decrease quantity',
    increaseQuantity: language === 'es' ? 'Aumentar cantidad' : 'Increase quantity'
  };

  return (
    <li className="flex py-6">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            width={96}
            height={96}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="h-full w-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">{t.noImage}</span>
          </div>
        )}
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <h3>{item.name}</h3>
            <p className="ml-4">${item.price.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex flex-1 items-end justify-between text-sm">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              className="rounded-md bg-gray-100 p-1 text-gray-500 hover:bg-gray-200"
              aria-label={t.decreaseQuantity}
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <span className="text-gray-500 min-w-[2rem] text-center">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              className="rounded-md bg-gray-100 p-1 text-gray-500 hover:bg-gray-200"
              aria-label={t.increaseQuantity}
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="flex">
            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="font-medium text-indigo-600 hover:text-indigo-500"
              aria-label={t.remove}
            >
              <XMarkIcon className="h-5 w-5" />
              <span className="sr-only">{t.remove}</span>
            </button>
          </div>
        </div>
      </div>
    </li>
  );
} 