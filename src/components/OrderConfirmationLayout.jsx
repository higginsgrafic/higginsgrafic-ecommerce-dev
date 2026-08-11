import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { formatPrice } from '@/utils/formatters';
import { useOffersConfig } from '@/hooks/useOffersConfig';

const OrderConfirmationLayout = ({
  orderData,
  heroImage = '/placeholders/fons-pagament/fons-confirmacio-pagament.png',
  backToUrl = '/',
  backToLabel = 'TORNA A LA BOTIGA',
  title = 'Pagament confirmat',
  subtitle = 'GRÀCIES PER LA VISITA!',
  orderLabel = 'Nombre de comanda',
  ivaRate = '21%',
}) => {
  const offersConfig = useOffersConfig();
  const discountEnabled = offersConfig.discountEnabled;
  const discountRate = offersConfig.discountRate / 100;
  const discountLabel = `-${offersConfig.discountRate}%`;
  const VISIBLE_ROWS = 11;
  const productsRef = useRef(null);
  const [rowHeight, setRowHeight] = useState(0);
  const [scrollIndex, setScrollIndex] = useState(0);
  const isScrolling = useRef(false);

  if (!orderData) return null;

  const items = orderData.items || [];
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (item.quantity || 1), 0);
  const discountAmount = discountEnabled ? subtotal * discountRate : 0;
  const totalPlegat = subtotal - discountAmount;
  const ivaAmount = totalPlegat * 0.21;
  const maxScroll = Math.max(0, items.length - VISIBLE_ROWS);

  useEffect(() => {
    const el = productsRef.current;
    if (!el) return;
    const measure = () => setRowHeight(el.clientHeight / VISIBLE_ROWS);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    const el = productsRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      e.preventDefault();
      if (isScrolling.current || maxScroll === 0) return;
      isScrolling.current = true;
      setScrollIndex(prev => {
        if (e.deltaY > 0) return Math.min(prev + 1, maxScroll);
        return Math.max(prev - 1, 0);
      });
      setTimeout(() => { isScrolling.current = false; }, 250);
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [maxScroll]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <img
        src={heroImage}
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

      {/* Productes — àrea scrollable (11 files visibles) */}
      <div
        ref={productsRef}
        style={{
          position: 'absolute',
          top: 'calc(50% + 14px)',
          left: 'calc(33.33% + 83px)',
          width: 'calc(33.33% - 166px)',
          height: 'calc((25% + 59.5px) * 11 / 15)',
          zIndex: 1,
          overflow: 'hidden',
          pointerEvents: 'auto',
        }}
      >
        <div style={{
          transform: `translateY(-${scrollIndex * rowHeight}px)`,
        }}>
          {items.map((item, idx) => (
            <div key={idx} style={{
              height: rowHeight > 0 ? `${rowHeight}px` : 'auto',
              display: 'grid',
              gridTemplateColumns: '1fr 90px 90px auto',
              justifyContent: 'space-between',
              fontFamily: 'Roboto, sans-serif',
              fontSize: '16.1px',
              color: '#141414',
            }}>
              <div style={{ padding: '0 20px', fontWeight: 300, textTransform: 'uppercase', textAlign: 'left', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', overflow: 'hidden', }}>
                {item.name || 'Producte'}
              </div>
              <div style={{ padding: '0 20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                <span style={{ fontWeight: 300, opacity: 0.5 }}>{item.size || '-'}</span>
              </div>
              <div style={{ padding: '0 20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                <span style={{ fontWeight: 300, opacity: 0.5 }}>x{item.quantity || 1}</span>
              </div>
              <div style={{ padding: '0 20px', fontWeight: 300, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', }}>
                {formatPrice(item.price || 0)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resum — fixe (4 files) */}
      <div style={{
        position: 'absolute',
        top: 'calc(50% + 14px + (25% + 59.5px) * 11 / 15)',
        left: 'calc(33.33% + 83px)',
        width: 'calc(33.33% - 166px)',
        height: `calc((25% + 59.5px) * ${discountEnabled ? 4 : 3} / 15)`,
        zIndex: 1,
        display: 'grid',
        gridTemplateRows: `repeat(${discountEnabled ? 4 : 3}, 1fr)`,
        gridTemplateColumns: '1fr 90px 90px auto',
        justifyContent: 'space-between',
        fontFamily: 'Roboto, sans-serif',
        fontSize: '16.1px',
        color: '#141414',
        overflow: 'hidden',
        pointerEvents: 'auto',
      }}>
        {/* Preu */}
        <div />
        <div style={{ padding: '0 20px', fontWeight: 400, opacity: 0.7, textAlign: 'left', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', minHeight: 0, overflow: 'hidden', gridColumn: '2 / 4' }}>Preu</div>
        <div style={{ padding: '0 20px', fontWeight: 400, opacity: 0.7, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minHeight: 0, overflow: 'hidden', }}>{formatPrice(subtotal)}</div>
        {discountEnabled && (<>
        {/* Descompte */}
        <div />
        <div style={{ padding: '0 20px', fontWeight: 400, opacity: 0.7, textAlign: 'left', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', minHeight: 0, overflow: 'hidden', gridColumn: '2 / 4' }}>Descompte&nbsp;<span style={{ fontSize: '11.48px' }}>({discountLabel})</span></div>
        <div style={{ padding: '0 20px', fontWeight: 400, opacity: 0.7, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minHeight: 0, overflow: 'hidden', }}>-{formatPrice(discountAmount)}</div>
        </>)}
        {/* IVA */}
        <div />
        <div style={{ padding: '0 20px', fontWeight: 400, opacity: 0.7, textAlign: 'left', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', minHeight: 0, overflow: 'hidden', gridColumn: '2 / 4' }}>IVA {ivaRate}</div>
        <div style={{ padding: '0 20px', fontWeight: 400, opacity: 0.7, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minHeight: 0, overflow: 'hidden', }}>{formatPrice(ivaAmount)}</div>
        {/* Tot plegat fa */}
        <div />
        <div style={{ padding: '0 20px', fontFamily: 'Oswald, sans-serif', fontSize: '17.5px', fontWeight: 400, textAlign: 'left', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', minHeight: 0, overflow: 'hidden', gridColumn: '2 / 4' }}>Tot plegat fa</div>
        <div style={{ padding: '0 20px', fontFamily: 'Oswald, sans-serif', fontSize: '17.5px', fontWeight: 400, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minHeight: 0, overflow: 'hidden', }}>{formatPrice(totalPlegat)}</div>
      </div>

      {/* Botó — fora del requadre, just a sota */}
      <div style={{
        position: 'absolute',
        top: 'calc(50% + 14px + 25% + 35px + 8px - 13px + 82px)',
        left: 'calc(33.33% + 83px)',
        width: 'calc(33.33% - 166px)',
        zIndex: 2,
        pointerEvents: 'auto',
      }}>
        <Link
          to={backToUrl}
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
            {backToLabel}
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
        pointerEvents: 'none',
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
              pointerEvents: 'auto',
            }}
          >
            {title}
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
              pointerEvents: 'auto',
            }}
          >
            {subtitle}
          </motion.p>

          {/* Número de comanda + label, alineats a la dreta */}
          <div style={{ textAlign: 'right', pointerEvents: 'auto' }}>
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
                pointerEvents: 'auto',
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
                pointerEvents: 'auto',
              }}
            >
              {orderLabel}
            </motion.p>
          </div>
        </div>

        {/* Fila inferior — buida, el contingut va posicionat absolutament */}
        <div style={{ flex: '1', pointerEvents: 'none' }} />
      </div>
    </div>
  );
};

export default OrderConfirmationLayout;
