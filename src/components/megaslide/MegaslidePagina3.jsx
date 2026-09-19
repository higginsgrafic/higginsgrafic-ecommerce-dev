import React from 'react';
import { useNavigate } from 'react-router-dom';
import CistellComandaContent from '@/components/fullwide/CistellComandaContent';

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
  const navigate = useNavigate();
  const pageHeight = isPortraitTablet && !acordioExpanded ? '269px' : '100%';

  return (
    <div style={{ width: '25%', flexShrink: 0, display: 'block', height: pageHeight, position: 'relative', overflow: isPortraitTablet ? 'hidden' : 'visible', boxShadow: isPortraitTablet ? 'inset 8px 0 0 #ffffff, inset -8px 0 0 #ffffff' : undefined }}>
      <div data-mega-page-viewport="3" style={{
        width: '100%',
        height: pageHeight,
        display: 'flex',
        // Centrat: el contenidor fa la franja central i la franja del header
        // esta centrada, aixi la filera hi cau exactament a sobre.
        justifyContent: 'center',
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
        // El carril, tambe a la vertical: abans `min(100vh - 32px, 70.3vw)` hi
        // donava 540 px i la filera del cistell (1269) hi quedava tallada.
        // El carril, pero mai mes ample que la pantalla: a la vertical el carril
        // fa 992 i la pantalla 768, i el contingut (i el bloc del total) queia
        // fora del centre.
        // La FRANJA central (del logo a la icona d'usuari), que publica el
        // header; mai mes ample que la pantalla.
        width: 'min(var(--hg-band-w, var(--hg-mega-w, 70.3vw)), 100vw)',
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
          // 0,94 es l'ajust de disseny a 1920; per sota, l'escala del carril
          // (`--hg-escala-mega`). Escalar el cistell perque faci la franja
          // exacta engrandia les files a la vertical (1,052) i es va descartar.
          transform: 'scale(min(0.94, var(--hg-escala-mega, 1)))',
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
              transform: 'translateX(0)',
              opacity: 1,
              transition: 'transform 350ms ease-in-out, opacity 300ms ease-in-out',
              pointerEvents: 'auto',
            }}>
              <CistellComandaContent
                cartItems={cartItems}
                setCartItems={setCartItems}
                onCloseMegaSlide={() => setActive(null)}
                onFinalizeOrder={() => {
                  // El pagament ja no viu aquí dins: és una pàgina pròpia
                  // (/checkout) que entra lliscant. Tanquem el panell i hi anem.
                  if (localCartItemCount > 0) {
                    setActive?.(null);
                    navigate('/checkout');
                  }
                }}
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
