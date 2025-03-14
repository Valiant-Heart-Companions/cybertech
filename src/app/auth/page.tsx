'use client';

import { useState } from 'react';
import LoginForm from '~/components/auth/LoginForm';
import RegisterForm from '~/components/auth/RegisterForm';
import { useLanguage } from '~/i18n/LanguageContext';
import { translations } from '~/i18n/translations';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const { language } = useLanguage();
  const t = translations[language].account.auth;

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'login'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('login')}
          >
            {t.login}
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'register'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('register')}
          >
            {t.register}
          </button>
        </div>

        {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
} 