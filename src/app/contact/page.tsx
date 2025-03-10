'use client';

import { useState } from 'react';
import { useLanguage } from '~/i18n/LanguageContext';
import { translations } from '~/i18n/translations';

export default function ContactPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{t.contact.title}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t.contact.getInTouch}</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{t.contact.address}</h3>
                <p className="mt-1 text-gray-600 whitespace-pre-line">
                  {t.contact.addressContent}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">{t.contact.phone}</h3>
                <p className="mt-1 text-gray-600">{t.contact.phoneNumber}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">{t.contact.email}</h3>
                <p className="mt-1 text-gray-600">{t.contact.emailAddress}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">{t.contact.businessHours}</h3>
                <p className="mt-1 text-gray-600 whitespace-pre-line">
                  {t.contact.businessHoursContent}
                </p>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t.contact.form.title}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {t.contact.form.name}
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t.contact.form.email}
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  {t.contact.form.phone}
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  {t.contact.form.message}
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {t.contact.form.sendMessage}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 