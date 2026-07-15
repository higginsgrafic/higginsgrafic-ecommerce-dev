import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import OptimizedImg from './OptimizedImg.jsx';

/**
 * firstContactPanels
 * -----------------------------------------------------------------------------
 * Components UI auxiliars per a la primera pàgina del mega-slide (col·leccions
 * "first_contact", "the_human_inside", "austen", "cube", etc.).
 *
 * Inclou:
 *  - FirstContactStripeMockupPanel: previsualització del dibuix sobre samarreta.
 *    Actualment no es crida des del header però es manté per disponibilitat
 *    futura (assets ja resolts en línia).
 *  - FirstContactDibuix00Buttons: botonera Blanc/Negre/Color (selector de
 *    variant cromàtica). És el "tile BN".
 *  - FirstContactDibuix09Buttons: botonera de fletxes (anterior/següent).
 *    És el "tile ARROWS".
 */

export function FirstContactStripeMockupPanel({
  megaTileSize,
  selectedItem,
  variant,
  resolveSrc,
}) {
  if (!megaTileSize) return null;
  if (!selectedItem) return null;
  if (!resolveSrc) return null;

  const inkSrc = resolveSrc(selectedItem);
  if (!inkSrc) return null;

  const shirtSrc =
    variant === 'white'
      ? '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_black_gpr-4-0_front.png'
      : '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_white_gpr-4-0_front.png';

  const overlayClass =
    selectedItem === 'The Phoenix'
      ? 'scale-[0.43]'
      : selectedItem === 'NX-01'
        ? 'scale-[0.26]'
        : selectedItem === 'NCC-1701'
          ? 'scale-[0.41]'
          : selectedItem === 'NCC-1701-D'
            ? 'scale-[0.54]'
            : selectedItem === 'Wormhole'
              ? 'scale-[0.30]'
              : selectedItem === 'Plasma Escape'
                ? 'scale-[0.30]'
                : selectedItem === "Vulcan's End"
                  ? 'scale-[0.36]'
                  : 'scale-[0.34]';

  return (
    <div
      className="absolute top-0 z-[20]"
      style={{
        width: `${Math.round(megaTileSize * (4 / 3))}px`,
        height: `${megaTileSize}px`,
        right: 0,
      }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-md bg-muted">
        <div className="relative h-full w-full">
          <OptimizedImg src={shirtSrc} alt="" className="absolute inset-0 h-full w-full object-contain" />
          <OptimizedImg
            src={inkSrc}
            alt=""
            className={`absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 object-contain ${overlayClass}`}
          />
        </div>
      </div>
    </div>
  );
}

export function FirstContactDibuix00Buttons({
  onWhite,
  onBlack,
  onMulti,
  showWhite = true,
  showBlack = true,
  showMulti = true,
  selectedVariant,
}) {
  const buttons = [];
  if (showWhite) buttons.push({ key: 'white', label: 'Blanc', onClick: onWhite });
  if (showMulti) buttons.push({ key: 'color', label: 'Color', onClick: onMulti });
  if (showBlack) buttons.push({ key: 'black', label: 'Negre', onClick: onBlack });

  if (!buttons.length) return null;

  const selectedIndex = Math.max(0, buttons.findIndex((b) => b.key === selectedVariant));
  const slotPct = 100 / buttons.length;
  const sliderTopPct = selectedIndex * slotPct;
  const sliderHeightPct = slotPct;

  return (
    <div
      className="relative mt-2 aspect-square w-full"
      data-stripe-buttonbar="bn"
      style={{
        border: '1px solid #D1D5DB',
        borderRadius: '6px',
        backgroundColor: '#F3F4F6',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {buttons.map((btn, i) => {
        const topPct = i * slotPct;
        return (
          <button
            key={btn.key}
            type="button"
            aria-label={btn.label}
            onClick={btn.onClick}
            className="absolute left-0 w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              top: `${topPct}%`,
              height: `${slotPct}%`,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            <span
              className="font-oswald"
              style={{
                fontSize: '14px',
                fontWeight: 400,
                textTransform: 'uppercase',
                color: selectedIndex === i ? '#1A1A1A' : '#6B7280',
                pointerEvents: 'none',
                lineHeight: 1,
                transition: 'color 200ms ease',
              }}
            >
              {btn.label}
            </span>
          </button>
        );
      })}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '3px',
          right: '3px',
          top: `calc(${sliderTopPct}% + 3px)`,
          height: `calc(${sliderHeightPct}% - 6px)`,
          backgroundColor: '#FFFFFF',
          borderRadius: '4px',
          border: '1px solid #D1D5DB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          boxSizing: 'border-box',
          pointerEvents: 'none',
          transition: 'top 200ms cubic-bezier(0.32, 0.72, 0, 1)',
          zIndex: 1,
        }}
      />
    </div>
  );
}

export function FirstContactDibuix09Buttons({
  onPrev,
  onNext,
  tileSize,
  onPrevPointerDown,
  onPrevPointerUp,
  onNextPointerDown,
  onNextPointerUp,
}) {
  const hasPrevPointerHandlers = typeof onPrevPointerDown === 'function' || typeof onPrevPointerUp === 'function';
  const hasNextPointerHandlers = typeof onNextPointerDown === 'function' || typeof onNextPointerUp === 'function';

  return (
    <div className="relative mt-2 aspect-square w-full">
      <div className="absolute inset-0 overflow-hidden rounded-md bg-muted" id="stripe-guide-right-anchor">
        <button
          type="button"
          aria-label="Anterior"
          onClick={hasPrevPointerHandlers ? undefined : onPrev}
          onPointerDown={onPrevPointerDown}
          onPointerUp={onPrevPointerUp}
          onPointerCancel={onPrevPointerUp}
          onPointerLeave={onPrevPointerUp}
          className="absolute left-0 top-0 h-full w-1/2 bg-transparent hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft
            className="pointer-events-none absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-foreground/80"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          aria-label="Següent"
          id="stripe-guide-right-arrow"
          onClick={hasNextPointerHandlers ? undefined : onNext}
          onPointerDown={onNextPointerDown}
          onPointerUp={onNextPointerUp}
          onPointerCancel={onNextPointerUp}
          onPointerLeave={onNextPointerUp}
          className="absolute right-0 top-0 h-full w-1/2 bg-transparent hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronRight
            className="pointer-events-none absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-foreground/80"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}
