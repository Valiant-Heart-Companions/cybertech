/* eslint-disable */
'use client';

import { useLanguage } from '~/i18n/LanguageContext';
import { translations } from '~/i18n/translations';
import { Address } from './AddressForm';

type AddressCardProps = {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
};

export default function AddressCard({ address, onEdit, onDelete }: AddressCardProps) {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="relative">
      <div className="space-y-2">
        <div className="font-medium">{address.name}</div>
        <div className="text-gray-600">
          <div>{address.address_line1}</div>
          {address.address_line2 && <div>{address.address_line2}</div>}
          <div>{`${address.city}, ${address.state} ${address.postal_code}`}</div>
          {address.phone && <div>{address.phone}</div>}
        </div>
        <div className="space-x-2">
          {address.is_default_shipping && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              {t.account.addresses.default} ({t.checkout.shipping})
            </span>
          )}
          {address.is_default_billing && (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              {t.account.addresses.default} ({t.checkout.billing})
            </span>
          )}
        </div>
      </div>
      <div className="absolute right-0 top-0 space-x-2">
        <button
          onClick={onEdit}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {t.account.addresses.edit}
        </button>
        <button
          onClick={onDelete}
          className="text-sm text-red-600 hover:text-red-800"
        >
          {t.account.addresses.delete}
        </button>
      </div>
    </div>
  );
} 