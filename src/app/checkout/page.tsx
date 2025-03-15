/* eslint-disable */
'use client';

import { useState } from 'react';
import { useCart } from '../_components/cart/CartContext';
import { useRouter } from 'next/navigation';
import ContactForm from './ContactForm';
import ShippingForm from './ShippingForm';
import PaymentForm from './PaymentForm';
import OrderSummary from './OrderSummary';

type CheckoutStep = 'contact' | 'shipping' | 'payment';

interface ShippingFormData {
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  province: string;
  sector: string;
  references: string;
  country: string;
}

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('contact');
  const [formData, setFormData] = useState({
    contact: {
      email: '',
      phone: '',
    },
    shipping: {
      firstName: '',
      lastName: '',
      address: '',
      apartment: '',
      city: '',
      province: 'Distrito Nacional',
      sector: '',
      references: '',
      country: 'República Dominicana',
    } as ShippingFormData,
  });

  const { items, totalPrice } = useCart();
  const router = useRouter();

  // Redirect to cart if cart is empty
  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  const updateFormData = (step: CheckoutStep, data: any) => {
    setFormData(prev => ({
      ...prev,
      [step]: data
    }));
    // Move to next step
    if (step === 'contact') setCurrentStep('shipping');
    if (step === 'shipping') setCurrentStep('payment');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Checkout Steps */}
        <nav className="mb-8">
          <ol className="flex items-center justify-center space-x-4 text-sm font-medium text-gray-500">
            <li className={`flex items-center ${currentStep === 'contact' ? 'text-indigo-600' : ''}`}>
              <span className="rounded-full bg-indigo-600 text-white w-6 h-6 flex items-center justify-center mr-2">1</span>
              Contact
            </li>
            <li className="flex-shrink-0">→</li>
            <li className={`flex items-center ${currentStep === 'shipping' ? 'text-indigo-600' : ''}`}>
              <span className={`rounded-full ${currentStep === 'contact' ? 'bg-gray-200' : 'bg-indigo-600'} text-white w-6 h-6 flex items-center justify-center mr-2`}>2</span>
              Shipping
            </li>
            <li className="flex-shrink-0">→</li>
            <li className={`flex items-center ${currentStep === 'payment' ? 'text-indigo-600' : ''}`}>
              <span className={`rounded-full ${currentStep === 'payment' ? 'bg-indigo-600' : 'bg-gray-200'} text-white w-6 h-6 flex items-center justify-center mr-2`}>3</span>
              Payment
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="bg-white shadow-sm rounded-lg">
              {currentStep === 'contact' && (
                <ContactForm 
                  initialData={formData.contact}
                  onSubmit={(data) => updateFormData('contact', data)}
                />
              )}
              {currentStep === 'shipping' && (
                <ShippingForm
                  initialData={formData.shipping}
                  onSubmit={(data) => updateFormData('shipping', data)}
                  onBack={() => setCurrentStep('contact')}
                />
              )}
              {currentStep === 'payment' && (
                <PaymentForm
                  formData={formData}
                  onBack={() => setCurrentStep('shipping')}
                />
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
} 