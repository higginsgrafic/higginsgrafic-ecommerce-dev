import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MegaGridDibuixos from '../fullwide/MegaGridDibuixos.jsx';
import { FirstContactDibuix00Buttons } from '../fullwide/firstContactPanels.jsx';
import { CERCADOR_COLLECTIONS, CERCADOR_COLORS } from '../fullwide/CercadorTopBar.jsx';
import { CONTROL_TILE_ARROWS, CONTROL_TILE_BN } from '../fullwide/MegaColumn.jsx';
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
/**
 * L'ORDRE DE LES CINC FILES de la graella: una per colleccio.
 *
 * Es l'ordre de les colleccions del megaslide, que es tambe el de la llista de
 * sota. Cada fila es una instancia de `MegaGridDibuixos` amb els items de la
 * seva colleccio.
 */
const COLLECCIONS_DE_LA_GRAELLA = [
  'first_contact',
  'the_human_inside',
  'austen',
  'cube',
  'miscellania',
];

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
  // l'alçada del panell (l'equivalent del `p1ContentBottom` de l'horitzontal).
  // La mesura no depen de l'amplada del contenidor, perquè la composicio es
  // mesura a ella mateixa i la seva amplada es del carril.
  useEffect(() => {
    if (typeof onAlcadaContingut !== 'function') return undefined;
    const el = rootRef.current;
    if (!el) return undefined;
    const mesura = () => {
      const alt = el.getBoundingClientRect().height;
      if (Number.isFinite(alt) && alt > 0) onAlcadaContingut(alt);
    };
    mesura();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(mesura);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onAlcadaContingut]);

  /**
   * L'ALÇADA DISPONIBLE: el que queda de finestra sota el panell.
   *
   * Si la composicio no hi cap, el desplazament ha de ser VERTICAL i dins del
   * megaslide (no ha d'arrossegar la pàgina de sota). El contenidor del
   * desplaçament té aquesta alçada, i la composicio hi viu a dins.
   */
  const [alcadaDisponible, setAlcadaDisponible] = useState(null);
  useLayoutEffectSafe(() => {
    const mesura = () => {
      const cap = rootRef.current;
      if (!cap) return;
      const guarda = cap.closest('[data-stripe-bottom]');
      if (!guarda) return;
      const caixa = guarda.getBoundingClientRect();
      // El `py-8` (32+32) del contenidor del panell no pot comptar com a espai
      // util: si l'alçada disponible l'inclogués, la composicio no hi cabria.
      const disponible = caixa.height - 64;
      if (Number.isFinite(disponible) && disponible > 0) setAlcadaDisponible(disponible);
    };
    mesura();
    window.addEventListener('resize', mesura);
    const guarda = rootRef.current?.closest('[data-stripe-bottom]');
    const ro = (typeof ResizeObserver !== 'undefined' && guarda) ? new ResizeObserver(mesura) : null;
    try { ro?.observe(guarda); } catch { /* ignore */ }
    return () => {
      window.removeEventListener('resize', mesura);
      ro?.disconnect();
    };
  }, []);

  const variant = active === 'the_human_inside' ? humanInsideVariant : firstContactVariant;

  /**
   * Els items d'una colleccio, sense les caselles de control de la filera.
   *
   * Es retallen a les 16 columnes de la graella: la composicio vertical son
   * CINC files (una per colleccio) i una fila que empeny mes enlla de les 16
   * columnes en fa dues, que es el que desquadrava la graella (l'austen en te
   * 25 i la fila en feia dues). El que no hi cap es veu desplac,ant la filera
   * a la pagina 2 horitzontal.
   */
  const itemsDeColleccio = useCallback((colleccio) => {
    const cols = resolvedMega?.[colleccio];
    if (!Array.isArray(cols) || cols.length === 0) return [];
    const items = cols[0]?.items || [];
    return items
      .filter((it) => it && it !== CONTROL_TILE_BN && it !== CONTROL_TILE_ARROWS)
      .slice(0, GRAELLA_COLUMNES_VERTICAL);
  }, [resolvedMega]);

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
        // que dona la mida a tot el que hi ha a dins. El pare tambe es el
        // carril (vegeu MegaMenuPanel), pero el contenidor del desplacament
        // s'estira amb ell i no ha de decidir cap amplada.
        maxWidth: ampleCarril ? `${ampleCarril}px` : '100%',
        margin: '0 auto',
        height: alcadaDisponible ? `${Math.round(alcadaDisponible)}px` : undefined,
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
      {/* 1) La graella de dibuixos, amplada de carril i a dalt de tot: una fila
          per colleccio (les cinc files del paradigma).
          A cada fila s'hi passen els items SENSE les caselles de control: la
          graella del megaslide les dibuixa amb el seu propi component (la
          botonera i les fletxes), i aquí ocupaven una columna de les 16 i
          deixaven les caselles quadrades a 37 px en comptes de 39,5. */}
      <div style={{ width: '100%' }} data-vertical-graella="1">
        {COLLECCIONS_DE_LA_GRAELLA.map((c) => (
          <MegaGridDibuixos
            key={c}
            active={c}
            className="w-full"
            items={itemsDeColleccio(c)}
            nomesElsDeLaLlista
          />
        ))}
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

            {/* La paleta: els 14 colors en dues files de 7, i la pastilla COLOR
                a sota (es la que diu que la variant es la multicolor). */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                gap: '4px',
                width: '100%',
                marginTop: '2px',
              }}
            >
              {CERCADOR_COLORS.map(({ slug, hex }) => (
                <button
                  key={slug}
                  type="button"
                  aria-label={slug}
                  onClick={() => {
                    setStripeOverlayOverrideActive?.(false);
                    if (active === 'the_human_inside') setHumanInsideVariant?.('color');
                    else setFirstContactVariant?.('color');
                  }}
                  style={{
                    appearance: 'none',
                    padding: 0,
                    width: '100%',
                    aspectRatio: '1 / 1',
                    borderRadius: '9999px',
                    background: hex,
                    border: '1px solid #E6E8EC',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                  }}
                />
              ))}
            </div>
            <div
              style={{
                alignSelf: 'center',
                padding: '2px 10px',
                fontSize: '8pt',
                border: '1px solid #E6E8EC',
                borderRadius: '9999px',
                color: '#4A5057',
                lineHeight: 1.2,
              }}
            >
              COLOR
            </div>
          </div>

          {/* Columna 3: la franja, 14 samarretes en 2 files de 7, sense scroll */}
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
            }}
          >
            {Array.from({ length: 14 }).map((_, idx) => {
              const src = stripeTileOverlaySrcs?.[idx] || null;
              const item = stripeTileItems?.[idx] || null;
              const esSeleccionat = Boolean(item && selectedItem === item);
              return (
                <button
                  key={`vertical-samarreta-${idx}`}
                  type="button"
                  data-vertical-samarreta={idx}
                  aria-label={typeof item === 'string' ? item : undefined}
                  onClick={() => seleccionaSamarreta(idx)}
                  disabled={!src}
                  style={{
                    appearance: 'none',
                    padding: 0,
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1 / 1',
                    overflow: 'hidden',
                    border: esSeleccionat ? '1px solid #C9CDD2' : '1px solid transparent',
                    borderRadius: '2px',
                    background: 'transparent',
                    cursor: src ? 'pointer' : 'default',
                    boxSizing: 'border-box',
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
