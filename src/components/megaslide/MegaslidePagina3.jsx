import React from 'react';
import CistellComandaContent from '@/components/fullwide/CistellComandaContent';
import CheckoutContent from '@/components/fullwide/CheckoutContent';

export default function MegaslidePagina3({
  cartItems,
  setCartItems,
  setActive,
  localCartItemCount,
  megaAccordionLocked,
  acordioExpanded,
  setAcordioExpanded,
  touchMegaPublicActivity,
  accordionPautaScale,
}) {
  return (
    <div style={{ width: '25%', flexShrink: 0, display: 'flex', height: '100%', position: 'relative', justifyContent: 'center' }}>
      <div style={{ flex: '1 1 auto' }} />

      <div style={{
        flex: '0 0 auto',
        width: 'var(--hg-mega-w, min(1350px, calc(100vw - 32px)))',
        maxWidth: 'none',
        position: 'relative',
        height: '100%',
        paddingLeft: '0px',
        paddingRight: '0px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          transform: 'scale(0.94)',
          transformOrigin: 'top center',
          width: '100%',
          height: '100%',
          flexShrink: 0,
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
            <CistellComandaContent
              cartItems={cartItems}
              setCartItems={setCartItems}
              onCloseMegaSlide={() => setActive(null)}
              onFinalizeOrder={() => {
                if (localCartItemCount > 0 && !megaAccordionLocked && !acordioExpanded) setAcordioExpanded(true);
                touchMegaPublicActivity();
              }}
            />
          </div>

          <div style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'var(--hg-mega-w, min(1350px, calc(100vw - 32px)))',
            height: '1px',
            background: '#E6E8EC',
            pointerEvents: 'none',
            zIndex: 10,
          }} />

          {!acordioExpanded && (
            <div
              aria-hidden="true"
              data-stripe-guide="accordion-pauta"
              style={{
                position: 'absolute',
                top: 'calc(100% + 1px)',
                left: 0,
                width: '1px',
                height: `${737.015 * accordionPautaScale}px`,
                pointerEvents: 'none',
                opacity: 0,
              }}
            />
          )}

          {!acordioExpanded && localCartItemCount > 0 && (
            <div
              onClick={() => {
                setAcordioExpanded(true);
                touchMegaPublicActivity();
              }}
              style={{
                position: 'absolute',
                bottom: '-50px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0px',
                cursor: 'pointer',
                zIndex: 10,
              }}
            >
              <svg width="30" height="45" viewBox="4 0 16 24" fill="none" stroke="#000" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="4" y1="11" x2="12" y2="17" />
                <line x1="12" y1="17" x2="20" y2="11" />
              </svg>
            </div>
          )}
        </div>

        {acordioExpanded && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            minHeight: '100vh',
            paddingTop: '40px',
            paddingBottom: '40px',
            zIndex: 10,
          }}>
            <div aria-hidden="true" style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100vw',
              height: '100%',
              minHeight: '100vh',
              backgroundColor: 'white',
              pointerEvents: 'none',
              zIndex: -1,
            }} />
            <div data-stripe-guide="accordion-pauta" style={{
              position: 'absolute',
              top: '1px',
              left: '50%',
              transform: `translateX(-50%) scale(${accordionPautaScale * 0.94})`,
              transformOrigin: 'top center',
              width: `calc(100% / (${accordionPautaScale} * 0.94))`,
              height: '900px',
              overflow: 'hidden',
            }}>
              <CheckoutContent
                cartItems={cartItems}
                setCartItems={setCartItems}
                onCloseMegaSlide={() => setActive(null)}
              />
            </div>
          </div>
        )}

        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
          .quantity-row:hover .qty-btn,
          .size-row:hover .size-btn {
            opacity: 1 !important;
          }
        `}</style>
      </div>

      <div style={{ flex: '1 1 auto' }} />
    </div>
  );
}
