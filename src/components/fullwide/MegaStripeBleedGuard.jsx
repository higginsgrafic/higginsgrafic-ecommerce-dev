import React from 'react';

/**
 * MegaStripeBleedGuard
 * -----------------------------------------------------------------------------
 * Contenidor que permet "sagnar" (bleed) el contingut més enllà dels seus
 * límits horitzontals sense forçar overflow horitzontal al pare. Útil per a
 * panells del mega-slide que han d'ocupar més que l'amplada del seu contenidor
 * sense afectar l'scroll del document.
 *
 * Props:
 *  - heightPx: alçada fixa del bloc.
 *  - debug: si és true, pinta un fons translúcid (per a inspecció visual).
 *  - expandLeftPx, expandRightPx: nombre de px a estendre cap a cada costat.
 *  - children: contingut a renderitzar dins del bleed.
 */
export default function MegaStripeBleedGuard({
  heightPx,
  debug,
  expandLeftPx = 0,
  expandRightPx = 0,
  children,
}) {
  const l = Math.max(0, Number(expandLeftPx) || 0);
  const r = Math.max(0, Number(expandRightPx) || 0);
  const sum = l + r;
  return (
    <div
      style={{
        height: heightPx,
        width: sum ? `calc(100% + ${sum}px)` : '100%',
        maxWidth: 'none',
        position: 'relative',
        left: l ? `-${l}px` : 0,
        overflowY: 'visible',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          overflowX: 'visible',
          overflowY: 'visible',
          backgroundColor: debug ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            overflow: 'visible',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
