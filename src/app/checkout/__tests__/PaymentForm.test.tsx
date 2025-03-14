import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PaymentForm from '../PaymentForm';
import { useCart } from '~/app/_components/cart/CartContext';
import { useLanguage } from '~/i18n/LanguageContext';

// Mock console.error to avoid noise in test output
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Mock the cart context
jest.mock('~/app/_components/cart/CartContext', () => ({
  useCart: jest.fn(),
}));

// Mock the language context
jest.mock('~/i18n/LanguageContext', () => ({
  useLanguage: jest.fn(),
}));

// Mock PayPal
jest.mock('@paypal/react-paypal-js', () => {
  const React = require('react');
  return {
    PayPalButtons: function MockPayPalButtons() {
      return React.createElement('div', { 'data-testid': 'paypal-buttons' }, 'PayPal Buttons');
    },
    PayPalScriptProvider: function MockPayPalScriptProvider({ children }: { children: React.ReactNode }) {
      return React.createElement('div', { 'data-testid': 'paypal-provider' }, children);
    },
  };
});

describe.skip('PaymentForm', () => {
  const mockOnBack = jest.fn();
  const mockCartItems = [
    {
      productId: '1',
      name: 'Test Product',
      price: 100,
      quantity: 2,
      image_url: 'https://example.com/test.jpg',
    },
  ];

  const mockFormData = {
    contact: {
      email: 'test@example.com',
      phone: '1234567890',
    },
    shipping: {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Test St',
      apartment: '',
      city: 'Test City',
      province: 'Test Province',
      sector: 'Test Sector',
      references: '',
      country: 'DO',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useCart as jest.Mock).mockReturnValue({
      items: mockCartItems,
      totalItems: 2,
      totalPrice: 200,
      clearCart: jest.fn(),
    });

    (useLanguage as jest.Mock).mockReturnValue({
      language: 'en',
      setLanguage: jest.fn(),
    });
  });

  it('renders payment form with order summary', () => {
    render(
      React.createElement(PaymentForm, {
        formData: mockFormData,
        onBack: mockOnBack,
      })
    );

    expect(screen.getByText(/payment method/i)).toBeInTheDocument();
    expect(screen.getByText('$200.00')).toBeInTheDocument();
    expect(screen.getByText('$36.00')).toBeInTheDocument(); // ITBIS (18%)
    expect(screen.getByText('$236.00')).toBeInTheDocument(); // Total
  });

  it('handles back button click', () => {
    render(
      React.createElement(PaymentForm, {
        formData: mockFormData,
        onBack: mockOnBack,
      })
    );

    const backButton = screen.getByRole('button', { name: /back to shipping/i });
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('renders PayPal buttons', () => {
    render(
      React.createElement(PaymentForm, {
        formData: mockFormData,
        onBack: mockOnBack,
      })
    );

    expect(screen.getByTestId('paypal-buttons')).toBeInTheDocument();
  });

  it('renders in Spanish when language is set to Spanish', () => {
    (useLanguage as jest.Mock).mockReturnValue({
      language: 'es',
      setLanguage: jest.fn(),
    });

    render(
      React.createElement(PaymentForm, {
        formData: mockFormData,
        onBack: mockOnBack,
      })
    );

    expect(screen.getByText(/método de pago/i)).toBeInTheDocument();
    expect(screen.getByText(/volver a envío/i)).toBeInTheDocument();
  });

  it('handles empty cart state', () => {
    (useCart as jest.Mock).mockReturnValue({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      clearCart: jest.fn(),
    });

    render(
      React.createElement(PaymentForm, {
        formData: mockFormData,
        onBack: mockOnBack,
      })
    );

    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });
}); 