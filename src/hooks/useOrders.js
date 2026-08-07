import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchMockOrdersByEmail } from '@/lib/mockOrderStore';

const STATUS_ICONS = {
  'PENDENT': 'MoreHorizontal',
  'CONFIRMADA': 'Check',
  'EN PREPARACIÓ': 'Loader2',
  'SEGUIMENT': 'Search',
  'EN REPARTIMENT': 'Truck',
  'ATURADA': 'AlertCircle',
  'CANCEL·LADA': 'X',
  'ENTREGADA': 'Package',
};

const STATUS_ACTIVE = {
  'PENDENT': true,
  'CONFIRMADA': true,
  'EN PREPARACIÓ': true,
  'SEGUIMENT': true,
  'EN REPARTIMENT': true,
  'ATURADA': false,
  'CANCEL·LADA': false,
  'ENTREGADA': false,
};

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

function mapOrderFromApi(o) {
  return {
    num: o.order_number || o.id,
    status: o.statusLabel || o.status || 'PENDENT',
    icon: STATUS_ICONS[o.statusLabel] || 'MoreHorizontal',
    date: formatDate(o.created_at),
    total: formatTotal(o.total),
    active: STATUS_ACTIVE[o.statusLabel] !== false,
    raw: o,
  };
}

const MOCK_ORDERS = [
  { num: '#00000000000000000000027', status: 'PENDENT', date: '12-07-26', active: true, total: '45,90€', icon: 'MoreHorizontal' },
  { num: '#00000000000000000000026', status: 'EN PREPARACIÓ', date: '10-07-26', active: true, total: '32,50€', icon: 'Loader2' },
  { num: '#00000000000000000000025', status: 'EN REPARTIMENT', date: '08-07-26', active: true, total: '78,00€', icon: 'Truck' },
  { num: '#00000000000000000000024', status: 'ENTREGADA', date: '03-07-26', active: false, total: '56,75€', icon: 'Package' },
  { num: '#00000000000000000000023', status: 'ENTREGADA', date: '28-06-26', active: false, total: '24,99€', icon: 'Package' },
  { num: '#00000000000000000000022', status: 'CANCEL·LADA', date: '25-06-26', active: false, total: '41,20€', icon: 'X' },
  { num: '#00000000000000000000021', status: 'ENTREGADA', date: '20-06-26', active: false, total: '63,40€', icon: 'Package' },
  { num: '#00000000000000000000020', status: 'ENTREGADA', date: '15-06-26', active: false, total: '18,90€', icon: 'Package' },
];

export function useOrders(email) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const emailRef = useRef(email);

  const fetchOrders = useCallback(async (emailToFetch) => {
    const targetEmail = emailToFetch || emailRef.current;
    if (!targetEmail) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(targetEmail)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.orders && Array.isArray(data.orders)) {
        setOrders(data.orders.map(mapOrderFromApi));
      }
    } catch (err) {
      console.warn('[useOrders] Fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (orderData) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.order) {
      const mapped = mapOrderFromApi(data.order);
      setOrders((prev) => [mapped, ...prev]);
    }
    return data.order;
  }, []);

  const updateOrderStatus = useCallback(async (orderNumber, status) => {
    const res = await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber, status }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.order) {
      const mapped = mapOrderFromApi(data.order);
      setOrders((prev) => prev.map((o) => (o.num === mapped.num ? mapped : o)));
    }
    return data.order;
  }, []);

  useEffect(() => {
    emailRef.current = email;
    if (import.meta.env.DEV) {
      if (email) {
        const mockOrders = fetchMockOrdersByEmail(email);
        setOrders(mockOrders.map(mapOrderFromApi));
      }
      return;
    }
    if (email) fetchOrders(email);
  }, [email, fetchOrders]);

  return { orders, loading, error, fetchOrders, createOrder, updateOrderStatus };
}
