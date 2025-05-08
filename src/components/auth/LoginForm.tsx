/* eslint-disable */
'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '~/utils/supabase';
import { useLanguage } from '~/i18n/LanguageContext';
import { translations } from '~/i18n/translations';
import Link from 'next/link';

export default function LoginForm() {
  const { language } = useLanguage();
  const t = translations[language].account.auth;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);    

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Successful login will redirect in middleware
      router.push('/');

    } catch (err: any) {
      setError(err.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md" data-testid="login-form">
        <h2 className="text-2xl font-bold mb-6 text-center">{t.login}</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            {t.email}:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            {t.password}:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {t.forgotPassword}
          </Link>
        </div>
        
        <div className="flex items-center justify-center">
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white transition-colors`}
            disabled={loading}
          >
            {loading ? (language === 'es' ? 'Iniciando sesión...' : 'Logging in...') : t.login}
          </button>
        </div>
      </form>
    </div>
  );
} 