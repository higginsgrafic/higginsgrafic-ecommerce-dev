import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';

/**
 * FranjaEscalada — encaixa la franja (el panell de debò) a la casella on va.
 *
 * El panell te una amplada de disseny propia (la de la filera horitzontal) i una
 * imatge de fons que pot canviar. En comptes de fixar una escala a ma (que es
 * trenca cada cop que canvia la imatge), es mesura el que ocupa la franja i es
 * corregeix l'escala pel quocient amb la casella: aixi sempre n'ocupa exactament
 * l'amplada i l'alcada en surt de la proporcio de la imatge. Tambe es centra
 * verticalment pel que fa la franja, no per la caixa del panell.
 */
export default function FranjaEscalada({ children }) {
  const caixaRef = useRef(null);
  const [mides, setMides] = useState({ escala: 1, dy: 0 });

  const mesura = useCallback(() => {
    const caixa = caixaRef.current;
    if (!caixa) return;
    const interior = caixa.querySelector('[data-stripe-visual-content]');
    if (!interior) return;
    const ampleCaixa = caixa.clientWidth;
    const alcadaCaixa = caixa.clientHeight;
    if (!ampleCaixa || !alcadaCaixa) return;
    // El que s'ha d'encaixar es la imatge de la franja (la samarreta), no la
    // caixa del panell, que es mes alta que el dibuix.
    const imatge = interior.querySelector('img');
    const r = (imatge || interior).getBoundingClientRect();
    if (!r.width || !r.height) return;
    setMides((prev) => {
      // L'escala es corregeix sobre la que ja tenim (el quocient es lineal i
      // convergeix en un pas). El desplacament es calcula en l'espai previ a
      // l'escala i es el que falta perque quedi centrada a la casella.
      const escala = prev.escala * (ampleCaixa / r.width);
      const previ = prev.escala || 1;
      const topActual = (r.top - caixa.getBoundingClientRect().top) / previ;
      const alcadaContingut = r.height / previ;
      const dy = (alcadaCaixa / previ - alcadaContingut) / 2 - topActual;
      const igual = Math.abs(prev.escala - escala) < 0.002 && Math.abs(prev.dy - dy) < 0.5;
      return igual ? prev : { escala, dy };
    });
  }, []);

  useLayoutEffect(() => {
    mesura();
    // Tornem a mesurar al seguent frame: la primera mesura pot ser abans que el
    // navegador hagi aplicat l'escala anterior, i la correccio es queda curta.
    const frame = requestAnimationFrame(mesura);
    const caixa = caixaRef.current;
    if (!caixa) return undefined;
    const observador = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(mesura) : null;
    observador?.observe(caixa);
    window.addEventListener('resize', mesura);
    const imatges = [...caixa.querySelectorAll('img')];
    imatges.forEach((img) => {
      if (!img.complete) img.addEventListener('load', mesura);
    });
    return () => {
      cancelAnimationFrame(frame);
      observador?.disconnect();
      window.removeEventListener('resize', mesura);
      imatges.forEach((img) => img.removeEventListener('load', mesura));
    };
  }, [mesura, children]);

  return (
    <div
      ref={caixaRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          transform: `translateY(${mides.dy}px) scale(${mides.escala})`,
          transformOrigin: 'top center',
          // Els desplaçaments de calibracio de la filera horitzontal no hi son.
          '--megaStripeDx': '0px',
          '--megaStripeDy': '0px',
        }}
      >
        {children}
      </div>
    </div>
  );
}
