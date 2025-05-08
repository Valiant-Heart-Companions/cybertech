/* eslint-disable */
'use client';

import { useState } from 'react';
import { supabase } from '~/utils/supabase';
import Link from 'next/link';
import { useLanguage } from '~/i18n/LanguageContext';
import { translations } from '~/i18n/translations';

export default function RegisterForm() {
  const { language } = useLanguage();
  const t = translations[language].account.auth;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Starting registration process...');
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        //phone: phone_number,
        password,
        options: {
          data: {
            first_name,
            last_name,
            phone_number,
          },
        },
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        throw signUpError;
      }

      if (!data?.user?.id) {
        console.error('No user ID returned from signup');
        throw new Error('Failed to create user account');
      }

      console.log('User created in auth.users:', data.user.id);
      
      // Wait for 2 seconds to ensure the auth user is fully created
      console.log('Waiting for auth user to be fully created...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verify the auth user exists before proceeding
      console.log('Verifying auth user...');
      const { data: { user: verifiedUser }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('Auth user verification error:', userError);
        console.error('Error details:', {
          code: userError.code,
          message: userError.message
        });
        throw new Error(`Failed to verify user account: ${userError.message}`);
      }

      if (!verifiedUser) {
        console.error('Auth user verification failed: User not found');
        throw new Error('Failed to verify user account: User not found');
      }

      console.log('Auth user verified:', verifiedUser.id);
      
      // Call the handle_new_user function to create the user profile and role
      const { data: profileData, error: profileError } = await supabase
        .rpc('handle_new_user', {
          auth_user_id: verifiedUser.id,
          user_email: email,
          user_first_name: first_name,
          user_last_name: last_name,
          user_phone: phone_number
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        console.error('Error details:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        });
        throw profileError;
      }

      console.log('User profile created successfully:', profileData);
      setSuccess(true);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  // If registration was successful, show success message
  if (success) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-green-600 mb-4">
          {t.success}
        </h2>
        <p className="text-gray-600 text-center mb-4">
          {language === 'es' ? 'Por favor verifica tu correo electrónico para confirmar tu cuenta.' : 'Please check your email to verify your account.'}
        </p>
        <Link 
          href="/auth/login"
          className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          {t.login}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">{t.register}</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
              {t.firstName}
            </label>
            <input
              id="firstName"
              type="text"
              value={first_name}
              onChange={(e) => setFirstName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
              {t.lastName}
            </label>
            <input
              id="lastName"
              type="text"
              value={last_name}
              onChange={(e) => setLastName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
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
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
            {t.phone}
          </label>
          <input
            id="phone"
            type="tel"
            value={phone_number}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {language === 'es' ? 'Requerido para actualizaciones de pedidos y notificaciones' : 'Required for order updates and notifications'}
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            {t.password}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            minLength={8}
          />
          <p className="text-xs text-gray-500 mt-1">
            {language === 'es' ? 'Debe tener al menos 8 caracteres' : 'Must be at least 8 characters'}
          </p>
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
            {loading ? (language === 'es' ? 'Registrando...' : 'Registering...') : t.register}
          </button>
        </div>
      </form>
    </div>
  );
} 