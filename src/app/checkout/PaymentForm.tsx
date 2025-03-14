'use client';

import { useEffect } from 'react';
import { useCart } from '../_components/cart/CartContext';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import type { CreateOrderData, CreateOrderActions, OnApproveData, OnApproveActions } from '@paypal/paypal-js';
import { useLanguage } from '~/i18n/LanguageContext';

interface PaymentFormProps {
  formData: {
    contact: {
      email: string;
      phone: string;
    };
    shipping: {
      firstName: string;
      lastName: string;
      address: string;
      apartment: string;
      city: string;
      province: string;
      sector: string;
      references: string;
      country: string;
    };
  };
  onBack: () => void;
}

export default function PaymentForm({ formData, onBack }: PaymentFormProps) {
  const { items, totalPrice, clearCart } = useCart();
  const { language } = useLanguage();

  // Calculate ITBIS (18% VAT in Dominican Republic)
  const subtotal = totalPrice;
  const itbis = subtotal * 0.18;
  const total = subtotal + itbis;

  const t = {
    title: language === 'es' ? 'Método de Pago' : 'Payment Method',
    subtitle: language === 'es' 
      ? 'Todas las transacciones son seguras y encriptadas.' 
      : 'All transactions are secure and encrypted.',
    paypal: {
      error: language === 'es' 
        ? 'Hubo un error al procesar su pago. Por favor, inténtelo de nuevo.' 
        : 'There was an error processing your payment. Please try again.',
      button: language === 'es' ? 'Pagar con PayPal' : 'Pay with PayPal'
    },
    buttons: {
      back: language === 'es' ? 'Volver a Envío' : 'Back to Shipping'
    }
  };

  const createOrder = async (data: CreateOrderData, actions: CreateOrderActions) => {
    // Format the shipping address for Dominican Republic
    const shippingAddress = `${formData.shipping.address}${formData.shipping.apartment ? `, ${formData.shipping.apartment}` : ''}, ${formData.shipping.sector}, ${formData.shipping.city}, ${formData.shipping.province}`;
    
    // Format reference points if provided
    const referencePoints = formData.shipping.references ? `\nReference Points: ${formData.shipping.references}` : '';

    return actions.order.create({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            value: total.toFixed(2),
            currency_code: 'USD',
            breakdown: {
              item_total: {
                value: subtotal.toFixed(2),
                currency_code: 'USD'
              },
              tax_total: {
                value: itbis.toFixed(2),
                currency_code: 'USD'
              }
            }
          },
          shipping: {
            name: {
              full_name: `${formData.shipping.firstName} ${formData.shipping.lastName}`
            },
            address: {
              address_line_1: shippingAddress,
              address_line_2: referencePoints,
              admin_area_2: formData.shipping.city,
              admin_area_1: formData.shipping.province,
              country_code: 'DO'
            }
          },
          items: items.map(item => ({
            name: item.name,
            unit_amount: {
              value: item.price.toFixed(2),
              currency_code: 'USD'
            },
            quantity: item.quantity.toString()
          }))
        }
      ],
      application_context: {
        shipping_preference: 'SET_PROVIDED_ADDRESS',
        locale: language === 'es' ? 'es-DO' : 'en-US'
      }
    });
  };

  const onApprove = async (data: OnApproveData, actions: OnApproveActions) => {
    try {
      const order = await actions.order?.capture();
      if (!order) {
        throw new Error('Failed to capture order');
      }

      // Store the phone number in the order metadata or a separate database field
      const orderData = {
        ...order,
        customer: {
          email: formData.contact.email,
          phone: formData.contact.phone,
        },
        shipping_details: {
          address: `${formData.shipping.address}${formData.shipping.apartment ? `, ${formData.shipping.apartment}` : ''}`,
          sector: formData.shipping.sector,
          city: formData.shipping.city,
          province: formData.shipping.province,
          references: formData.shipping.references,
        }
      };

      // Here you would typically:
      // 1. Send orderData to your backend to store in the database
      // 2. Send confirmation email
      // 3. Send confirmation SMS to the provided phone number
      // 4. Clear the cart
      // 5. Redirect to success page
      
      clearCart();
      window.location.href = '/checkout/success';
    } catch (error) {
      console.error('Error processing payment:', error);
      // Handle error appropriately
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{t.title}</h2>
        <p className="mt-1 text-sm text-gray-500">{t.subtitle}</p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>ITBIS (18%):</span>
            <span>${itbis.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium text-gray-900 pt-2 border-t border-gray-200">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <PayPalScriptProvider options={{
          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
          currency: "USD",
          intent: "capture"
        }}>
          <PayPalButtons
            style={{ layout: "vertical" }}
            createOrder={createOrder}
            onApprove={onApprove}
            onError={() => {
              console.error(t.paypal.error);
            }}
          />
        </PayPalScriptProvider>

        <div className="text-sm text-gray-500 text-center mt-4">
          <p>Your payment information is processed securely by PayPal.</p>
          <p>We never store your credit card details.</p>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {t.buttons.back}
        </button>
      </div>
    </div>
  );
} 