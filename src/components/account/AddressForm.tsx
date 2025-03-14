'use client';

import { useState } from 'react';
import { useLanguage } from '~/i18n/LanguageContext';
import { translations } from '~/i18n/translations';

export type Address = {
  id: string;
  name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default_shipping: boolean;
  is_default_billing: boolean;
};

type AddressFormData = Omit<Address, 'id'>;

type AddressFormProps = {
  address?: Address;
  onSubmit: (address: AddressFormData) => void;
  onCancel: () => void;
};

export default function AddressForm({ address, onSubmit, onCancel }: AddressFormProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const [formData, setFormData] = useState<AddressFormData>({
    name: address?.name || '',
    address_line1: address?.address_line1 || '',
    address_line2: address?.address_line2 || '',
    city: address?.city || '',
    state: address?.state || '',
    postal_code: address?.postal_code || '',
    country: address?.country || 'DO', // Default to Dominican Republic
    phone: address?.phone || '',
    is_default_shipping: address?.is_default_shipping || false,
    is_default_billing: address?.is_default_billing || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          {t.contact.form.name}
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700">
          {t.contact.address} 1
        </label>
        <input
          type="text"
          id="address_line1"
          required
          value={formData.address_line1}
          onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700">
          {t.contact.address} 2
        </label>
        <input
          type="text"
          id="address_line2"
          value={formData.address_line2}
          onChange={(e) => setFormData(prev => ({ ...prev, address_line2: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            {t.contact.city}
          </label>
          <input
            type="text"
            id="city"
            required
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            {t.contact.state}
          </label>
          <input
            type="text"
            id="state"
            required
            value={formData.state}
            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
            {t.contact.postalCode}
          </label>
          <input
            type="text"
            id="postal_code"
            required
            value={formData.postal_code}
            onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            {t.contact.phone}
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_default_shipping"
            checked={formData.is_default_shipping}
            onChange={(e) => setFormData(prev => ({ ...prev, is_default_shipping: e.target.checked }))}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="is_default_shipping" className="ml-2 block text-sm text-gray-900">
            {t.account.addresses.defaultShipping}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_default_billing"
            checked={formData.is_default_billing}
            onChange={(e) => setFormData(prev => ({ ...prev, is_default_billing: e.target.checked }))}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="is_default_billing" className="ml-2 block text-sm text-gray-900">
            {t.account.addresses.defaultBilling}
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {t.shop.filters.clear}
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {address ? t.account.profile.save : t.account.addresses.addNew}
        </button>
      </div>
    </form>
  );
} 