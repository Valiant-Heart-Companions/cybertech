'use client';

import Link from 'next/link';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCart } from '~/app/_components/cart/CartContext';

export default function CartLink() {
  const { totalItems } = useCart();

  return (
    <Link
      href="/cart"
      className="group -m-2 flex items-center p-2 relative"
      aria-label="Shopping cart"
    >
      <ShoppingCartIcon
        className="h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
        aria-hidden="true"
      />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center">
          <span className="text-xs font-medium text-white">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        </span>
      )}
    </Link>
  );
} 