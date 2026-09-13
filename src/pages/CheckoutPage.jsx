import React, { useEffect, useRef, useState } from 'react';
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

  // Important: només mirem si el cistell és buit EN ENTRAR. Si ho féssim de
  // manera contínua, en buidar-se el cistell just després de pagar aquesta
  // comprovació s'activaria i enviaria el client a l'inici, trepitjant la
  // navegació cap a la pàgina de confirmació (passava exactament això).
  const buitEnEntrar = useRef(getTotalItems() === 0).current;

  // El formulari de pagament té tres dissenys: ordinador, tauleta apaïsada i
  // tauleta vertical. Als mòbils (menys de 768 px) s'ha de fer servir la
  // recepta vertical: amb la d'ordinador les quatre columnes no hi caben i el
  // formulari surt tallat.
  const [esVertical, setEsVertical] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 1366 && window.innerHeight >= window.innerWidth
  );

  useEffect(() => {
    const onResize = () => setEsVertical(window.innerWidth < 1366 && window.innerHeight >= window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (buitEnEntrar) navigate('/', { replace: true });
  }, [buitEnEntrar, navigate]);

  if (buitEnEntrar) return null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', ease: [0.32, 0.72, 0, 1], duration: 0.42 }}
      style={{
        minHeight: '100%',
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

      {/* El contingut va per sota de la capçalera del mega-slide: el marge de
          dalt el posa App (--appHeaderOffset) i aquí hi afegim una mica d'aire
          perquè el formulari quedi clarament dessota. */}
      <div style={{ minHeight: '60vh', width: '100%', maxWidth: '1120px', margin: '0 auto', padding: '28px 24px 48px', boxSizing: 'border-box' }}>
        <CheckoutContent
          cartItems={cartItems}
          setCartItems={setCartItems}
          // En una pàgina no hi ha cap panell a tancar: el CheckoutContent
          // crida aquesta funció just després de pagar, i tot seguit navega a
          // la pàgina de confirmació. Si aquí tanquéssim o navegéssim, ens
          // menjaríem aquesta navegació.
          onCloseMegaSlide={() => {}}
          isPortraitTablet={esVertical}
        />
      </div>
    </motion.div>
  );
}
