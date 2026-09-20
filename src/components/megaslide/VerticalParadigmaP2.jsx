import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MegaGridDibuixos from '../fullwide/MegaGridDibuixos.jsx';
import { FirstContactDibuix00Buttons } from '../fullwide/firstContactPanels.jsx';
import { CercadorColorsGrid } from '../fullwide/CercadorTextRow.jsx';
import { CERCADOR_COLLECTIONS } from '../fullwide/CercadorTopBar.jsx';
import { FRANJA_VERTICAL_SRC } from '../fullwide/MegaStripePanelP1.jsx';
import { CONTROL_TILE_ARROWS, CONTROL_TILE_BN } from '../fullwide/MegaColumn.jsx';
import { colorGap, colorMida } from '../fullwide/midesGraella.js';
import { computeStripeTileItems, computeStripeTileOverlaySrcs } from '@/utils/resolveStripeTile.js';
import {
  GAP_COLUMNES_PX,
  GAP_FRANJA_PX,
  GAP_FRANJA_VERTICAL_PX,
  GAP_GRAELLA_PX,
  GRAELLA_COLUMNES_VERTICAL,
  ampladaCarrilVertical,
  columnesVertical,
} from '../fullwide/paradigmaVertical.js';

/**
 * VerticalParadigmaP2 — la pagina 1 del megaslide a la VISTA VERTICAL.
 * -----------------------------------------------------------------------------
 * Es la composicio que l'amo va validar a `/lab/vertical`, traslladada dins del
 * megaslide i amb les peces de debò:
 *
 *   1. La graella de dibuixos, amb l'amplada del carril i a dalt de tot. Les
 *      cinc colleccions hi munten una fila cadascuna (cinc instancies de
 *      `MegaGridDibuixos`, que ja reparteix l'amplada en 16 columnes).
 *   2. A sota, tres columnes: la llista de colleccions, els botons
 *      Blanc/Color/Negre amb la paleta, i la franja de samarretes.
 *   3. La franja son 14 samarretes en 2 files de 7, sense scroll i amb les
 *      imatges de debò (les del dibuix de la samarreta, que son les mateixes
 *      que pinta la franja horitzontal de la pagina 2 quan `stripeTileOverlaySrcs`
 *      hi arriba).
 *
 * PER QUE ES UNA PECA A PART
 *
 * La pila del belt (`--megaStripeDx/Dy/Scale` i el `transform` de la franja)
 * es la maquetacio horitzontal i aqui no s'hi ha de fer servir: a la vertical
 * el contingut no es desplac,a, es una composicio estatica dins del carril.
 * Per aixo la branca viu en aquest fitxer i no omple de condicionals la pila
 * compartida.
 *
 * TOTES LES MIDES SURTEN DEL CARRIL
 *
 * Les proporcions son a `paradigmaVertical.js` (funcio pura, amb proves). A la
 * vertical `--hg-escala-mega` val 1, aixi que les mides de disseny son px.
 */
export default function VerticalParadigmaP2({
  active,
  resolvedMega,
  showStripe = true,
  stripeVariantVisibility,
  humanInsideVariant = 'black',
  firstContactVariant = 'black',
  displayedShirtColor = 'white',
  resolvedOverlaySrc,
  austenSubcollection,
  austenSelectedDisableMulti = false,
  selectedItem,
  onSelectCollectionKey,
  cercadorSelectedColor = 'white',
  onSelectColor,
  setStripeOverlayOverrideActive,
  setFirstContactVariant,
  setHumanInsideVariant,
  setFirstContactSelectedItem,
  setHumanInsideSelectedItem,
  setSelectedItemByCollection,
  onAlcadaContingut,
}) {
  const rootRef = useRef(null);
  const [ampleCarril, setAmpleCarril] = useState(() => (
    typeof window !== 'undefined' ? ampladaCarrilVertical(window.innerWidth) : 0
  ));

  // L'amplada del carril: es mesura de la propia composicio, que es qui la
  // conte. Aixi el primer pintat ja te la mida bona i el residu es 0.
  useLayoutEffectSafe(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const mesura = () => {
      const w = el.clientWidth;
      if (Number.isFinite(w) && w > 0) setAmpleCarril((prev) => (Math.abs(prev - w) < 0.5 ? prev : w));
    };
    mesura();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', mesura);
      return () => window.removeEventListener('resize', mesura);
    }
    const ro = new ResizeObserver(mesura);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const columnes = useMemo(() => columnesVertical(ampleCarril), [ampleCarril]);

  // L'alçada NATURAL de la composicio: la fa servir el pare per decidir
  // l'alçada del panell (l'equivalent del `p1ContentBottom` de l'horitzontal) i
  // tambe es l'alçada del contenidor del desplacament. Nomes depen del
  // contingut, no de l'espai que queda: sense aixo el bucle entre les dues
  // alçades les deixava oscil·lant un px.
  const [alcadaNaturalPx, setAlcadaNaturalPx] = useState(null);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const mesura = () => {
      const alt = el.getBoundingClientRect().height;
      if (Number.isFinite(alt) && alt > 0) {
        const arrodonida = Math.round(alt);
        setAlcadaNaturalPx((prev) => (prev != null && Math.abs(prev - arrodonida) < 1 ? prev : arrodonida));
        if (typeof onAlcadaContingut === 'function') onAlcadaContingut(arrodonida);
      }
    };
    mesura();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(mesura);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onAlcadaContingut]);

  const variant = active === 'the_human_inside' ? humanInsideVariant : firstContactVariant;

  /**
   * Els items d'una colleccio, sense les caselles de control de la filera.
   *
   * Són els MATEIXOS que els de la filera del cercador: la graella de dibuixos
   * es la peça original i no s'hi ha de filtrar res.
   */
  const itemsDeColleccio = useCallback((colleccio) => {
    const cols = resolvedMega?.[colleccio];
    if (!Array.isArray(cols) || cols.length === 0) return [];
    const items = cols[0]?.items || [];
    return items.filter((it) => it && it !== CONTROL_TILE_BN && it !== CONTROL_TILE_ARROWS);
  }, [resolvedMega]);

  /**
   * La mida de la casella de la GRAELLA DE DIBUIXOS: la que fa que les 16
   * columnes omplin l'amplada del carril (`GRAELLA_COLUMNES_VERTICAL` caselles
   * i 15 separacions de 6 px), que es el que demana el paradigma: la graella
   * fa tota l'amplada del carril.
   */
  const casellaDibuix = useMemo(() => {
    if (!ampleCarril) return undefined;
    return (ampleCarril - (GRAELLA_COLUMNES_VERTICAL - 1) * 6) / GRAELLA_COLUMNES_VERTICAL;
  }, [ampleCarril]);

  /**
   * Les 14 samarretes de la franja, amb la seva imatge de debò.
   *
   * Els items dibuixables surten de la colleccio activa (sense les caselles de
   * control), i la imatge de cada tile la resol `computeStripeTileOverlaySrcs`,
   * la MATEIXA funcio que fa servir la resta de la pagina 2: aixi les
   * samarretes de la vertical i les de l'horitzontal son les mateixes.
   *
   * Es fa servir la llista SENCERA de la colleccio (no la filtrada per
   * subcolleccio): a la vertical la graella de dalt ensenya les cinc
   * colleccions de cop i la franja n'ha de ser la mostra, com a la maqueta.
   */
  const drawable = useMemo(() => itemsDeColleccio(active), [itemsDeColleccio, active]);

  const stripeTileOverlaySrcs = useMemo(() => {
    if (drawable.length === 0) return null;
    return computeStripeTileOverlaySrcs({
      drawable,
      variant,
      active,
      displayedShirtColor,
      resolvedOverlaySrc,
    });
  }, [drawable, variant, active, displayedShirtColor, resolvedOverlaySrc]);

  const stripeTileItems = useMemo(() => {
    if (drawable.length === 0) return null;
    return computeStripeTileItems(drawable);
  }, [drawable]);

  // La colleccio activa a la llista: a l'austen mana la subcolleccio.
  const clauActiva = active === 'austen' ? `austen:${austenSubcollection || ''}` : active;

  const triaColleccio = useCallback((key) => {
    if (typeof onSelectCollectionKey !== 'function') return;
    onSelectCollectionKey(key);
  }, [onSelectCollectionKey]);

  /**
   * Tria un color de la paleta.
   *
   * Fa el mateix que a la filera del cercador: canvia el color triat de la
   * pagina 2 (que es qui mana a la franja) i, de passada, posa la variant
   * multicolor, que es la que ensenya el dibuix de color.
   */
  const triaColor = useCallback((slug) => {
    if (typeof onSelectColor === 'function') onSelectColor(slug);
    setStripeOverlayOverrideActive?.(false);
    if (active === 'the_human_inside') setHumanInsideVariant?.('color');
    else setFirstContactVariant?.('color');
  }, [onSelectColor, setStripeOverlayOverrideActive, active, setHumanInsideVariant, setFirstContactVariant]);

  /**
   * Tria una samarreta de la franja.
   *
   * Fa el MATEIX que triar-la a la filera horitzontal (`onSelectItem` de
   * `MegaColumn`): deixa la samarreta triada a la colleccio activa, que es qui
   * mana al hero i a la resta de la pagina. La navegacio cap a la fitxa no es
   * fa aqui: al megaslide la navegacio la porta el desplegable de la fitxa, i
   * fer-la en triar la samarreta trauria l'usuari del panell.
   */
  const seleccionaSamarreta = useCallback((idx) => {
    const item = stripeTileItems?.[idx];
    if (!item) return;
    if (typeof setStripeOverlayOverrideActive === 'function') setStripeOverlayOverrideActive(false);
    if (active === 'first_contact' && typeof setFirstContactSelectedItem === 'function') setFirstContactSelectedItem(item);
    else if (active === 'the_human_inside' && typeof setHumanInsideSelectedItem === 'function') setHumanInsideSelectedItem(item);
    else if (typeof setSelectedItemByCollection === 'function') setSelectedItemByCollection((prev) => ({ ...prev, [active]: item }));
  }, [active, stripeTileItems, setStripeOverlayOverrideActive, setFirstContactSelectedItem, setHumanInsideSelectedItem, setSelectedItemByCollection]);

  return (
    <div
      data-vertical-scroll="1"
      style={{
        width: '100%',
        // L'amplada NO es la del contenidor (a la vertical fa 992 px, que es el
        // tauler de l'apaisada): la composicio viu dins del CARRIL, que es el
        // que dona la mida a tot el que hi ha a dins.
        maxWidth: ampleCarril ? `${ampleCarril}px` : '100%',
        margin: '0 auto',
        // L'alçada es la NATURAL de la composicio, no la que queda de pantalla:
        // si fos la disponible, l'alçada de la composicio en depengués i el
        // bucle es quedava oscil·lant un px. El que no hi cap ho retalla el
        // viewport del panell, que es qui te l'alçada de la pantalla.
        height: alcadaNaturalPx ? `${Math.round(alcadaNaturalPx)}px` : undefined,
        overflowY: 'auto',
        overflowX: 'hidden',
        overscrollBehaviorY: 'contain',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        boxSizing: 'border-box',
      }}
    >
    <div
      ref={rootRef}
      data-vertical-composicio="1"
      style={{
        width: ampleCarril ? `${ampleCarril}px` : '100%',
        maxWidth: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        rowGap: 0,
        fontFamily: 'Roboto Condensed, sans-serif',
        color: '#4A5057',
      }}
    >
      {/* 1) La graella de dibuixos, amplada de carril i a dalt de tot.
          Es la graella ORIGINAL (`MegaGridDibuixos`) i es UN SOL BLOC de
          16 columnes x 4 files (64 caselles), amb els dibuixos de la colleccio
          activa: es el 16x4 de sempre. Les caselles que no tenen dibuix hi son
          buides i el que no hi cap no es mostra. */}
      <div style={{ width: '100%' }} data-vertical-graella="1">
        <MegaGridDibuixos
          active={active}
          className="w-full"
          items={itemsDeColleccio(active)}
          cellPx={casellaDibuix}
          bloc16x4
        />
      </div>

      {/* 2) Les tres columnes, a sota la graella. */}
      {showStripe ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `${columnes.colleccions}px ${columnes.botons}px ${columnes.franja}px`,
            columnGap: `${GAP_COLUMNES_PX}px`,
            marginTop: `${GAP_GRAELLA_PX}px`,
            alignItems: 'start',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Columna 1: la llista de colleccions */}
          <div data-vertical-colleccions="1" style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {CERCADOR_COLLECTIONS.map(({ key, label }) => {
              const activa = key === clauActiva;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => triaColleccio(key)}
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

          {/* Columna 2: els botons Blanc/Color/Negre i, a sota, la paleta */}
          <div data-vertical-botons="1" style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
            <div style={{ width: '100%' }}>
              <FirstContactDibuix00Buttons
                onWhite={() => { setStripeOverlayOverrideActive?.(false); if (active === 'the_human_inside') setHumanInsideVariant?.('white'); else setFirstContactVariant?.('white'); }}
                onBlack={() => { setStripeOverlayOverrideActive?.(false); if (active === 'the_human_inside') setHumanInsideVariant?.('black'); else setFirstContactVariant?.('black'); }}
                onMulti={() => { setStripeOverlayOverrideActive?.(false); if (active === 'the_human_inside') setHumanInsideVariant?.('color'); else setFirstContactVariant?.('color'); }}
                showWhite={stripeVariantVisibility?.white !== false}
                showBlack={stripeVariantVisibility?.black !== false}
                showMulti={stripeVariantVisibility?.color !== false && !austenSelectedDisableMulti}
                selectedVariant={variant}
                compact
              />
            </div>

            {/* La paleta: la GRAELLA DE COLORS del cercador, la mateixa peça
                (`CercadorColorsGrid`): els mateixos cercles, la mateixa
                separació, el mateix anell del color triat i la pastilla COLOR.
                Les mides són les de la filera del cercador. */}
            <CercadorColorsGrid
              selectedColor={cercadorSelectedColor}
              onSelectColor={triaColor}
              cerclePx={colorMida(true, false)}
              colorGapPx={colorGap(true, false)}
              isPortraitTablet
              style={{ marginTop: '6px' }}
            />
          </div>

          {/* Columna 3: la franja, 14 samarretes en 2 files de 7, sense scroll.
              La BASE es la franja curta de la vertical (`FRANJA_VERTICAL_SRC`):
              un sol fitxer amb les 14 samarretes blanques, una per casella. Cada
              casella ensenya la seva part de la imatge amb `background-position`
              (7 columnes x 2 files) i, a sobre, el dibuix de la variant. */}
          <div
            data-vertical-franja="1"
            data-stripe-visual-content="2"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(7, minmax(0, 1fr))`,
              gridTemplateRows: 'auto auto',
              columnGap: `${GAP_FRANJA_PX}px`,
              rowGap: `${GAP_FRANJA_VERTICAL_PX}px`,
              minWidth: 0,
              // `isolate`: la franja te caselles amb `mix-blend-mode` (el color
              // de la samarreta) i sense aixo el `multiply` es mesclava amb el
              // fons de la pagina i deixava una banda blanca fins a la dreta.
              isolation: 'isolate',
            }}
          >
            {Array.from({ length: 14 }).map((_, idx) => {
              const src = stripeTileOverlaySrcs?.[idx] || null;
              const item = stripeTileItems?.[idx] || null;
              const esSeleccionat = Boolean(item && selectedItem === item);
              const col = idx % 7;
              const fila = Math.floor(idx / 7);
              return (
                <button
                  key={`vertical-samarreta-${idx}`}
                  type="button"
                  data-vertical-samarreta={idx}
                  aria-label={typeof item === 'string' ? item : undefined}
                  onClick={() => seleccionaSamarreta(idx)}
                  style={{
                    appearance: 'none',
                    padding: 0,
                    position: 'relative',
                    width: '100%',
                    height: 'auto',
                    // Cada casella te la forma de la seva part de la imatge
                    // (7 columnes x 2 files sobre 1379x593).
                    aspectRatio: '2 / 3',
                    overflow: 'hidden',
                    border: esSeleccionat ? '1px solid #C9CDD2' : '1px solid transparent',
                    borderRadius: '2px',
                    cursor: item ? 'pointer' : 'default',
                    boxSizing: 'border-box',
                    backgroundImage: `url("${FRANJA_VERTICAL_SRC}")`,
                    backgroundSize: '700% 200%',
                    backgroundPosition: `${(col / 6) * 100}% ${(fila / 1) * 100}%`,
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  {src ? (
                    <img
                      src={encodeURI(src)}
                      alt=""
                      loading={idx < 7 ? 'eager' : 'lazy'}
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
                      }}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
    </div>
  );
}

/**
 * `useLayoutEffect` en el navegador i `useEffect` a la resta.
 *
 * La composicio es mesura abans de pintar perque el primer pintat ja surti amb
 * l'amplada bona; en un entorn sense DOM (les proves) no hi ha res a mesurar i
 * l'avís de React no hi ha de sortir.
 */
function useLayoutEffectSafe(effect, deps) {
  return (typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect)(effect, deps);
}
