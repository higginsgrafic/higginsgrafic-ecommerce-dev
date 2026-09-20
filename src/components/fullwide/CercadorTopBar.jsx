import React from 'react';
import { colorGap, colorMida } from './midesGraella.js';

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
  { key: 'austen:pemberley', label: 'PEMBERLEY' },
  { key: 'austen:keep_calm', label: 'KEEP CALM' },
  { key: 'austen:quotes', label: 'QUOTES' },
  { key: 'austen:crosswords', label: 'CROSSWORDS' },
  { key: 'austen:looking_for_my_darcy', label: 'LOOKING FOR MY DARCY' },
  { key: 'cube', label: 'CUBE' },
  { key: 'miscellania', label: 'MISCEL·LÀNIA' },
];

// Ordre i hex mostrejats directament del mockup fons-cercador.webp.
export const CERCADOR_COLORS = [
  { slug: 'white',          hex: '#FFFFFF', overlayHex: '#FFFFFF' },
  { slug: 'light-blue',     hex: '#99AFC6', overlayHex: '#91AEC8' },
  { slug: 'royal',          hex: '#347DCD', overlayHex: '#0071D6' },
  { slug: 'navy',           hex: '#212B42', overlayHex: '#061431' },
  { slug: 'purple',         hex: '#471387', overlayHex: '#3D0083' },
  { slug: 'light-pink',     hex: '#D9C4CC', overlayHex: '#DBBDCA' },
  { slug: 'daisy',          hex: '#EDCC5D', overlayHex: '#F3C72E' },
  { slug: 'gold',           hex: '#E2A13B', overlayHex: '#F19800' },
  { slug: 'red',            hex: '#BD2739', overlayHex: '#CB001D' },
  { slug: 'kiwi',           hex: '#B7CE88', overlayHex: '#A9CC71' },
  { slug: 'irish-green',    hex: '#49A256', overlayHex: '#009C39' },
  { slug: 'military-green', hex: '#607060', overlayHex: '#4F6751' },
  { slug: 'forest-green',   hex: '#2D3B34', overlayHex: '#0F271E' },
  { slug: 'black',          hex: '#000000', overlayHex: '#0D1114' },
];

// Mides responsives en cqw (= 1% de l'amplada de la barra, que coincideix amb
// l'amplada visible del fons).
// Derivades del mockup fons-cercador.webp (amplada 4512px):
//   cercle ple ⌀ 63px img -> 1.396cqw
//   selector 5px img -> 0.111cqw
//   centre-a-centre 153.7px img -> 3.407cqw
//   anell exterior 96px img -> 2.128cqw
//   gap = 3.407 - 2.128 = 1.279cqw
//   padding dret = 2.19cqw - 0.36cqw (mig cercle) ≈ 1.83cqw
const C_CIRCLE = '1.05cqw';
const C_RING_THICKNESS = '0.111cqw';
const C_RING_OUTER = '1.6cqw'; // anell exterior mesurat (96px img)
const C_COLORS_GAP = '1.146cqw'; // 3.407 (centre-a-centre) - 2.128 (ample botó)
const C_COLORS_PAD_RIGHT = '1.2cqw'; // 2.919 (right gap) - 1.064 (mig botó)
const C_OUTLINE = '0.5px solid rgba(0,0,0,0.22)'; // contorn fi (0.5px editor)
// Col·leccions: 5 cel·les iguals. Centres mesurats 233/685/1136/1588/2039px
// (separació uniforme 451.5px = 10.01% de la barra). Zona = 50cqw, marge
// esquerre 7px = 0.155cqw. Font cap-height 25px -> em ~0.78cqw.
const C_COLLECTIONS_WIDTH = '58cqw';
const C_COLLECTIONS_LEFT = 'calc(0.155cqw + 15px)';
const C_COLLECTIONS_FONT = '7pt';

/** La zona de COL·LECCIONS de la barra del cercador. En fila (horitzontal,
 * com a la barra) o en columna (`vertical`, per a la taula del megaslide). */
export function CercadorColleccions({ activeKey, onSelect, vertical = false }) {
  return (
    <div
      data-cercador-colleccions="1"
      style={{
        display: 'flex',
        flexDirection: vertical ? 'column' : 'row',
        alignItems: vertical ? 'stretch' : 'center',
        justifyContent: vertical ? 'flex-start' : 'space-between',
        width: vertical ? '100%' : C_COLLECTIONS_WIDTH,
        marginLeft: vertical ? undefined : C_COLLECTIONS_LEFT,
        height: vertical ? undefined : '100%',
        flexShrink: 0,
      }}
    >
      {CERCADOR_COLLECTIONS.map(({ key, label }) => {
        const isActive = key === activeKey;
        return (
          <button
            key={key}
            type="button"
            onClick={() => {
              if (typeof onSelect === 'function') onSelect(key);
            }}
            aria-current={vertical && isActive ? 'true' : undefined}
            style={{
              appearance: 'none',
              border: 'none',
              background: vertical ? (isActive ? '#F1F3F5' : 'transparent') : 'transparent',
              borderRadius: vertical ? '2px' : undefined,
              cursor: 'pointer',
              position: 'relative',
              flex: '0 0 auto',
              height: vertical ? undefined : '100%',
              width: vertical ? '100%' : undefined,
              display: 'flex',
              alignItems: 'center',
              justifyContent: vertical ? 'flex-start' : 'center',
              padding: vertical ? '3px 6px' : 0,
              textAlign: vertical ? 'left' : undefined,
            }}
          >
            {vertical ? (
              <span
                className="font-roboto-condensed"
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: '9.5pt',
                  fontWeight: isActive ? 700 : 300,
                  letterSpacing: '0.02em',
                  lineHeight: 1.15,
                  color: '#3A3A3A',
                }}
              >
                {label}
              </span>
            ) : (
              <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <span
                  className="font-roboto-condensed"
                  aria-hidden="true"
                  style={{
                    visibility: 'hidden',
                    whiteSpace: 'nowrap',
                    fontSize: C_COLLECTIONS_FONT,
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    lineHeight: 1.1,
                  }}
                >
                  {label}
                </span>
                <span
                  className="font-roboto-condensed"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    whiteSpace: 'nowrap',
                    fontSize: C_COLLECTIONS_FONT,
                    fontWeight: isActive ? 700 : 300,
                    letterSpacing: '0.02em',
                    lineHeight: 1.1,
                    color: '#3A3A3A',
                  }}
                >
                  {label}
                </span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** La zona de COLORS de la barra del cercador. En fila (horitzontal, com a la
 * barra) o en graella de `columnes` columnes (per a la taula del megaslide). */
export function CercadorColors({ selectedColor, onSelectColor, columnes = 0 }) {
  const enGraella = columnes > 0;
  const cerclePx = enGraella ? colorMida(true, false) : null;
  const gapPx = enGraella ? colorGap(true, false) : null;
  const ample = enGraella ? `${cerclePx}px` : C_CIRCLE;
  const ampleAnell = enGraella ? `${cerclePx}px` : C_RING_OUTER;
  return (
    <div
      data-cercador-colors="1"
      style={enGraella
        ? { display: 'grid', gridTemplateColumns: `repeat(${columnes}, ${cerclePx}px)`, gridAutoRows: `${cerclePx}px`, gap: `${gapPx}px`, flexShrink: 0 }
        : { display: 'flex', alignItems: 'center', gap: C_COLORS_GAP, flexShrink: 0, paddingRight: C_COLORS_PAD_RIGHT }}
    >
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
              width: ampleAnell,
              height: ampleAnell,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            <span
              style={{
                display: 'block',
                width: ample,
                height: ample,
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
                  width: ampleAnell,
                  height: ampleAnell,
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
  );
}

function CercadorTopBar({
  activeCollection,
  activeSubcollection,
  onSelectCollection,
  selectedColor = 'white',
  onSelectColor,
  barBg = '#F8F8F8',
}) {
  const activeKey = activeCollection === 'austen'
    ? `austen:${activeSubcollection || ''}`
    : activeCollection;
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
        gap: 12,
        containerType: 'inline-size',
      }}
    >
      {/* Zona de col·leccions i zona de colors: les MATEIXES peces que fa
          servir la taula de la vista vertical (aqui, en fila). */}
      <CercadorColleccions activeKey={activeKey} onSelect={onSelectCollection} />
      <CercadorColors selectedColor={selectedColor} onSelectColor={onSelectColor} />
    </div>
  );
}

export default CercadorTopBar;
