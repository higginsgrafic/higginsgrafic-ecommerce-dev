import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { formatPrice } from '@/utils/formatters';
import { fetchMockOrder } from '@/lib/mockOrderStore';
import Pauta4ColsOverlay from '@/components/pauta/Pauta4ColsOverlay';

const HERO_IMAGE = '/placeholders/fons-confirmacio-comanda.png';

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
            subtotal: parseFloat(mockOrder.subtotal) || 0,
            shipping: parseFloat(mockOrder.shipping_cost) || 0,
            total: parseFloat(mockOrder.total) || 0,
          });
          setLoading(false);
          return;
        }
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
            subtotal: parseFloat(o.subtotal) || 0,
            shipping: parseFloat(o.shipping_cost) || 0,
            total: parseFloat(o.total) || 0,
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

      {/* Hero amb fons fixe i confirmació a dins */}
      <Pauta4ColsOverlay
        pautaEnabled={false}
        tableEnabled={false}
        numCols={3}
        numRows={24}
        canvasAspect={[2642, 1780]}
        topOffset="76px"
        bottomPadding="0px"
      >
        {/* Imatge de fons + contingut de confirmació al mateix contenidor */}
        <div
          style={{
            gridColumn: '1 / 4',
            gridRow: '5 / 20',
            position: 'relative',
            top: `calc(-5px)`,
            width: 'calc(100% + 1px)',
            height: 'calc(100% + 2px)',
            transform: 'scale(0.94)',
            transformOrigin: 'center center',
            borderRadius: '18px',
            overflow: 'hidden',
          }}
        >
          <img
            src={HERO_IMAGE}
            alt="Confirmació de comanda"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {/* Contingut de confirmació a sobre de la imatge */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 24px',
              textAlign: 'center',
              marginTop: '50px',
            }}
          >
          {/* Títol */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              fontFamily: 'Oswald, sans-serif',
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              fontWeight: 700,
              textTransform: 'uppercase',
              lineHeight: 1,
              color: '#FFFFFF',
              marginBottom: '10px',
              textShadow: '0 2px 8px rgba(0,0,0,0.6)',
            }}
          >
            Comanda confirmada!
          </motion.h1>

          {/* Subtítol */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            style={{
              fontFamily: 'Roboto Condensed, sans-serif',
              fontSize: 'clamp(0.9rem, 1.8vw, 1.15rem)',
              color: '#FFFFFF',
              opacity: 0.85,
              marginBottom: '6px',
              textShadow: '0 1px 4px rgba(0,0,0,0.6)',
            }}
          >
            Sia servit i gràcies
          </motion.p>

          {/* Número de comanda */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              fontFamily: 'Roboto Condensed, sans-serif',
              fontSize: '13px',
              color: '#FFFFFF',
              opacity: 0.7,
              marginBottom: '75px',
              textShadow: '0 1px 4px rgba(0,0,0,0.6)',
            }}
          >
            Número de comanda: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{orderData.id}</span>
          </motion.p>

          {/* Resum de la comanda */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            style={{
              width: '100%',
              maxWidth: '480px',
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '10px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
              padding: '20px',
              marginBottom: '20px',
              textAlign: 'left',
              backdropFilter: 'blur(8px)',
            }}
          >
            <h2 style={{
              fontFamily: 'Oswald, sans-serif',
              fontSize: '16px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#141414',
              marginBottom: '14px',
            }}>
              Resum de la comanda
            </h2>

            {/* Productes */}
            <div style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid #E6E8EC' }}>
              {orderData.items.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: index === orderData.items.length - 1 ? 0 : '6px' }}>
                  <div>
                    <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, textTransform: 'uppercase', fontSize: '13px', color: '#141414' }}>{item.name}</span>
                    <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12px', color: '#141414', opacity: 0.5, marginLeft: '6px' }}>
                      {item.size} · {item.quantity}u
                    </span>
                  </div>
                  <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: '#141414' }}>{formatPrice(item.price)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#141414', opacity: 0.7 }}>
                <span>Subtotal</span>
                <span>{formatPrice(orderData.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#141414', opacity: 0.7 }}>
                <span>Enviament</span>
                <span>{orderData.shipping === 0 ? 'Gratuït' : formatPrice(orderData.shipping)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', marginTop: '3px', borderTop: '1px solid #E6E8EC', fontFamily: 'Oswald, sans-serif', fontSize: '18px', color: '#141414' }}>
                <span>Tot plegat fa</span>
                <span>{formatPrice(orderData.total)}</span>
              </div>
            </div>
          </motion.div>

          </div>
        </div>
      </Pauta4ColsOverlay>

      {/* Botó continua comprant — fora de la hero, a la part de sota */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 36px',
              backgroundColor: '#141414',
              color: '#FFFFFF',
              textDecoration: 'none',
              borderRadius: '5px',
              fontFamily: 'Roboto Condensed, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
            }}
          >
            Continua comprant
            <ArrowRight size={18} strokeWidth={2} />
          </Link>
        </motion.div>
      </div>

      {/* Separació de 300px entre el hero i el footer */}
      <div style={{ height: '300px' }} />
    </>
  );
};

export default OrderConfirmationPage;
