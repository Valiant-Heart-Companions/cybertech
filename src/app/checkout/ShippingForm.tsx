'use client';

import { useState } from 'react';
import { useLanguage } from '~/i18n/LanguageContext';
import { useEffect } from 'react';
import { supabase } from '~/utils/supabase';

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

interface ShippingFormProps {
  initialData: ShippingFormData;
  onSubmit: (data: ShippingFormData) => void;
  onBack: () => void;
}

// Dominican Republic provinces
const provinces = [
  'Azua', 'Bahoruco', 'Barahona', 'Dajabón', 'Distrito Nacional', 'Duarte',
  'Elías Piña', 'El Seibo', 'Espaillat', 'Hato Mayor', 'Hermanas Mirabal',
  'Independencia', 'La Altagracia', 'La Romana', 'La Vega', 'María Trinidad Sánchez',
  'Monseñor Nouel', 'Monte Cristi', 'Monte Plata', 'Pedernales', 'Peravia',
  'Puerto Plata', 'Samaná', 'San Cristóbal', 'San José de Ocoa', 'San Juan',
  'San Pedro de Macorís', 'Santiago', 'Santiago Rodríguez', 'Santo Domingo',
  'Sánchez Ramírez', 'Valverde'
];

export default function ShippingForm({ initialData, onSubmit, onBack }: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingFormData>({
    ...initialData,
    country: 'República Dominicana',
    province: initialData.province || 'Distrito Nacional'
  });
  const [errors, setErrors] = useState<Partial<ShippingFormData>>({});
  const { language } = useLanguage();

  const t = {
    title: language === 'es' ? 'Dirección de Envío' : 'Shipping Address',
    firstName: {
      label: language === 'es' ? 'Nombre' : 'First Name',
      required: language === 'es' ? 'El nombre es requerido' : 'First name is required'
    },
    lastName: {
      label: language === 'es' ? 'Apellido' : 'Last Name',
      required: language === 'es' ? 'El apellido es requerido' : 'Last name is required'
    },
    address: {
      label: language === 'es' ? 'Dirección' : 'Street Address',
      required: language === 'es' ? 'La dirección es requerida' : 'Address is required',
      placeholder: language === 'es' ? 'Ejemplo: Calle Principal #123' : 'Example: Main Street #123'
    },
    apartment: {
      label: language === 'es' ? 'Apartamento, suite, etc. (opcional)' : 'Apartment, suite, etc. (optional)',
      placeholder: language === 'es' ? 'Ejemplo: Apto. 2B' : 'Example: Apt. 2B'
    },
    province: {
      label: language === 'es' ? 'Provincia' : 'Province',
      required: language === 'es' ? 'La provincia es requerida' : 'Province is required'
    },
    city: {
      label: language === 'es' ? 'Ciudad / Municipio' : 'City / Municipality',
      required: language === 'es' ? 'La ciudad es requerida' : 'City is required'
    },
    sector: {
      label: language === 'es' ? 'Sector / Barrio' : 'Sector / Neighborhood',
      required: language === 'es' ? 'El sector es requerido' : 'Sector is required',
      placeholder: language === 'es' ? 'Ejemplo: Los Prados' : 'Example: Los Prados'
    },
    references: {
      label: language === 'es' ? 'Puntos de Referencia (opcional)' : 'Reference Points (optional)',
      placeholder: language === 'es' ? 'Ejemplo: Cerca de la iglesia, casa azul con verja blanca' : 'Example: Near the church, blue house with white fence'
    },
    country: {
      label: language === 'es' ? 'País' : 'Country'
    },
    buttons: {
      back: language === 'es' ? 'Volver a Contacto' : 'Back to Contact',
      continue: language === 'es' ? 'Continuar a Pago' : 'Continue to Payment'
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userMetadata = user.user_metadata as { first_name?: string, last_name?: string } | null;
        setFormData((prevFormData) => ({
          ...prevFormData,
          firstName: userMetadata?.first_name ?? '',
          lastName: userMetadata?.last_name ?? '',
        }));
      }
    };
  
    void fetchUser();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingFormData> = {};
    const required = ['firstName', 'lastName', 'address', 'city', 'province', 'sector'] as const;

    required.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = t[field].required;
      }
    });

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
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            {t.firstName.label}
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            readOnly
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.firstName ? 'border-red-300' : 'border-gray-300'
            } focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            {t.lastName.label}
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            readOnly
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.lastName ? 'border-red-300' : 'border-gray-300'
            } focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            {t.address.label}
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.address ? 'border-red-300' : 'border-gray-300'
            } focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
            placeholder={t.address.placeholder}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="apartment" className="block text-sm font-medium text-gray-700">
            {t.apartment.label}
          </label>
          <input
            type="text"
            id="apartment"
            name="apartment"
            value={formData.apartment}
            onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder={t.apartment.placeholder}
          />
        </div>

        <div>
          <label htmlFor="province" className="block text-sm font-medium text-gray-700">
            {t.province.label}
          </label>
          <select
            id="province"
            name="province"
            value={formData.province}
            onChange={(e) => setFormData({ ...formData, province: e.target.value })}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.province ? 'border-red-300' : 'border-gray-300'
            } focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
          >
            {provinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
          {errors.province && (
            <p className="mt-1 text-sm text-red-600">{errors.province}</p>
          )}
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            {t.city.label}
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.city ? 'border-red-300' : 'border-gray-300'
            } focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
          )}
        </div>

        <div>
          <label htmlFor="sector" className="block text-sm font-medium text-gray-700">
            {t.sector.label}
          </label>
          <input
            type="text"
            id="sector"
            name="sector"
            value={formData.sector}
            onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.sector ? 'border-red-300' : 'border-gray-300'
            } focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
            placeholder={t.sector.placeholder}
          />
          {errors.sector && (
            <p className="mt-1 text-sm text-red-600">{errors.sector}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="references" className="block text-sm font-medium text-gray-700">
            {t.references.label}
          </label>
          <textarea
            id="references"
            name="references"
            value={formData.references}
            onChange={(e) => setFormData({ ...formData, references: e.target.value })}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder={t.references.placeholder}
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            {t.country.label}
          </label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            disabled
          >
            <option value="República Dominicana">República Dominicana</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {t.buttons.back}
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {t.buttons.continue}
        </button>
      </div>
    </form>
  );
} 