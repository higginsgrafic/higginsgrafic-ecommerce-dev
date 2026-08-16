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
          position: 'absolute',
          top: 0,
          left: 0,
        }}>

          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '106.4%', overflow: 'visible' }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              transform: acordioExpanded ? 'translateX(-100%)' : 'translateX(0)',
              opacity: acordioExpanded ? 0 : 1,
              transition: 'transform 350ms ease-in-out, opacity 300ms ease-in-out',
              pointerEvents: acordioExpanded ? 'none' : 'auto',
            }}>
              <CistellComandaContent
                cartItems={cartItems}
                setCartItems={setCartItems}
                onCloseMegaSlide={() => setActive(null)}
                onFinalizeOrder={() => {
                  if (localCartItemCount > 0 && !acordioExpanded) setAcordioExpanded(true);
                }}
              />
            </div>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              transform: acordioExpanded ? 'translateX(0)' : 'translateX(100%)',
              opacity: acordioExpanded ? 1 : 0,
              transition: 'transform 350ms ease-in-out, opacity 300ms ease-in-out',
              pointerEvents: acordioExpanded ? 'auto' : 'none',
            }}>
              <CheckoutContent
                cartItems={cartItems}
                setCartItems={setCartItems}
                onCloseMegaSlide={() => setActive(null)}
                onBackToCart={() => setAcordioExpanded(false)}
              />
            </div>
          </div>

        </div>

        {/* Toggle CISTELL / PAGAMENT — fora del megaslide, a sota, com el selector de la pàgina 2 */}
        <div style={{
          position: 'relative',
          zIndex: 3,
          display: 'flex',
          marginTop: '409px',
          padding: '0 40px',
          justifyContent: 'center',
        }}>
          <div style={{
            display: 'flex',
            backgroundColor: '#f3f4f6',
            padding: '2px',
            borderRadius: 'clamp(2.81px, 0.8vw, 5.06px)',
            border: '1px solid #e5e7eb',
            width: '100%',
            maxWidth: '202px',
            boxSizing: 'border-box',
          }}>
            {['CISTELL', 'PAGAMENT'].map((opt) => {
              const isActive = (opt === 'CISTELL' && !acordioExpanded) || (opt === 'PAGAMENT' && acordioExpanded);
              const isDisabled = opt === 'PAGAMENT' && localCartItemCount === 0;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (opt === 'CISTELL') setAcordioExpanded(false);
                    else if (opt === 'PAGAMENT' && localCartItemCount > 0) setAcordioExpanded(true);
                  }}
                  style={{
                    flex: 1,
                    fontFamily: 'Oswald, sans-serif',
                    fontSize: '8.1pt',
                    fontWeight: isActive ? 400 : 300,
                    letterSpacing: '0em',
                    lineHeight: 1,
                    textTransform: 'none',
                    color: isDisabled ? '#d1d5db' : (isActive ? '#111827' : '#9ca3af'),
                    backgroundColor: isActive ? '#ffffff' : 'transparent',
                    border: 'none',
                    borderRadius: 'clamp(2.11px, 0.6vw, 3.8px)',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.5 : 1,
                    transition: 'all 150ms ease',
                    boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '5px 0',
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

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
