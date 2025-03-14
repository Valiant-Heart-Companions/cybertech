'use client';

import { useState } from 'react';
import { useLanguage } from '~/i18n/LanguageContext';

interface ContactFormData {
  email: string;
  phone: string;
}

interface ContactFormProps {
  initialData: ContactFormData;
  onSubmit: (data: ContactFormData) => void;
}

export default function ContactForm({ initialData, onSubmit }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>(initialData);
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  const { language } = useLanguage();
  
  const t = {
    title: language === 'es' ? 'Información de Contacto' : 'Contact Information',
    email: {
      label: language === 'es' ? 'Correo Electrónico' : 'Email Address',
      required: language === 'es' ? 'El correo electrónico es requerido' : 'Email is required',
      invalid: language === 'es' ? 'Por favor ingrese un correo electrónico válido' : 'Please enter a valid email address'
    },
    phone: {
      label: language === 'es' ? 'Número de Teléfono' : 'Phone Number',
      required: language === 'es' ? 'El número de teléfono es requerido' : 'Phone number is required',
      invalid: language === 'es' ? 'Por favor ingrese un número de teléfono válido' : 'Please enter a valid phone number',
      placeholder: language === 'es' ? '+1 (809) 123-4567' : '+1 (809) 123-4567'
    },
    continue: language === 'es' ? 'Continuar a Envío' : 'Continue to Shipping'
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = t.email.required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.email.invalid;
    }

    // Phone validation (required and must be a valid format)
    if (!formData.phone) {
      newErrors.phone = t.phone.required;
    } else if (!/^\+?[\d\s-]{8,}$/.test(formData.phone)) {
      newErrors.phone = t.phone.invalid;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">{t.title}</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {t.email.label}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            } focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            {t.phone.label}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            } focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
            placeholder={t.phone.placeholder}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {t.continue}
        </button>
      </div>
    </form>
  );
} 