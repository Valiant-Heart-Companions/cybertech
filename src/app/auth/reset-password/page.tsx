'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '~/utils/supabase';
import { useLanguage } from '~/i18n/LanguageContext';
import { translations } from '~/i18n/translations';

export default function ResetPasswordPage() {
  const { language } = useLanguage();
  const t = translations[language].account.auth;
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError(language === 'es' ? 'Las contraseñas no coinciden.' : 'Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      setMessage(language === 'es'
        ? 'Contraseña actualizada correctamente. Ahora puedes iniciar sesión.'
        : 'Password updated successfully. You can now log in.');

      setTimeout(() => {
        router.push('/auth/login');
      }, 3000); // Redireccionar después de 3 segundos
    } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(language === 'es' ? 'Error al actualizar la contraseña.' : 'Failed to update password.');
        }
      } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleResetPassword} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {language === 'es' ? 'Restablecer contraseña' : 'Reset Password'}
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

        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
            {language === 'es' ? 'Nueva contraseña' : 'New Password'}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
            {language === 'es' ? 'Confirmar nueva contraseña' : 'Confirm New Password'}
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
              ? (language === 'es' ? 'Actualizando...' : 'Updating...')
              : (language === 'es' ? 'Actualizar contraseña' : 'Update Password')}
          </button>
        </div>
      </form>
    </div>
  );
}
