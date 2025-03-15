/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '~/lib/supabase';
import { useLanguage } from '~/i18n/LanguageContext';
import { translations } from '~/i18n/translations';
import AddressForm, { Address } from './AddressForm';
import AddressCard from './AddressCard';

export default function AddressList() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError(t.account.addresses.notLoggedIn);
        setLoading(false);
        return;
      }

      const { data, error: supabaseError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        setError(t.account.addresses.fetchError);
        console.error('Error fetching addresses:', supabaseError);
        return;
      }

      setAddresses(data || []);
    } catch (err) {
      setError(t.account.addresses.unexpectedError);
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (newAddress: Omit<Address, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('addresses')
        .insert([{ ...newAddress, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setAddresses(prev => [data, ...prev]);
      setIsAddingAddress(false);
    } catch (err) {
      console.error('Error adding address:', err);
      setError(t.account.addresses.saveError);
    }
  };

  const handleUpdateAddress = async (updatedAddressData: Omit<Address, 'id'>) => {
    if (!editingAddress) return;

    try {
      const updatedAddress = { ...updatedAddressData, id: editingAddress.id };
      const { error } = await supabase
        .from('addresses')
        .update(updatedAddress)
        .eq('id', editingAddress.id);

      if (error) throw error;

      setAddresses(prev =>
        prev.map(addr => (addr.id === editingAddress.id ? updatedAddress : addr))
      );
      setEditingAddress(null);
    } catch (err) {
      console.error('Error updating address:', err);
      setError(t.account.addresses.updateError);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm(t.account.addresses.deleteConfirmation)) return;

    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAddresses(prev => prev.filter(addr => addr.id !== id));
    } catch (err) {
      console.error('Error deleting address:', err);
      setError(t.account.addresses.deleteError);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-2">{error}</div>
        <button
          onClick={() => {
            setError(null);
            fetchAddresses();
          }}
          className="text-blue-500 hover:text-blue-700 underline text-sm"
        >
          {t.account.addresses.tryAgain}
        </button>
      </div>
    );
  }

  if (addresses.length === 0 && !isAddingAddress) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">{t.account.addresses.noAddresses}</div>
        <button
          onClick={() => setIsAddingAddress(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {t.account.addresses.addNew}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isAddingAddress && (
        <div className="flex justify-end">
          <button
            onClick={() => setIsAddingAddress(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {t.account.addresses.addNew}
          </button>
        </div>
      )}

      {isAddingAddress && (
        <AddressForm
          onSubmit={handleAddAddress}
          onCancel={() => setIsAddingAddress(false)}
        />
      )}

      {addresses.map((address) => (
        <div key={address.id} className="bg-white p-6 rounded-lg shadow-sm">
          {editingAddress?.id === address.id ? (
            <AddressForm
              address={address}
              onSubmit={handleUpdateAddress}
              onCancel={() => setEditingAddress(null)}
            />
          ) : (
            <AddressCard
              address={address}
              onEdit={() => setEditingAddress(address)}
              onDelete={() => handleDeleteAddress(address.id)}
            />
          )}
        </div>
      ))}
    </div>
  );
} 