'use client';

import { useState } from 'react';
import { useCart } from './CartContext';
import type { CartItem } from './CartContext';
import { ShoppingCartIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '~/i18n/LanguageContext';

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
  className?: string;
}

export default function AddToCartButton({ product, className = '' }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();
  const { language } = useLanguage();

  const t = {
    addToCart: language === 'es' ? 'Agregar al Carrito' : 'Add to Cart',
    added: language === 'es' ? '¡Agregado!' : 'Added!',
    decreaseQuantity: language === 'es' ? 'Disminuir cantidad' : 'Decrease quantity',
    increaseQuantity: language === 'es' ? 'Aumentar cantidad' : 'Increase quantity'
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    const item: CartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image,
    };
    
    addItem(item);
    
    // Reset state
    setQuantity(1);
    
    // Show feedback
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="rounded-md bg-gray-100 p-1 text-gray-500 hover:bg-gray-200"
          aria-label={t.decreaseQuantity}
        >
          <MinusIcon className="h-4 w-4" />
        </button>
        <span className="text-gray-500 min-w-[2rem] text-center">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity(quantity + 1)}
          className="rounded-md bg-gray-100 p-1 text-gray-500 hover:bg-gray-200"
          aria-label={t.increaseQuantity}
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
      
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isAdding}
        className={`flex items-center justify-center space-x-2 px-6 py-3 border border-transparent rounded-md 
          ${isAdding ? 'bg-green-600' : 'bg-indigo-600'} 
          ${isAdding ? 'hover:bg-green-700' : 'hover:bg-indigo-700'} 
          text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
          disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      >
        <ShoppingCartIcon className="h-5 w-5" />
        <span>{isAdding ? t.added : t.addToCart}</span>
      </button>
    </div>
  );
} 