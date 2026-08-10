import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { formatPrice } from '@/utils/formatters';
import { fetchMockOrder, createMockOrder } from '@/lib/mockOrderStore';
import { MOCK_CLIENT } from '@/lib/mockOrder';
const HERO_IMAGE = '/placeholders/fons-pagament/fons-confirmacio-pagament.png';

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
        const mockOrder = createMockOrder({
            orderNumber: orderId,
            items: [
              { id: 'item-1', name: 'SENSE AND SENSIBILITY 4', size: 'M', quantity: 1, price: 15.50 },
            ],
            subtotal: 15.50,
            shipping: 0,
            iva: 3.25,
            total: 15.50,
            formData: {
              email: MOCK_CLIENT.email,
              firstName: MOCK_CLIENT.firstName,
              lastName: MOCK_CLIENT.lastName,
              address: MOCK_CLIENT.address,
              city: MOCK_CLIENT.city,
              postalCode: MOCK_CLIENT.postalCode,
              country: MOCK_CLIENT.country,
            },
          });
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

      {/* Hero a pantalla completa amb imatge de fons */}
      <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
        <img
          src={HERO_IMAGE}
          alt="Confirmació de comanda"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Títol LA COMANDA — just sobre la línia divisòria */}
        <div style={{
          position: 'absolute',
          top: 'calc(50% + 14px - 24px - 44px)',
          left: 'calc(33.33% + 83px + 20px)',
          zIndex: 2,
        }}>
          <h2 style={{
            fontFamily: 'Oswald, sans-serif',
            fontSize: '25.34px',
            fontWeight: 500,
            textTransform: 'uppercase',
            color: '#141414',
            margin: 0,
          }}>
            La comanda
          </h2>
        </div>

        {/* Taula de la comanda */}
        <div style={{
          position: 'absolute',
          top: 'calc(50% + 14px)',
          left: 'calc(33.33% + 83px)',
          width: 'calc(33.33% - 166px)',
          height: 'calc(25% + 59.5px)',
          zIndex: 1,
          pointerEvents: 'none',
          display: 'grid',
          gridTemplateRows: 'repeat(15, 1fr)',
          gridTemplateColumns: 'auto 180px auto',
          justifyContent: 'space-between',
          fontFamily: 'Roboto, sans-serif',
          fontSize: '16.1px',
          color: '#141414',
          overflow: 'hidden',
        }}>
          {/* Fila producte */}
          <div style={{ padding: '0 20px', fontWeight: 300, textTransform: 'uppercase', textAlign: 'left', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', minHeight: 0, overflow: 'hidden' }}>
            {orderData.items[0]?.name || 'SENSE AND SENSIBILITY 4'}
          </div>
          <div style={{ padding: '0 20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, overflow: 'hidden' }}>
            <span style={{ display: 'inline-flex', gap: '24px' }}>
              <span style={{ fontWeight: 300, opacity: 0.5 }}>/ {orderData.items[0]?.size || 'M'}</span>
              <span style={{ fontWeight: 300, opacity: 0.5 }}>/ x{orderData.items[0]?.quantity || 1}</span>
            </span>
          </div>
          <div style={{ padding: '0 20px', fontWeight: 300, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minHeight: 0, overflow: 'hidden' }}>
            {formatPrice(orderData.items[0]?.price || 15.50)}
          </div>
          {/* Files buides */}
          {Array.from({ length: 10 }).flatMap((_, i) => [
            <div key={`empty-${i}-0`} />,
            <div key={`empty-${i}-1`} />,
            <div key={`empty-${i}-2`} />,
          ])}
          {/* Preu */}
          <div />
          <div style={{ padding: '0 20px', fontWeight: 400, opacity: 0.7, textAlign: 'left', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', minHeight: 0, overflow: 'hidden' }}>Preu</div>
          <div style={{ padding: '0 20px', fontWeight: 400, opacity: 0.7, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minHeight: 0, overflow: 'hidden' }}>{formatPrice(orderData.subtotal || 15.50)}</div>
          {/* Descompte */}
          <div />
          <div style={{ padding: '0 20px', fontWeight: 400, opacity: 0.7, textAlign: 'left', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', minHeight: 0, overflow: 'hidden' }}>Descompte <span style={{ fontSize: '11.48px' }}>(-10%)</span></div>
          <div style={{ padding: '0 20px', fontWeight: 400, opacity: 0.7, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minHeight: 0, overflow: 'hidden' }}>-1,55 €</div>
          {/* IVA */}
          <div />
          <div style={{ padding: '0 20px', fontWeight: 400, opacity: 0.7, textAlign: 'left', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', minHeight: 0, overflow: 'hidden' }}>IVA 21%</div>
          <div style={{ padding: '0 20px', fontWeight: 400, opacity: 0.7, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minHeight: 0, overflow: 'hidden' }}>3,25 €</div>
          {/* Tot plegat fa */}
          <div />
          <div style={{ padding: '0 20px', fontFamily: 'Oswald, sans-serif', fontSize: '17.5px', fontWeight: 400, textAlign: 'left', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', minHeight: 0, overflow: 'hidden' }}>Tot plegat fa</div>
          <div style={{ padding: '0 20px', fontFamily: 'Oswald, sans-serif', fontSize: '17.5px', fontWeight: 400, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minHeight: 0, overflow: 'hidden' }}>{formatPrice(orderData.total || 15.50)}</div>
        </div>

        {/* Botó — fora del requadre, just a sota */}
        <div style={{
          position: 'absolute',
          top: 'calc(50% + 14px + 25% + 35px + 8px - 13px + 82px)',
          left: 'calc(33.33% + 83px)',
          width: 'calc(33.33% - 166px)',
          zIndex: 2,
        }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 28px',
              backgroundColor: '#141414',
              color: '#FFFFFF',
              textDecoration: 'none',
              borderRadius: '4px',
              fontFamily: 'Oswald, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginRight: '-21px' }}>
              TORNA A LA BOTIGA
              <ArrowRight size={13} strokeWidth={2} />
            </span>
          </Link>
        </div>

        {/* Contingut de confirmació — dues files */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '0 24px',
        }}>
          {/* Fila superior — texts de confirmació */}
          <div style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}>
            {/* Títol */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '23.03px',
                fontWeight: 700,
                lineHeight: 1,
                color: '#141414',
                marginBottom: '8px',
              }}
            >
              Pagament confirmat
            </motion.h1>

            {/* Subtítol */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '34.51px',
                fontWeight: 400,
                color: '#141414',
                opacity: 0.85,
                marginBottom: '4px',
                marginTop: '12px',
              }}
            >
              GRÀCIES PER LA VISITA!
            </motion.p>

            {/* Número de comanda + label, alineats a la dreta */}
            <div style={{ textAlign: 'right' }}>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: '57.54px',
                  fontWeight: 400,
                  color: '#141414',
                  marginBottom: '0px',
                }}
              >
                {orderData.id}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42 }}
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '16.1px',
                  fontWeight: 400,
                  color: '#141414',
                  opacity: 0.7,
                  marginTop: '-2px',
                }}
              >
                Nombre de comanda
              </motion.p>
            </div>
          </div>

          {/* Fila inferior — buida, el contingut va posicionat absolutament */}
          <div style={{ flex: '1' }} />
        </div>
      </div>

      {/* Separació de 300px entre el hero i el footer */}
      <div style={{ height: '300px' }} />
    </>
  );
};

export default OrderConfirmationPage;
