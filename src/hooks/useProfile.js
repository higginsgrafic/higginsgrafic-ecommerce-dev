import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/api/supabase-products';
import { useAuth } from '@/contexts/AuthContext';
import { fetchMockOrdersByEmail } from '@/lib/mockOrderStore';

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}-${mm}-${yy}`;
  } catch {
    return '';
  }
}

function formatTotal(num) {
  if (typeof num !== 'number') num = parseFloat(num) || 0;
  return num.toFixed(2).replace('.', ',') + '€';
}

function mapMockOrder(o) {
  return {
    num: o.order_number || o.id,
    status: o.statusLabel || (o.status || 'PENDENT').toUpperCase(),
    date: formatDate(o.created_at),
    total: formatTotal(o.total),
    tracking_number: o.tracking_number || '—',
    raw: o,
  };
}

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
        if (import.meta.env.DEV) {
          const mockOrders = fetchMockOrdersByEmail(user.email);
          setOrders(mockOrders.map(mapMockOrder));
        } else {
          const ordersRes = await fetch(`/api/orders?userId=${encodeURIComponent(user.id)}`);
          if (ordersRes.ok) {
            const ordersData = await ordersRes.json();
            setOrders(ordersData.orders || []);
          } else {
            setOrders([]);
          }
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
