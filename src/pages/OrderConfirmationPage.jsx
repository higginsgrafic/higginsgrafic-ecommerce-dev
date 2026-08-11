import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Loader2 } from 'lucide-react';
import { fetchMockOrder } from '@/lib/mockOrderStore';
import OrderConfirmationLayout from '@/components/OrderConfirmationLayout';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    async function fetchOrder() {
      if (!orderId) {
        setError('No s\'ha trobat l\'ID de la comanda');
        setLoading(false);
        return;
      }

      if (import.meta.env.DEV) {
        const mockOrder = fetchMockOrder(orderId);
        if (mockOrder) {
          const items = Array.isArray(mockOrder.items) ? mockOrder.items : [];
          setOrderData({
            id: mockOrder.order_number || mockOrder.id,
            items: items.map((item, idx) => ({
              id: item.id || idx,
              name: item.name || 'Producte',
              size: item.size || '-',
              quantity: item.quantity || 1,
              price: item.price || 0,
            })),
          });
        } else {
          setError('Comanda no trobada');
        }
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/orders?orderNumber=${encodeURIComponent(orderId)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.order) {
          const o = data.order;
          const items = Array.isArray(o.items) ? o.items : (typeof o.items === 'string' ? JSON.parse(o.items) : []);
          setOrderData({
            id: o.order_number || o.id,
            items: items.map((item, idx) => ({
              id: item.id || idx,
              name: item.name || 'Producte',
              size: item.size || '-',
              quantity: item.quantity || 1,
              price: item.price || 0,
            })),
          });
        } else {
          setError('Comanda no trobada');
        }
      } catch (err) {
        console.error('[OrderConfirmation] Error fetching order:', err);
        setError('No s\'ha pogut carregar la comanda');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px', color: '#141414' }}>{error || 'Comanda no trobada'}</p>
          <Link to="/" style={{ display: 'inline-block', marginTop: '16px', padding: '12px 32px', backgroundColor: '#141414', color: '#FFFFFF', textDecoration: 'none', borderRadius: '4px' }}>
            Tornar a l'inici
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Comanda Confirmada #{orderData.id} | GRÀFIC</title>
        <meta name="description" content="La teva comanda s'ha processat correctament" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <OrderConfirmationLayout orderData={orderData} />

      {/* Separació de 300px entre el hero i el footer */}
      <div style={{ height: '300px' }} />
    </>
  );
};

export default OrderConfirmationPage;
