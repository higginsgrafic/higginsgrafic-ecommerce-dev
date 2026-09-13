import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import CheckoutContent from '@/components/fullwide/CheckoutContent';
import { useCart } from '@/contexts/CartContext';

/**
 * Pàgina de pagament.
 *
 * PER QUÈ ÉS UNA PÀGINA I NO UN PANELL
 *
 * Abans el pagament vivia dins del mega-slide, com una segona cara del
 * carretó. Això volia dir que no tenia adreça pròpia: no es podia refrescar,
 * el botó "enrere" no funcionava i no es podia saber en quin punt abandonava
 * la gent el procés de compra. A més, el formulari depenia de l'estat intern
 * del panell, cosa que va arribar a trencar el pagament.
 *
 * Ara és una pàgina de debò (/checkout) que entra lliscant des de la dreta,
 * perquè el gest sigui el mateix que obrir el carretó, però amb adreça pròpia.
 *
 * El formulari és el mateix component de sempre (CheckoutContent): no
 * s'ha reescrit res, només ha canviat de lloc.
 */
export default function CheckoutPage() {
  const { cartItems, setCartItems, getTotalItems } = useCart();
  const navigate = useNavigate();

  const buit = getTotalItems() === 0;

  // Sense res al cistell no hi ha res a pagar: tornem a la botiga en comptes
  // d'ensenyar un formulari de pagament buit.
  useEffect(() => {
    if (buit) navigate('/', { replace: true });
  }, [buit, navigate]);

  if (buit) return null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', ease: [0.32, 0.72, 0, 1], duration: 0.42 }}
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#F4F6F8',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <SEO
        title="Pagament | GRÀFIC"
        description="Completa la compra de la teva comanda a Higgins GRÀFIC."
      />

      {/* La capçalera del mega-slide queda amagada mentre es paga (vegeu
          App.jsx): aquí dalt hi ha només una manera discreta de tornar. */}
      <button
        type="button"
        onClick={() => navigate('/')}
        style={{
          position: 'fixed',
          top: '18px',
          left: '18px',
          zIndex: 50,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          border: '1px solid #E6E8EC',
          borderRadius: '4px',
          backgroundColor: '#FFFFFF',
          color: '#4A5057',
          fontFamily: 'Oswald, sans-serif',
          fontSize: '11pt',
          textTransform: 'uppercase',
          letterSpacing: '0.4px',
          cursor: 'pointer',
        }}
      >
        ← Tornar a la botiga
      </button>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '72px 24px 32px' }}>
        <CheckoutContent
          cartItems={cartItems}
          setCartItems={setCartItems}
          // En una pàgina no hi ha cap panell a tancar: el CheckoutContent
          // crida aquesta funció just després de pagar, i tot seguit navega a
          // la pàgina de confirmació. Si aquí tanquéssim o navegéssim, ens
          // menjaríem aquesta navegació.
          onCloseMegaSlide={() => {}}
          isPortraitTablet={false}
        />
      </div>
    </motion.div>
  );
}
