import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import CheckoutContent from '@/components/fullwide/CheckoutContent';
import MegaslideEndGuide from '@/components/dev/MegaslideEndGuide';
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

  // Tauleta apaïsada (768-1366 px i més ampla que alta). Només ella té el
  // contingut pujat 25px; la resta de versions es queden amb el coixí de sempre.
  const [esApaïsat, setEsApaïsat] = useState(
    () => typeof window !== 'undefined'
      && window.innerWidth >= 768
      && window.innerWidth <= 1366
      && window.innerWidth >= window.innerHeight
  );

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setEsApaïsat(w >= 768 && w <= 1366 && w >= window.innerHeight);
    };
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
        // Sense fons propi: la pàgina és blanca com la resta del lloc. Abans hi
        // havia un gris (#F4F6F8) que feia de marc per a les targetes blanques,
        // però el formulari ja es distingeix pels contorns de cada camp.
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <SEO
        title="Pagament | GRÀFIC"
        description="Completa la compra de la teva comanda a Higgins GRÀFIC."
      />

      {/* L'amplada no és un número inventat: és exactament la franja que fa
          servir la capçalera per al seu contingut, del logo a la icona de
          l'usuari. La capçalera s'ancora a `--site-xL` (el marc del lloc) i
          després hi aplica el seu coixí lateral; aquí fem el mateix, amb les
          mateixes classes de coixí que ella (px-4 / sm:px-6 / lg:px-10), així
          que a qualsevol amplada el formulari comença on comença el logo i
          acaba on acaba la icona de l'usuari. Res no pot sobresortir-ne: el
          marc del lloc ja deixa 16px de marge als costats.
          El marge de dalt el posa App (--appHeaderOffset, l'alçada de la
          capçalera) i aquí hi afegim l'aire que queda entre la capçalera i el
          contingut: 28px de sempre. A la tauleta apaïsada són 3px, perquè allà
          el contingut va 25px més amunt (retoc propi d'aquella versió). */}
      <div
        className="px-4 sm:px-6 lg:px-10"
        style={{
          minHeight: '60vh',
          width: 'var(--site-w, 100%)',
          marginLeft: 'calc(var(--site-xL, 0px) - var(--rulerInset, 0px))',
          paddingTop: esApaïsat ? '3px' : '28px',
          paddingBottom: '48px',
          boxSizing: 'border-box',
        }}
      >
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
      {/* Guia de desenvolupament: dibuixa una línia allà on acaba el mega-slide
          quan s'obre el cistell. No la veu mai cap client: només surt en
          desenvolupament o si s'afegeix ?megaslide=1 a l'adreça.
          A la vertical va desactivada: aquella versió ja està congelada i les
          guies hi feien nosa. */}
      {!esVertical && <MegaslideEndGuide />}
    </motion.div>
  );
}
