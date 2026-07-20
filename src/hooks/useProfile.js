import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/api/supabase-products';
import { useAuth } from '@/contexts/AuthContext';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!user?.id || !supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      setProfile(profileData || {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        phone: '',
        company: '',
      });

      const { data: addressData } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      setAddresses(addressData || []);

      try {
        const ordersRes = await fetch(`/api/orders?userId=${encodeURIComponent(user.id)}`);
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData.orders || []);
        } else {
          setOrders([]);
        }
      } catch {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateProfile = useCallback(async (updates) => {
    if (!user?.id || !supabase) return { ok: false, error: 'No auth' };
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...updates });

      if (error) return { ok: false, error: error.message };
      setProfile(prev => ({ ...prev, ...updates }));
      return { ok: true, error: null };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, [user?.id]);

  const addAddress = useCallback(async (address) => {
    if (!user?.id || !supabase) return { ok: false, error: 'No auth' };
    try {
      const { data, error } = await supabase
        .from('addresses')
        .insert({ user_id: user.id, ...address })
        .select()
        .single();

      if (error) return { ok: false, error: error.message };
      setAddresses(prev => [...prev, data]);
      return { ok: true, error: null };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, [user?.id]);

  const updateAddress = useCallback(async (id, updates) => {
    if (!supabase) return { ok: false, error: 'No supabase' };
    try {
      const { error } = await supabase
        .from('addresses')
        .update(updates)
        .eq('id', id);

      if (error) return { ok: false, error: error.message };
      setAddresses(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
      return { ok: true, error: null };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, []);

  return {
    profile,
    addresses,
    orders,
    loading,
    updateProfile,
    addAddress,
    updateAddress,
    reload: loadProfile,
  };
}
