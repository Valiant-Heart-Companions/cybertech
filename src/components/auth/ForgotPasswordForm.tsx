/* eslint-disable */
'use client';

import { useState } from 'react';
import { supabase } from '~/utils/supabase';
import { useLanguage } from '~/i18n/LanguageContext';
import { translations } from '~/i18n/translations';

export default function ForgotPasswordForm() {
  const { language } = useLanguage();
  const t = translations[language].account.auth;
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`, // URL a donde redirige luego de hacer clic en el correo
      });

      if (error) {
        throw error;
      }

      setMessage(language === 'es'
        ? 'Te hemos enviado un correo para restablecer tu contraseña.'
        : 'We have sent you an email to reset your password.');
    } catch (err: any) {
      setError(err.message || (language === 'es' ? 'Error al enviar el correo.' : 'Failed to send reset email.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleForgotPassword} className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {language === 'es' ? 'Recuperar contraseña' : 'Forgot Password'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            {t.email}
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

        <div className="flex items-center justify-center">
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } text-white transition-colors`}
            disabled={loading}
          >
            {loading
              ? (language === 'es' ? 'Enviando...' : 'Sending...')
              : (language === 'es' ? 'Enviar enlace de recuperación' : 'Send Reset Link')}
          </button>
        </div>
      </form>
    </div>
  );
}
