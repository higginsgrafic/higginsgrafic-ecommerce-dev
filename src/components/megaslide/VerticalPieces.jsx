import React, { useCallback, useEffect, useMemo, useState } from 'react';
import MegaGridDibuixos from '../fullwide/MegaGridDibuixos.jsx';
import { FirstContactDibuix00Buttons, FirstContactDibuix09Buttons } from '../fullwide/firstContactPanels.jsx';
import { CERCADOR_COLLECTIONS, CERCADOR_COLORS } from '../fullwide/CercadorTopBar.jsx';
import { colorGap, colorMida } from '../fullwide/midesGraella.js';

/**
 * VerticalVertical — les DUES composicions de la VISTA VERTICAL del megaslide.
 * -----------------------------------------------------------------------------
 * L'amo ha definit les dues pagines amb una reticula de TRES FILES dins del
 * carril:
 *
 *   PAGINA 1                          PAGINA 2
 *   fila 1: carrusel                  fila 1: graella de dibuixos
 *   fila 2: stripe + fletxes          fila 2: colleccions + colors + stripe
 *   fila 3: stripe + selector         fila 3: colleccions + selector + stripe
 *
 * La graella de colors NOMES es a la pagina 2.
 *
 * LES PECES son les de sempre: `MegaGridDibuixos` (dibuixos),
 * `FirstContactDibuix09Buttons` (fletxes), `FirstContactDibuix00Buttons`
 * (Blanc/Color/Negre) i la graella de colors del cercador. La franja es la de
 * sempre, muntada en 2x7 sobre la imatge `stripe-curta-7+7.png`.
 *
 * LES MIDES
 *
 * A la vertical `--hg-escala-mega` val 1: les mides de disseny son px. El
 * carril es el de la tauleta (992) pero mai mes ample que la finestra menys els
 * coixos de 40+40 (a 768 dona 688).
 */

/** Separacio entre dibuixos i entre blocs, en px. */
export const GAP_PX = 6;
/** L'amplada de referencia del contingut de la tauleta (1024 amb coixos de 40). */
export const CARRIL_TAULETA_PX = 1024 * 0.995 - 80;
/** La imatge de la franja curta (7+7). */
export const FRANJA_VERTICAL_SRC = '/placeholders/tablet-vertical/stripe-curta-7x7.png';
/** Les 7 columnes i 2 files de la franja. */
export const FRANJA_COLUMNES = 7;
export const FRANJA_FILES = 2;
/** Proporcions de les tres columnes de les files 2 i 3. */
const PROP_COLLECCIONS = 0.19;
const PROP_MITJANA = 0.15;

/** L'amplada del carril: la referencia de tauleta, mai mes ampla que la finestra. */
export function ampladaCarril(ampleFinestra) {
  const w = Number.isFinite(ampleFinestra) && ampleFinestra > 0 ? ampleFinestra : CARRIL_TAULETA_PX;
  return Math.max(0, Math.min(CARRIL_TAULETA_PX, w - 80));
}

/** Exportada perque la fan servir les dues pagines. */
export function useCarril() {
  const [carril, setCarril] = useState(() => (
    typeof window !== 'undefined' ? ampladaCarril(window.innerWidth) : 0
  ));
  useEffect(() => {
    const mesura = () => setCarril(ampladaCarril(window.innerWidth));
    mesura();
    window.addEventListener('resize', mesura);
    return () => window.removeEventListener('resize', mesura);
  }, []);
  return carril;
}

/**
 * La FRANJA: 14 samarretes en 2x7, amb la imatge de la franja curta de base i
 * el dibuix de cada casella a sobre. `shirtColor` tenyeix totes les caselles
 * del mateix color (es el que fa la pagina 2 i el que canvia amb la graella de
 * colors).
 */
export function VerticalStripeFranja({
  srcs,
  items,
  selectedItem,
  onSelect,
  shirtColor = null,
  width,
}) {
  return (
    <div
      data-vertical-franja="1"
      data-contorn-bloc="2"
      style={{
        display: 'grid',
        width: width ? `${width}px` : '100%',
        maxWidth: '100%',
        gridTemplateColumns: `repeat(${FRANJA_COLUMNES}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${FRANJA_FILES}, auto)`,
        columnGap: `${GAP_PX}px`,
        rowGap: '8px',
        // La franja s'encabir sempre dins del seu espai: les caselles es
        // reparteixen l'ample que els dona el pare (mai el sobrepassen).
        width: '100%',
        minWidth: 0,
        maxWidth: '100%',
        // La franja te caselles amb `mix-blend-mode`: sense aillar-la, el
        // `multiply` es mesclaria amb el fons de la pagina.
        isolation: 'isolate',
      }}
    >
      {Array.from({ length: FRANJA_COLUMNES * FRANJA_FILES }).map((_, idx) => {
        const src = srcs?.[idx] || null;
        const item = items?.[idx] || null;
        const col = idx % FRANJA_COLUMNES;
        const fila = Math.floor(idx / FRANJA_COLUMNES);
        const seleccionat = Boolean(item && selectedItem === item);
        return (
          <button
            key={`vertical-samarreta-${idx}`}
            type="button"
            data-vertical-samarreta={idx}
            aria-label={typeof item === 'string' ? item : undefined}
            onClick={() => onSelect?.(idx)}
            style={{
              appearance: 'none',
              padding: 0,
              position: 'relative',
              width: '100%',
              height: 'auto',
              // La forma de cada part de la imatge (7x2 sobre 1379x593).
              aspectRatio: '2 / 3',
              overflow: 'hidden',
              border: seleccionat ? '1px solid #C9CDD2' : '1px solid transparent',
              borderRadius: '2px',
              cursor: item ? 'pointer' : 'default',
              boxSizing: 'border-box',
              backgroundImage: `url("${FRANJA_VERTICAL_SRC}")`,
              backgroundSize: `${FRANJA_COLUMNES * 100}% ${FRANJA_FILES * 100}%`,
              backgroundPosition: `${(col / (FRANJA_COLUMNES - 1)) * 100}% ${(fila / (FRANJA_FILES - 1)) * 100}%`,
              backgroundRepeat: 'no-repeat',
            }}
          >
            {src ? (
              <img
                src={encodeURI(src)}
                alt=""
                loading={idx < FRANJA_COLUMNES ? 'eager' : 'lazy'}
                decoding="async"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'top center',
                  display: 'block',
                  pointerEvents: 'none',
                  zIndex: 6,
                }}
              />
            ) : null}
            {shirtColor && shirtColor !== '#FFFFFF' ? (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: shirtColor,
                  mixBlendMode: 'multiply',
                  opacity: 0.9,
                  pointerEvents: 'none',
                  zIndex: 5,
                }}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** La GRAELLA DE COLORS del cercador, tal com es (4 columnes). */
export function VerticalColorsGrid({ selectedColor, onSelectColor, style }) {
  const cerclePx = colorMida(true, false);
  const gapPx = colorGap(true, false);
  return (
    <div
      data-p2-color-grid
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(4, ${cerclePx}px)`,
        gridAutoRows: `${cerclePx}px`,
        gap: `${gapPx}px`,
        ...style,
      }}
    >
      {CERCADOR_COLORS.map(({ slug, hex }) => {
        const selected = slug === selectedColor;
        return (
          <button
            key={slug}
            type="button"
            aria-label={slug}
            onClick={() => onSelectColor?.(slug)}
            style={{
              width: `${cerclePx}px`,
              height: `${cerclePx}px`,
              padding: 0,
              borderRadius: '50%',
              border: '0.5px solid rgba(0,0,0,0.22)',
              outline: selected ? '1px solid #111827' : 'none',
              outlineOffset: '3px',
              backgroundColor: hex,
              boxSizing: 'border-box',
              cursor: 'pointer',
            }}
          />
        );
      })}
      <div
        style={{
          gridColumn: 'span 2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '18px',
          padding: '0 5px',
          borderRadius: '9px',
          backgroundColor: '#FFFFFF',
          border: '0.5px solid rgba(0,0,0,0.22)',
          boxSizing: 'border-box',
        }}
      >
        <span className="font-oswald" style={{ fontWeight: 700, fontSize: '8px', lineHeight: 1, letterSpacing: '0.04em', color: '#2B2B2B', whiteSpace: 'nowrap' }}>
          COLOR
        </span>
      </div>
    </div>
  );
}

/** La LLISTA DE COLLECCIONS, en forma de columna. */
export function VerticalColleccions({ activeKey, onSelect, rows = 9, style }) {
  return (
    <div data-vertical-colleccions="1" style={{ display: 'flex', flexDirection: 'column', minWidth: 0, ...style }}>
      {CERCADOR_COLLECTIONS.slice(0, rows).map(({ key, label }) => {
        const activa = key === activeKey;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect?.(key)}
            aria-current={activa ? 'true' : undefined}
            style={{
              appearance: 'none',
              border: 'none',
              background: activa ? '#F1F3F5' : 'transparent',
              borderRadius: '2px',
              cursor: 'pointer',
              padding: '4px 6px',
              width: '100%',
              textAlign: 'right',
              whiteSpace: 'nowrap',
              fontSize: '10pt',
              lineHeight: 1.15,
              color: activa ? '#1A1A1A' : '#6B7280',
              fontFamily: 'inherit',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** Els botons BLANC / COLOR / NEGRE. */
export function VerticalSelector({
  variant,
  visibility,
  onWhite,
  onBlack,
  onMulti,
}) {
  return (
    <div style={{ width: '100%' }}>
      <FirstContactDibuix00Buttons
        onWhite={onWhite}
        onBlack={onBlack}
        onMulti={onMulti}
        showWhite={visibility?.white !== false}
        showBlack={visibility?.black !== false}
        showMulti={visibility?.color !== false}
        selectedVariant={variant}
        compact
      />
    </div>
  );
}

/** Les fletxes. */
export function VerticalFletxes({ tileSize, onPrev, onNext }) {
  return (
    <FirstContactDibuix09Buttons tileSize={tileSize} onPrev={onPrev} onNext={onNext} />
  );
}

/** La GRAELLA DE DIBUIXOS: tots els dibuixos del cataleg, en ordre del manifest. */
export function VerticalGraellaDibuixos({ active, items, carril }) {
  const [manifest, setManifest] = useState(null);
  useEffect(() => {
    let viu = true;
    fetch('/drawings.grid.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : {}))
      .then((m) => { if (viu) setManifest(m || {}); })
      .catch(() => { if (viu) setManifest({}); });
    return () => { viu = false; };
  }, []);
  const dibuixos = useMemo(() => {
    if (Array.isArray(items) && items.length) return items;
    const out = [];
    for (const llista of Object.values(manifest || {})) {
      for (const ruta of llista) if (typeof ruta === 'string' && ruta) out.push(ruta);
    }
    return out;
  }, [items, manifest]);
  // La casella: les 16 columnes i les 15 separacions del carril. Amb
  // `bloc16x4` la graella son sempre 64 caselles (16 x 4).
  const cellPx = carril ? (carril - 15 * GAP_PX) / 16 : undefined;
  return (
    <MegaGridDibuixos
      active={active}
      className="w-full"
      items={dibuixos}
      cellPx={cellPx}
      bloc16x4
    />
  );
}

/** Utilitat per a les composicions: la reticula de tres files dins del carril. */
export function useReticula(carril) {
  return useMemo(() => ({
    carril,
    colleccions: Math.round(carril * PROP_COLLECCIONS),
    mitjana: Math.round(carril * PROP_MITJANA),
  }), [carril]);
}

/** Exportada per si la pagina 1 necessita el callback dins d'un useCallback. */
export const noop = () => {};
