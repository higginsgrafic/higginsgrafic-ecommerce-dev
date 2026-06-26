import React from 'react';

/**
 * CercadorTopBar
 * -----------------------------------------------------------------------------
 * Barra superior del cercador (pàgina 2 del megaslide). Tres parts:
 *  1. Barra grisa (contenidor arrodonit).
 *  2. Zona de col·leccions (esquerra): text Roboto Condensed 9,4pt Light;
 *     el selector és un rectangle blanc darrere la col·lecció activa.
 *  3. Zona de colors (dreta): un cercle per color; el selector és un cercle
 *     negre de 3px de gruix, concèntric i lleugerament separat del color.
 */

export const CERCADOR_COLLECTIONS = [
  { key: 'first_contact', label: 'FIRST CONTACT' },
  { key: 'the_human_inside', label: 'THE HUMAN INSIDE' },
  { key: 'austen', label: 'AUSTEN' },
  { key: 'cube', label: 'CUBE' },
  { key: 'miscellania', label: 'MISCEL·LÀNIA' },
];

// Ordre i hex mostrejats directament del mockup fons-cercador.png.
export const CERCADOR_COLORS = [
  { slug: 'white', hex: '#FFFFFF' },
  { slug: 'light-blue', hex: '#99AFC6' },
  { slug: 'royal', hex: '#347DCD' },
  { slug: 'navy', hex: '#212B42' },
  { slug: 'purple', hex: '#471387' },
  { slug: 'light-pink', hex: '#D9C4CC' },
  { slug: 'daisy', hex: '#EDCC5D' },
  { slug: 'gold', hex: '#E2A13B' },
  { slug: 'red', hex: '#BD2739' },
  { slug: 'kiwi', hex: '#B7CE88' },
  { slug: 'irish-green', hex: '#49A256' },
  { slug: 'military-green', hex: '#607060' },
  { slug: 'forest-green', hex: '#2D3B34' },
  { slug: 'black', hex: '#000000' },
];

// Mides responsives en cqw (= 1% de l'amplada de la barra, que coincideix amb
// l'amplada visible del fons).
// Derivades del mockup fons-cercador.png (amplada 4512px):
//   cercle ple ⌀ 63px img -> 1.396cqw
//   selector 5px img -> 0.111cqw
//   centre-a-centre 153.7px img -> 3.407cqw
//   anell exterior 96px img -> 2.128cqw
//   gap = 3.407 - 2.128 = 1.279cqw
//   padding dret = 2.19cqw - 0.36cqw (mig cercle) ≈ 1.83cqw
const C_CIRCLE = '1.396cqw';
const C_RING_THICKNESS = '0.111cqw';
const C_RING_OUTER = '2.128cqw'; // anell exterior mesurat (96px img)
const C_COLORS_GAP = '1.279cqw'; // 3.407 (centre-a-centre) - 2.128 (ample botó)
const C_COLORS_PAD_RIGHT = '1.83cqw'; // 2.919 (right gap) - 1.064 (mig botó)
const C_OUTLINE = '0.5px solid rgba(0,0,0,0.22)'; // contorn fi (0.5px editor)
// Col·leccions: 5 cel·les iguals. Centres mesurats 233/685/1136/1588/2039px
// (separació uniforme 451.5px = 10.01% de la barra). Zona = 50cqw, marge
// esquerre 7px = 0.155cqw. Font cap-height 25px -> em ~0.78cqw.
const C_COLLECTIONS_WIDTH = '50cqw';
const C_COLLECTIONS_LEFT = '0.155cqw';
const C_COLLECTIONS_FONT = '0.78cqw';

function CercadorTopBar({
  activeCollection,
  onSelectCollection,
  selectedColor = 'white',
  onSelectColor,
  barBg = '#F8F8F8',
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: barBg,
        borderRadius: 0,
        padding: 0,
        height: 38,
        boxSizing: 'border-box',
        gap: 24,
        containerType: 'inline-size',
      }}
    >
      {/* Zona de col·leccions: 5 cel·les iguals (10cqw c/u, 50cqw total),
          text centrat; el seleccionat mostra un rectangle blanc inset. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          width: C_COLLECTIONS_WIDTH,
          marginLeft: C_COLLECTIONS_LEFT,
          height: '100%',
          flexShrink: 0,
        }}
      >
        {CERCADOR_COLLECTIONS.map(({ key, label }) => {
          const isActive = key === activeCollection;
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (typeof onSelectCollection === 'function') onSelectCollection(key);
              }}
              style={{
                appearance: 'none',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                position: 'relative',
                flex: '1 1 0',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              {isActive ? (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: '2%',
                    right: '2%',
                    top: '12%',
                    bottom: '12%',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 3,
                    pointerEvents: 'none',
                  }}
                />
              ) : null}
              <span
                className="font-roboto-condensed"
                style={{
                  position: 'relative',
                  zIndex: 1,
                  whiteSpace: 'nowrap',
                  fontSize: C_COLLECTIONS_FONT,
                  fontWeight: isActive ? 700 : 300,
                  letterSpacing: '0.04em',
                  lineHeight: 1,
                  color: '#3A3A3A',
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Zona de colors */}
      <div style={{ display: 'flex', alignItems: 'center', gap: C_COLORS_GAP, flexShrink: 0, paddingRight: C_COLORS_PAD_RIGHT }}>
        {CERCADOR_COLORS.map(({ slug, hex }) => {
          const isSelected = slug === selectedColor;
          return (
            <button
              key={slug}
              type="button"
              aria-label={slug}
              onClick={() => {
                if (typeof onSelectColor === 'function') onSelectColor(slug);
              }}
              style={{
                appearance: 'none',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                position: 'relative',
                width: C_RING_OUTER,
                height: C_RING_OUTER,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              <span
                style={{
                  display: 'block',
                  width: C_CIRCLE,
                  height: C_CIRCLE,
                  borderRadius: '50%',
                  backgroundColor: hex,
                  border: C_OUTLINE,
                  boxSizing: 'border-box',
                }}
              />
              {isSelected ? (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: C_RING_OUTER,
                    height: C_RING_OUTER,
                    borderRadius: '50%',
                    borderStyle: 'solid',
                    borderColor: '#000000',
                    borderWidth: C_RING_THICKNESS,
                    boxSizing: 'border-box',
                    pointerEvents: 'none',
                  }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CercadorTopBar;
