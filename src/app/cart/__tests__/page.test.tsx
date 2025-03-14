import { render, screen, fireEvent } from '@testing-library/react';
import { CartProvider } from '@/app/_components/cart/CartContext';
import CartPage from '../page';
import { useLanguage } from '~/i18n/LanguageContext';

// Mock the language context
jest.mock('~/i18n/LanguageContext', () => ({
  useLanguage: jest.fn(),
}));

describe('CartPage', () => {
  const mockUseLanguage = useLanguage as jest.MockedFunction<typeof useLanguage>;

  beforeEach(() => {
    mockUseLanguage.mockReturnValue({
      language: 'en',
      setLanguage: jest.fn(),
      languages: { en: 'English', es: 'Español' },
    });
  });

  const renderCartPage = () => {
    return render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    );
  };

  it('renders empty cart message when cart is empty', () => {
    renderCartPage();

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    expect(screen.getByText(/browse products/i)).toBeInTheDocument();
  });

  it('renders cart items when cart has items', () => {
    // Mock localStorage with cart items
    localStorage.setItem(
      'cart',
      JSON.stringify([
        {
          productId: '1',
          name: 'Test Product',
          price: 100,
          quantity: 1,
        },
      ])
    );

    renderCartPage();

    // Check for product name
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    
    // Check for item price specifically in the cart list
    const cartItem = screen.getByText('Test Product').closest('li');
    expect(cartItem).toBeInTheDocument();
    const itemPrice = cartItem?.querySelector('p.ml-4');
    expect(itemPrice).toHaveTextContent('$100.00');
    
    // Check for quantity
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('allows quantity updates', () => {
    localStorage.setItem(
      'cart',
      JSON.stringify([
        {
          productId: '1',
          name: 'Test Product',
          price: 100,
          quantity: 1,
        },
      ])
    );

    renderCartPage();

    // Find the quantity display and increment button
    const quantityDisplay = screen.getByText('1');
    const incrementButton = screen.getByRole('button', { name: /increase quantity/i });

    // Click the increment button
    fireEvent.click(incrementButton);

    // Check that the quantity display has updated
    expect(quantityDisplay).toHaveTextContent('2');
  });

  it('allows item removal', () => {
    localStorage.setItem(
      'cart',
      JSON.stringify([
        {
          productId: '1',
          name: 'Test Product',
          price: 100,
          quantity: 1,
        },
      ])
    );

    renderCartPage();

    // Find the remove button by its aria-label
    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    // Check that the item is removed
    expect(screen.queryByText('Test Product')).not.toBeInTheDocument();
  });

  it('displays correct totals', () => {
    localStorage.setItem(
      'cart',
      JSON.stringify([
        {
          productId: '1',
          name: 'Test Product',
          price: 100,
          quantity: 2,
        },
      ])
    );

    renderCartPage();

    // Find the subtotal section by its text and check the price
    const subtotalText = screen.getByText(/subtotal/i);
    const subtotalPrice = subtotalText.parentElement?.querySelector('p:last-child');
    expect(subtotalPrice).toHaveTextContent('$200.00');

    // Find the total section by its text and check the price
    const totalText = screen.getByText(/order total/i);
    const totalPrice = totalText.parentElement?.querySelector('p:last-child');
    expect(totalPrice).toHaveTextContent('$200.00');
  });

  it('renders in Spanish when language is set to Spanish', () => {
    mockUseLanguage.mockReturnValue({
      language: 'es',
      setLanguage: jest.fn(),
      languages: { en: 'English', es: 'Español' },
    });

    renderCartPage();

    expect(screen.getByText(/Carrito de compras/i)).toBeInTheDocument();
    expect(screen.getByText(/Subtotal/i)).toBeInTheDocument();
  });

  it('navigates to checkout when checkout link is clicked', () => {
    localStorage.setItem(
      'cart',
      JSON.stringify([
        {
          productId: '1',
          name: 'Test Product',
          price: 100,
          quantity: 1,
        },
      ])
    );

    renderCartPage();

    const checkoutLink = screen.getByRole('link', { name: /proceed to checkout/i });
    fireEvent.click(checkoutLink);

    // Note: Navigation testing would require additional setup with Next.js router
    // This is just a basic test to ensure the link exists and is clickable
    expect(checkoutLink).toBeInTheDocument();
  });
}); 