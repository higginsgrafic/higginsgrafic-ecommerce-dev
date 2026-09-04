import React from 'react';
import CistellComandaContent from '@/components/fullwide/CistellComandaContent';
import CheckoutContent from '@/components/fullwide/CheckoutContent';

export default function MegaslidePagina3({
  isPortraitTablet = false,
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
    <div style={{ width: '25%', flexShrink: 0, display: 'block', height: '100%', position: 'relative', overflow: isPortraitTablet ? 'hidden' : 'visible', boxShadow: isPortraitTablet ? 'inset 8px 0 0 #ffffff, inset -8px 0 0 #ffffff' : undefined }}>
      <div data-mega-page-viewport="3" style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: isPortraitTablet ? 'flex-start' : 'center',
        overflowX: isPortraitTablet ? 'hidden' : 'visible',
        overflowY: isPortraitTablet ? 'hidden' : 'visible',
        overscrollBehaviorX: isPortraitTablet ? 'contain' : undefined,
        WebkitOverflowScrolling: isPortraitTablet ? 'touch' : undefined,
        scrollbarWidth: isPortraitTablet ? 'thin' : undefined,
        touchAction: isPortraitTablet ? 'pan-y' : undefined,
      }}>
      <div style={{ flex: isPortraitTablet ? '0 0 0px' : '1 1 auto' }} />

      <div style={{
        flex: '0 0 auto',
        width: isPortraitTablet ? 'min(1350px, calc(100vh - 32px))' : 'var(--hg-mega-w, min(1350px, calc(100vw - 32px)))',
        maxWidth: 'none',
        position: 'relative',
        height: '100%',
        paddingLeft: '0px',
        paddingRight: '0px',
        display: 'flex',
        flexDirection: 'column',
        overflow: isPortraitTablet ? 'hidden' : 'visible',
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
                isPortraitTablet={isPortraitTablet}
              />
            </div>
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

      <div style={{ flex: isPortraitTablet ? '0 0 0px' : '1 1 auto' }} />
      </div>
    </div>
  );
}
