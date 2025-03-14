import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../CartContext';

describe('CartContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider>{children}</CartProvider>
  );

  const mockItem = {
    productId: '1',
    name: 'Test Product',
    price: 100,
    quantity: 1,
    image: 'test-image.jpg',
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('initializes with empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('loads cart from localStorage on initialization', () => {
    // Set up localStorage with some items
    const savedItems = [mockItem];
    localStorage.setItem('cart', JSON.stringify(savedItems));

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toEqual(savedItems);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalPrice).toBe(100);
  });

  it('adds item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(mockItem);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual(mockItem);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalPrice).toBe(100);
  });

  it('updates quantity when adding existing item', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    // Add item first time
    act(() => {
      result.current.addItem(mockItem);
    });

    // Add same item again
    act(() => {
      result.current.addItem(mockItem);
    });

    expect(result.current.items).toHaveLength(1);
    const firstItem = result.current.items[0];
    expect(firstItem).toBeDefined();
    expect(firstItem!.quantity).toBe(2);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalPrice).toBe(200);
  });

  it('removes item from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    // Add item first
    act(() => {
      result.current.addItem(mockItem);
    });

    // Remove item
    act(() => {
      result.current.removeItem(mockItem.productId);
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('updates item quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    // Add item first
    act(() => {
      result.current.addItem(mockItem);
    });

    // Update quantity
    act(() => {
      result.current.updateQuantity(mockItem.productId, 3);
    });

    const firstItem = result.current.items[0];
    expect(firstItem).toBeDefined();
    expect(firstItem!.quantity).toBe(3);
    expect(result.current.totalItems).toBe(3);
    expect(result.current.totalPrice).toBe(300);
  });

  it('removes item when quantity is set to 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    // Add item first
    act(() => {
      result.current.addItem(mockItem);
    });

    // Set quantity to 0
    act(() => {
      result.current.updateQuantity(mockItem.productId, 0);
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('clears entire cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    // Add multiple items
    act(() => {
      result.current.addItem(mockItem);
      result.current.addItem({
        ...mockItem,
        productId: '2',
        name: 'Test Product 2',
      });
    });

    // Clear cart
    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('persists cart to localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    // Add item
    act(() => {
      result.current.addItem(mockItem);
    });

    // Check localStorage
    const savedCart = localStorage.getItem('cart');
    expect(savedCart).toBeTruthy();
    expect(JSON.parse(savedCart!)).toEqual([mockItem]);
  });

  it('handles multiple items correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const item2 = {
      ...mockItem,
      productId: '2',
      name: 'Test Product 2',
      price: 200,
    };

    // Add multiple items
    act(() => {
      result.current.addItem(mockItem);
      result.current.addItem(item2);
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalPrice).toBe(300);
  });

  it('throws error when useCart is used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Use expect(() => ...).toThrow() to test for thrown errors
    expect(() => {
      renderHook(() => useCart());
    }).toThrow('useCart must be used within a CartProvider');
    
    consoleError.mockRestore();
  });

  it('handles invalid localStorage data gracefully', () => {
    // Set invalid JSON in localStorage
    localStorage.setItem('cart', 'invalid-json');

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });
}); 