'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CreatePromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const promotionTypes = [
  { id: 'percentage', name: 'Porcentaje de descuento' },
  { id: 'fixed_amount', name: 'Monto fijo' },
  { id: 'free_shipping', name: 'Envío gratis' },
  { id: 'buy_x_get_y', name: 'Compra X lleva Y' },
];

export default function CreatePromotionModal({ isOpen, onClose, onSubmit }: CreatePromotionModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    promotion_type: 'percentage',
    discount_value: '',
    discount_unit: 'percentage',
    minimum_purchase: '',
    maximum_discount: '',
    starts_at: new Date().toISOString().split('T')[0],
    expires_at: '',
    usage_limit: '',
    status: 'active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'El código es requerido';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!formData.promotion_type) {
      newErrors.promotion_type = 'El tipo de promoción es requerido';
    }
    
    if (!formData.discount_value && formData.promotion_type !== 'free_shipping') {
      newErrors.discount_value = 'El valor del descuento es requerido';
    } else if (formData.promotion_type === 'percentage' && (parseFloat(formData.discount_value) <= 0 || parseFloat(formData.discount_value) > 100)) {
      newErrors.discount_value = 'El porcentaje debe estar entre 0 y 100';
    }
    
    if (!formData.starts_at) {
      newErrors.starts_at = 'La fecha de inicio es requerida';
    }
    
    if (formData.expires_at && new Date(formData.expires_at as string) <= new Date(formData.starts_at as string)) {
      newErrors.expires_at = 'La fecha de expiración debe ser posterior a la fecha de inicio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Format data for submission
    const dataToSubmit = {
      ...formData,
      discount_value: formData.discount_value ? parseFloat(formData.discount_value) : 0,
      minimum_purchase: formData.minimum_purchase ? parseFloat(formData.minimum_purchase) : null,
      maximum_discount: formData.maximum_discount ? parseFloat(formData.maximum_discount) : null,
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
    };
    
    onSubmit(dataToSubmit);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Cerrar</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Crear Nueva Promoción
                    </Dialog.Title>
                    <div className="mt-4">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                              Código *
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="code"
                                id="code"
                                value={formData.code}
                                onChange={handleChange}
                                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                                  errors.code ? 'border-red-300' : ''
                                }`}
                              />
                              {errors.code && (
                                <p className="mt-2 text-sm text-red-600">{errors.code}</p>
                              )}
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                              Nombre *
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="name"
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                                  errors.name ? 'border-red-300' : ''
                                }`}
                              />
                              {errors.name && (
                                <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                              )}
                            </div>
                          </div>

                          <div className="sm:col-span-6">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                              Descripción
                            </label>
                            <div className="mt-1">
                              <textarea
                                id="description"
                                name="description"
                                rows={3}
                                value={formData.description}
                                onChange={handleChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="promotion_type" className="block text-sm font-medium text-gray-700">
                              Tipo de Promoción *
                            </label>
                            <div className="mt-1">
                              <select
                                id="promotion_type"
                                name="promotion_type"
                                value={formData.promotion_type}
                                onChange={handleChange}
                                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                                  errors.promotion_type ? 'border-red-300' : ''
                                }`}
                              >
                                {promotionTypes.map((type) => (
                                  <option key={type.id} value={type.id}>
                                    {type.name}
                                  </option>
                                ))}
                              </select>
                              {errors.promotion_type && (
                                <p className="mt-2 text-sm text-red-600">{errors.promotion_type}</p>
                              )}
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="discount_value" className="block text-sm font-medium text-gray-700">
                              Valor del Descuento *
                            </label>
                            <div className="mt-1">
                              <input
                                type="number"
                                name="discount_value"
                                id="discount_value"
                                value={formData.discount_value}
                                onChange={handleChange}
                                disabled={formData.promotion_type === 'free_shipping'}
                                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                                  errors.discount_value ? 'border-red-300' : ''
                                }`}
                              />
                              {errors.discount_value && (
                                <p className="mt-2 text-sm text-red-600">{errors.discount_value}</p>
                              )}
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="minimum_purchase" className="block text-sm font-medium text-gray-700">
                              Compra Mínima
                            </label>
                            <div className="mt-1">
                              <input
                                type="number"
                                name="minimum_purchase"
                                id="minimum_purchase"
                                value={formData.minimum_purchase}
                                onChange={handleChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="maximum_discount" className="block text-sm font-medium text-gray-700">
                              Descuento Máximo
                            </label>
                            <div className="mt-1">
                              <input
                                type="number"
                                name="maximum_discount"
                                id="maximum_discount"
                                value={formData.maximum_discount}
                                onChange={handleChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="starts_at" className="block text-sm font-medium text-gray-700">
                              Fecha de Inicio *
                            </label>
                            <div className="mt-1">
                              <input
                                type="date"
                                name="starts_at"
                                id="starts_at"
                                value={formData.starts_at}
                                onChange={handleChange}
                                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                                  errors.starts_at ? 'border-red-300' : ''
                                }`}
                              />
                              {errors.starts_at && (
                                <p className="mt-2 text-sm text-red-600">{errors.starts_at}</p>
                              )}
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700">
                              Fecha de Expiración
                            </label>
                            <div className="mt-1">
                              <input
                                type="date"
                                name="expires_at"
                                id="expires_at"
                                value={formData.expires_at}
                                onChange={handleChange}
                                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                                  errors.expires_at ? 'border-red-300' : ''
                                }`}
                              />
                              {errors.expires_at && (
                                <p className="mt-2 text-sm text-red-600">{errors.expires_at}</p>
                              )}
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="usage_limit" className="block text-sm font-medium text-gray-700">
                              Límite de Uso
                            </label>
                            <div className="mt-1">
                              <input
                                type="number"
                                name="usage_limit"
                                id="usage_limit"
                                value={formData.usage_limit}
                                onChange={handleChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                              Estado
                            </label>
                            <div className="mt-1">
                              <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              >
                                <option value="active">Activo</option>
                                <option value="inactive">Inactivo</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                          <button
                            type="submit"
                            className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                          >
                            Crear Promoción
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                            onClick={onClose}
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 