import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Pauta4ColsOverlay from '@/components/pauta/Pauta4ColsOverlay';
import CollectionProductCard from '@/components/tdp/CollectionProductCard';
import TambeRail from '@/pages/nikeTambe/TambeRail';
import RespescaTitle from '@/pages/nikeTambe/RespescaTitle';
import CarouselArrows from '@/pages/nikeTambe/CarouselArrows';
import Breadcrumbs from '@/components/Breadcrumbs';
import EditableTextBox from '@/components/dev/EditableTextBox';
import { useDebugOverlays } from '@/hooks/useDebugOverlays';

const PDP_PRESET_VERSION = 'pdp-layout-2026-06-06-1953';

const PDP_TITLE_SETTINGS = {
  x: 0, y: 0, fontFamily: 'Oswald', fontSize: 24, fontWeight: 300, selectedFontWeight: 700,
  letterSpacing: 0.04, lineHeight: 1, textAlign: 'left', verticalAlign: 'bottom',
  color: '#475059', textTransform: 'uppercase',
};
const PDP_COLLECTION_SETTINGS = {
  x: 0, y: 0, fontFamily: 'Roboto Condensed', fontSize: 8, fontWeight: 400, selectedFontWeight: 700,
  letterSpacing: 0.2, lineHeight: 1.2, textAlign: 'left', verticalAlign: 'top',
  color: 'rgba(71, 80, 89, 0.7)', textTransform: 'uppercase',
};
const PDP_DESCRIPTION_SETTINGS = {
  x: 0, y: 0, fontFamily: 'Roboto', fontSize: 16, fontWeight: 300, selectedFontWeight: 700,
  letterSpacing: 0.03, lineHeight: 1.65, textAlign: 'left', verticalAlign: 'top',
  color: '#111827', textTransform: 'none',
};
const PDP_PRICE_SETTINGS = {
  x: 0, y: 0, fontFamily: 'Oswald', fontSize: 24, fontWeight: 200, selectedFontWeight: 700,
  letterSpacing: 0, lineHeight: 1, textAlign: 'left', verticalAlign: 'center',
  color: '#475059', textTransform: 'none',
};
const PDP_CTA_SETTINGS = {
  x: 0, y: 0, fontFamily: 'Oswald', fontSize: 12, fontWeight: 300, selectedFontWeight: 400,
  letterSpacing: 0.04, lineHeight: 1, textAlign: 'center', verticalAlign: 'center',
  color: '#475059', textTransform: 'uppercase',
};
const PDP_SIZE_SETTINGS = {
  x: 0, y: 0, fontFamily: 'Oswald', fontSize: 12, fontWeight: 300, selectedFontWeight: 400,
  letterSpacing: 0, lineHeight: 1, textAlign: 'center', verticalAlign: 'center',
  color: '#475059', textTransform: 'none',
};
const PDP_SPECS_HEADING_SETTINGS = {
  x: 0, y: 0, fontFamily: 'Oswald', fontSize: 24, fontWeight: 300, selectedFontWeight: 700,
  letterSpacing: 0.04, lineHeight: 1, textAlign: 'right', verticalAlign: 'bottom',
  color: '#475059', textTransform: 'uppercase',
};
const PDP_SPEC_LABEL_SETTINGS = {
  x: 0, y: 0, fontFamily: 'Roboto Condensed', fontSize: 8, fontWeight: 700, selectedFontWeight: 700,
  letterSpacing: 0.2, lineHeight: 1.2, textAlign: 'right', verticalAlign: 'bottom',
  color: '#111827', textTransform: 'uppercase',
};
const PDP_SPEC_VALUE_SETTINGS = {
  x: 0, y: 0, fontFamily: 'Roboto', fontSize: 16, fontWeight: 300, selectedFontWeight: 700,
  letterSpacing: 0.03, lineHeight: 1.2, textAlign: 'right', verticalAlign: 'top',
  color: 'rgba(71, 80, 89, 0.7)', textTransform: 'none',
};


// =============================================================================
//  Constructor PDP — pàgina de detall de producte (plantilla)
// -----------------------------------------------------------------------------
//  Còpia neta de la base HTML amb tots els elements posicionats com a
//  grid-items directes dins de `Pauta4ColsOverlay`. Cap wrapper, cap state
//  global de calibratge: la pauta és el contracte universal i cada element
//  ocupa unes files i columnes explícites.
// =============================================================================

const TDP_IMAGE = (color) =>
  `/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_${color}_gpr-4-0_front.png`;

const PRODUCT_DESCRIPTION = [
  "Mereixedors són d'honor, glòria e de fama e contínua bona memòria los",
  'hòmens virtuosos, e singularment aquells qui per la república lluitaren.',
].join(' ');

// 14 colors oficials Gildan 5000 en l'ordre de la stripe (MegaStripe).
const OFFICIAL_COLORS = [
  'white', 'light-blue', 'royal', 'navy', 'purple', 'light-pink', 'daisy',
  'gold', 'red', 'kiwi', 'irish-green', 'military-green', 'forest-green', 'black',
];
const THUMB_COUNT = OFFICIAL_COLORS.length;

const SPECS = [
  { label: 'Material', value: '100 cotó pentinat 180/gm2', row: 9 },
  { label: 'Tall', value: 'Crew unisex regular', row: 11 },
  { label: 'Procedència', value: 'Bangladesh certificat', row: 13 },
  { label: 'Estampació', value: 'Serigrafia manual aigua', row: 15 },
  { label: 'Cura', value: 'Rentar del revés a 30°C', row: 17 },
  { label: 'Garantia', value: 'Devolució 30 dies', row: 19 },
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const FINISHES = ['BLANC', 'COLOR', 'NEGRE'];

function ConstructorPdpPage() {
  const {
    pdpControlsEnabled,
    pautaEnabled,
    setPautaEnabled,
    tableEnabled,
    setTableEnabled,
    pautaOpacity,
    setPautaOpacity,
    tableOpacity,
    setTableOpacity,
  } = useDebugOverlays();

  const [selectedFinish, setSelectedFinish] = useState('COLOR');
  const [finishButtonTextSettings, setFinishButtonTextSettings] = useState(PDP_SIZE_SETTINGS);

  const [selectedSize, setSelectedSize] = useState('M');
  const [sizeButtonTextSettings, setSizeButtonTextSettings] = useState(PDP_SIZE_SETTINGS);
  const [ctaTextSettings, setCtaTextSettings] = useState(PDP_CTA_SETTINGS);
  const [mainVariantIndex, setMainVariantIndex] = useState(0);
  const goPrevVariant = () => setMainVariantIndex((i) => (i - 1 + OFFICIAL_COLORS.length) % OFFICIAL_COLORS.length);
  const goNextVariant = () => setMainVariantIndex((i) => (i + 1) % OFFICIAL_COLORS.length);
  const mainVariantColor = OFFICIAL_COLORS[mainVariantIndex];

  const pautaGridRef = useRef(null);
  const [rowHeight, setRowHeight] = useState(38);
  // Alçada EXACTA d'una fila de la pauta real (70 files) per dimensionar les
  // fletxes "També et pot interessar" exactament com l'alçada d'una fila.
  const [exactRowHeight, setExactRowHeight] = useState(38);
  const [copiedDesign, setCopiedDesign] = useState(false);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const measure = () => {
      const gridEl = pautaGridRef.current;
      if (!gridEl) return;
      const rect = gridEl.getBoundingClientRect();
      const numRows = 65; // Nombre canònic de files de la PDP
      const singleRowH = rect.height / numRows;
      setRowHeight((prev) => (Math.abs(prev - singleRowH) < 0.1 ? prev : singleRowH));
      // Alçada exacta d'una fila del grid real (numRows={70}, gutterY=3px)
      const gridRows = 70;
      const rowGap = 3;
      const exactRowH = (rect.height - (gridRows - 1) * rowGap) / gridRows;
      setExactRowHeight((prev) => (Math.abs(prev - exactRowH) < 0.1 ? prev : exactRowH));
    };

    measure();
    window.addEventListener('resize', measure);
    // També mesurem una miqueta després perquè s'hagin carregat imatges o layouts inicials
    const t = setTimeout(measure, 100);
    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(t);
    };
  }, []);

  const updateState = (patch) => {
    if ('pautaEnabled' in patch) setPautaEnabled(patch.pautaEnabled);
    if ('tableEnabled' in patch) setTableEnabled(patch.tableEnabled);
    if ('pautaOpacity' in patch) setPautaOpacity(patch.pautaOpacity);
    if ('tableOpacity' in patch) setTableOpacity(patch.tableOpacity);
  };

  return (
    <section className="bg-background">
      <Helmet>
        <title>PDP · Constructor | Higgins Gràfic</title>
        <meta
          name="description"
          content="Constructor pàgina de detall de producte: pauta de 4 columnes amb tots els elements (carrusel, fitxa tècnica, outro, més peces)."
        />
      </Helmet>

      <Pauta4ColsOverlay
        numRows={70}
        canvasAspect={[2642, 5217]}
        pautaEnabled={false}
        tableEnabled={false}
        topOffset="0px"
        bottomPadding="0px"
        innerRef={pautaGridRef}
        style={{
          zIndex: 5,
          position: 'relative',
          marginBottom: 'calc(-2 * (var(--hg-tdp-xR) - var(--hg-tdp-xL)) * 5217 / 2642 / 70 - 23px)',
        }}
      >
        {/* ─── Breadcrumbs (col 1, fila 1 — cantonada superior esquerra del belt2) ─── */}
        <div
          className="[&_ol]:pl-0 [&_nav]:p-0"
          style={{
            gridColumn: '1 / 5',
            gridRow: '2 / 3',
            minHeight: 0,
            alignSelf: 'start',
            justifySelf: 'start',
            padding: 0,
            margin: 0,
            transform: 'translateY(-10px)',
          }}
        >
          <Breadcrumbs
            items={[
              { label: 'Col·lecció', link: '/constructor/colleccio' },
              { label: 'Nom de producte' },
            ]}
          />
        </div>

        {/* ─── Bloc producte: títol + descripció + talles + CTA (col 4 — dreta) ─── */}
        <EditableTextBox
          id="pdp-product-name"
          initialText="NOM DE PRODUCTE"
          initialSettings={PDP_TITLE_SETTINGS}
          presetVersion={PDP_PRESET_VERSION}
          renderHandle={pdpControlsEnabled}
          handleRight="-22px"
          style={{ gridColumn: '4 / 5', gridRow: '6 / 7', alignSelf: 'end' }}
        />

        <EditableTextBox
          id="pdp-collection-name"
          initialText="NOM DE COL·LECCIÓ"
          initialSettings={PDP_COLLECTION_SETTINGS}
          presetVersion={PDP_PRESET_VERSION}
          renderHandle={pdpControlsEnabled}
          handleRight="-22px"
          style={{ gridColumn: '4 / 5', gridRow: '7 / 8', alignSelf: 'start' }}
        />

        <EditableTextBox
          id="pdp-product-description"
          initialText={PRODUCT_DESCRIPTION}
          initialSettings={PDP_DESCRIPTION_SETTINGS}
          presetVersion={PDP_PRESET_VERSION}
          multiline
          renderHandle={pdpControlsEnabled}
          handleRight="-22px"
          style={{ gridColumn: '4 / 5', gridRow: '9 / 14' }}
        />

        <EditableTextBox
          id="pdp-price"
          initialText="15,50€"
          initialSettings={PDP_PRICE_SETTINGS}
          presetVersion={PDP_PRESET_VERSION}
          renderHandle={pdpControlsEnabled}
          handleRight="-22px"
          style={{ gridColumn: '4 / 5', gridRow: '14 / 15', alignSelf: 'center' }}
        />

        <div
          style={{
            gridColumn: '4 / 5',
            gridRow: '16 / 17',
            minHeight: 0,
            alignSelf: 'center',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              backgroundColor: '#f3f4f6',
              padding: '2px',
              borderRadius: 'clamp(2.81px, 0.8vw, 5.06px)',
              border: '1px solid #e5e7eb',
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
            }}
          >
            {SIZES.map((size) => {
              const isSelected = size === selectedSize;
              return (
                <button
                  key={`size-${size}`}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  style={{
                    flex: 1,
                    fontFamily: `${sizeButtonTextSettings.fontFamily}, sans-serif`,
                    fontSize: `${sizeButtonTextSettings.fontSize}pt`,
                    fontWeight: isSelected ? sizeButtonTextSettings.selectedFontWeight : sizeButtonTextSettings.fontWeight,
                    letterSpacing: `${sizeButtonTextSettings.letterSpacing}em`,
                    lineHeight: sizeButtonTextSettings.lineHeight,
                    textTransform: sizeButtonTextSettings.textTransform,
                    color: isSelected ? '#111827' : '#9ca3af',
                    backgroundColor: isSelected ? '#ffffff' : 'transparent',
                    border: 'none',
                    borderRadius: 'clamp(2.11px, 0.6vw, 3.8px)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    boxShadow: isSelected ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Handle d'edició per als botons de talles (mode columns) */}
        <EditableTextBox
          id="pdp-size-buttons"
          initialText={SIZES.join(' ')}
          columns={SIZES}
          selectedColumn={selectedSize}
          onColumnSelect={setSelectedSize}
          renderText={false}
          renderHandle={pdpControlsEnabled}
          onSettingsChange={setSizeButtonTextSettings}
          initialSettings={PDP_SIZE_SETTINGS}
          presetVersion={PDP_PRESET_VERSION}
          handleRight="-22px"
          style={{ gridColumn: '4 / 5', gridRow: '16 / 17', zIndex: 100005, width: 0, height: 0, justifySelf: 'end' }}
        />

        <button
          type="button"
          aria-label="Afegeix al cistell"
          onClick={() => {
            try {
              window.dispatchEvent(new CustomEvent('hg:open-full-wide-cart', {
                detail: { source: 'constructor-pdp-cta', firstPartOnly: true },
              }));
            } catch {
              // ignore
            }
          }}
          className="bg-muted text-[#475059] transition-all duration-200 hover:bg-white hover:text-[#111827] hover:shadow-sm active:scale-95"
          style={{
            gridColumn: '4 / 5',
            gridRow: '19 / 20',
            width: '100%',
            height: '100%',
            minWidth: 0,
            minHeight: 0,
            border: '1px solid #e5e7eb',
            borderRadius: 'clamp(2.81px, 0.8vw, 5.06px)',
            padding: 0,
            cursor: 'pointer',
            fontFamily: `${ctaTextSettings.fontFamily}, sans-serif`,
            fontSize: `${ctaTextSettings.fontSize}pt`,
            fontWeight: ctaTextSettings.fontWeight,
            letterSpacing: `${ctaTextSettings.letterSpacing}em`,
            lineHeight: ctaTextSettings.lineHeight,
            textTransform: ctaTextSettings.textTransform,
            color: ctaTextSettings.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <svg
            width="calc(1.2em - 1px)"
            height="calc(1.2em - 1px)"
            viewBox="0 0 70 69"
            style={{
              fillRule: 'evenodd',
              clipRule: 'evenodd',
              strokeLinejoin: 'round',
              strokeMiterlimit: 2,
              display: 'block',
              transform: 'translateY(-2px)',
              fill: 'currentColor',
            }}
          >
            <rect id="v3-buit" x="0" y="0.852" width="70" height="68" style={{ fill: 'none' }} />
            <g clipPath="url(#_clip1_cta)">
              <clipPath id="_clip1_cta">
                <rect x="0" y="0.852" width="70" height="68" />
              </clipPath>
              <path d="M-0.004,16.609l70.007,0l-5.013,39.965c-1.062,8.376 -5.433,12.278 -13.816,12.278l-32.337,0c-8.384,0 -12.754,-3.902 -13.804,-12.278l-5.038,-39.965Zm64.335,5.034l-58.664,0l4.321,34.299c0.343,2.734 1.031,4.826 2.499,6.146l0.004,0.004c1.483,1.318 3.625,1.739 6.346,1.739l32.337,0c2.721,0 4.863,-0.422 6.342,-1.736c1.486,-1.322 2.164,-3.416 2.508,-6.154l4.308,-34.298Z" />
              <path d="M24.674,26.676c0.512,5.307 4.943,9.468 10.338,9.468c5.384,0 9.814,-4.161 10.326,-9.468l-3.265,0c-0.496,3.493 -3.478,6.183 -7.06,6.183c-3.594,0 -6.577,-2.69 -7.073,-6.183l-3.265,0Z" />
            </g>
          </svg>
          AFEGEIX AL CISTELL
        </button>

        {/* Handle d'edició per al CTA (no renderitza text, només handle) */}
        <EditableTextBox
          id="pdp-cta"
          initialText="AFEGEIX AL CISTELL"
          initialSettings={PDP_CTA_SETTINGS}
          presetVersion={PDP_PRESET_VERSION}
          renderText={false}
          renderHandle={pdpControlsEnabled}
          onSettingsChange={setCtaTextSettings}
          handleRight="-22px"
          style={{ gridColumn: '4 / 5', gridRow: '19 / 20', zIndex: 100005, width: 0, height: 0, justifySelf: 'end' }}
        />

        {/* ─── Carrusel: imatge gran (col 2-3, centre) + thumbs (col 3 dreta de la imatge) ─── */}
        <div
          style={{
            gridColumn: '2 / 4',
            gridRow: '8 / 20',
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: '1fr 72px',
            gridTemplateRows: 'subgrid',
            gap: 8,
          }}
        >
          {/* Miniatura petita d'una fila a dalt (la primera de totes) — crea
              la sensació de profunditat, mirall de la de sota/última. */}
          {(() => {
            // Miniatura peek superior: el color immediatament anterior a la
            // finestra centrada (amb wrap), per continuar la sensació de profunditat.
            const N = OFFICIAL_COLORS.length;
            const topIdx = ((mainVariantIndex - 3) % N + N) % N;
            const topColor = OFFICIAL_COLORS[topIdx];
            return (
              <button
                type="button"
                aria-label={`Variant ${topColor}`}
                onClick={() => setMainVariantIndex(topIdx)}
                style={{
                  position: 'relative',
                  gridColumn: '2 / 3',
                  gridRow: '1 / 2',
                  minHeight: 0,
                  border: 'none',
                  background: '#fbfcfd',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  overflow: 'hidden',
                }}
              >
                <img
                  src={TDP_IMAGE(topColor)}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain', userSelect: 'none' }}
                />
              </button>
            );
          })()}
          {/* Thumbs (col 2 del subgrid — a la dreta de la imatge).
              Es mostren `THUMB_VISIBLE` thumbs alhora; els altres viuen al
              carrusel i s'amaguen fins que arribin a la finestra visible. */}
          {(() => {
            const THUMB_VISIBLE = 7;
            const N = OFFICIAL_COLORS.length;
            const center = Math.floor(THUMB_VISIBLE / 2) - 1; // slot FIX del selector (pujat 1 posició)
            const wrap = (i) => ((i % N) + N) % N;
            return Array.from({ length: THUMB_VISIBLE }).map((_, vIdx) => {
              const idx = wrap(mainVariantIndex - center + vIdx);
              const color = OFFICIAL_COLORS[idx];
              const isActive = vIdx === center; // l'actiu sempre al centre
              return (
                <button
                  key={`thumb-slot-${vIdx}`}
                  type="button"
                  aria-label={`Variant ${color}`}
                  aria-pressed={isActive}
                  onClick={() => setMainVariantIndex(idx)}
                  style={{
                    position: 'relative',
                    gridColumn: '2 / 3',
                    gridRow: `${vIdx * 2 + 2} / ${vIdx * 2 + 4}`,
                    minHeight: 0,
                    border: 'none',
                    background: '#fbfcfd',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                  }}
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '3px',
                        background: '#0b0d10',
                      }}
                    />
                  )}
                  <img
                    src={TDP_IMAGE(color)}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    style={{
                      maxWidth: '85%',
                      maxHeight: '85%',
                      objectFit: 'contain',
                      userSelect: 'none',
                    }}
                  />
                </button>
              );
            });
          })()}

          {/* Imatge principal (col 1 del subgrid — ocupa l'amplada principal centrada) */}
          <div
            style={{
              position: 'relative',
              gridColumn: '1 / 2',
              gridRow: `1 / ${THUMB_COUNT + 1}`,
              minWidth: 0,
              minHeight: 0,
              background: '#fbfcfd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <img
              src={TDP_IMAGE(mainVariantColor)}
              alt={`Producte principal ${mainVariantColor}`}
              draggable={false}
              style={{
                maxWidth: '90%',
                maxHeight: '90%',
                objectFit: 'contain',
                userSelect: 'none',
              }}
            />
            <CarouselArrows
              leftPx={0}
              bottomPx={0}
              onPrev={goPrevVariant}
              onNext={goNextVariant}
              prevLabel="Variant anterior"
              nextLabel="Variant següent"
              rowHeight={exactRowHeight}
              vertical
            />
          </div>
        </div>

        {/* Subtítol "ALTRES HISTÒRIES" - Alineat en Y amb les fletxes (fila 50) i en X a l'esquerra de la col 1 */}
        <div
          style={{
            gridColumn: '1 / 3',
            gridRow: '50 / 51',
            alignSelf: 'center',
            fontFamily: 'Roboto Condensed, sans-serif',
            fontWeight: 400,
            fontSize: '15pt',
            lineHeight: 1.2,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(71, 80, 89, 0.7)',
            textAlign: 'left',
            pointerEvents: 'auto',
            transform: 'translateX(2px)', // Sense desplaçament vertical (Y = 0)
          }}
        >
          ALTRES HISTÒRIES
        </div>

        {/* Fletxes També et pot interessar: directament al grid a la fila 50, columna 4 (alineat a la dreta) */}
        <div
          style={{
            gridColumn: '4 / 5',
            gridRow: '50 / 51',
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: 0,
            pointerEvents: 'auto',
          }}
        >
          <CarouselArrows
            rightPx={0}
            centerVertically
            onPrev={() => {
              console.log('Dispatching tambe-rail:prev');
              window.dispatchEvent(new CustomEvent('tambe-rail:prev'));
            }}
            onNext={() => {
              console.log('Dispatching tambe-rail:next');
              window.dispatchEvent(new CustomEvent('tambe-rail:next'));
            }}
            rowHeight={exactRowHeight}
          />
        </div>

        {/* TEXT POSTER GRAN (Fila 32 / 38) - Centrat a la pàgina amb un padding top de 50px respecte la PDP */}
        <div
          style={{
            gridColumn: '1 / 5',
            gridRow: '32 / 38',
            paddingTop: '50px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              textAlign: 'left',
              fontFamily: 'Oswald, sans-serif',
              fontSize: '60pt',
              fontWeight: 300,
              lineHeight: 1.1,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#111827',
            }}
          >
            <div>CADA</div>
            <div>PERSONA TÉ</div>
            <div>UNA HISTÒRIA,</div>
            <div style={{ marginTop: '0.4em' }}>CADA</div>
            <div>HISTÒRIA TÉ</div>
            <div>UN DIBUIX</div>
          </div>
        </div>

        {/* ─── Fitxa tècnica (col 1, fila 3+) — estil TDP ─── */}
        <h2
          style={{
            gridColumn: '1 / 2',
            gridRow: '6 / 7',
            margin: 0,
            minHeight: 0,
            alignSelf: 'end',
            fontFamily: 'Oswald, sans-serif',
            fontWeight: 300,
            fontSize: '20pt',
            lineHeight: 1,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: '#475059',
            textAlign: 'right',
          }}
        >
          ESPECIFICACIONS
        </h2>
        {SPECS.map(({ label, value, row }) => (
          <div
            key={`spec-${label}`}
            style={{
              gridColumn: '1 / 2',
              gridRow: `${row} / ${row + 1}`,
              margin: 0,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'center',
              rowGap: 2,
              fontFamily: 'Roboto Condensed, sans-serif',
              fontWeight: 300,
              fontSize: '14pt',
              lineHeight: 1.2,
              letterSpacing: '0.03em',
              color: 'rgba(71, 80, 89, 0.7)',
              textAlign: 'right',
            }}
          >
            <dt
              style={{
                fontFamily: 'Roboto Condensed, sans-serif',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#111827',
                lineHeight: 1.2,
              }}
            >
              {label}
            </dt>
            <dd style={{ margin: 0 }}>{value}</dd>
          </div>
        ))}

        {/* PASTILLA SEGMENTADA (Fila 17, Columna 4) */}
        <div
          style={{
            gridColumn: '4 / 5',
            gridRow: '17 / 18',
            alignSelf: 'center',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            minHeight: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              backgroundColor: '#f3f4f6',
              padding: '2px',
              borderRadius: 'clamp(2.81px, 0.8vw, 5.06px)',
              border: '1px solid #e5e7eb',
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
            }}
          >
            {['BLANC', 'COLOR', 'NEGRE'].map((opt) => {
              const isActive = selectedFinish === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedFinish(opt)}
                  style={{
                    flex: 1,
                    fontFamily: `${finishButtonTextSettings.fontFamily}, sans-serif`,
                    fontSize: `${finishButtonTextSettings.fontSize}pt`,
                    fontWeight: isActive ? finishButtonTextSettings.selectedFontWeight : finishButtonTextSettings.fontWeight,
                    letterSpacing: `${finishButtonTextSettings.letterSpacing}em`,
                    lineHeight: finishButtonTextSettings.lineHeight,
                    textTransform: finishButtonTextSettings.textTransform,
                    color: isActive ? '#111827' : '#9ca3af',
                    backgroundColor: isActive ? '#ffffff' : 'transparent',
                    border: 'none',
                    borderRadius: 'clamp(2.11px, 0.6vw, 3.8px)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Handle d'edició per al selector d'acabats/colors (Declarat desprès per z-index / ordre DOM) */}
        <EditableTextBox
          id="pdp-finish-buttons"
          initialText="BLANC COLOR NEGRE"
          columns={FINISHES}
          selectedColumn={selectedFinish}
          onColumnSelect={setSelectedFinish}
          renderText={false}
          renderHandle={pdpControlsEnabled}
          onSettingsChange={setFinishButtonTextSettings}
          initialSettings={PDP_SIZE_SETTINGS}
          presetVersion={PDP_PRESET_VERSION}
          handleRight="-22px"
          style={{ gridColumn: '4 / 5', gridRow: '17 / 18', zIndex: 100005, width: 0, height: 0, justifySelf: 'end' }}
        />

        {/* ─── Bloc "També et pot interessar" (rail Nike) - Dins de la graella de la pauta alineat al top de la fila 48 ─── */}
        <div
          style={{
            gridColumn: '1 / 5',
            gridRow: '48 / 65',
            alignSelf: 'start',
            width: '100%',
            marginTop: '-48px', // Ajustat 3px addicionals cap amunt per a una alineació visual mil·limètrica
          }}
        >
          <TambeRail cardHref="/constructor/pdp" title="cada dibuix té una història" showInternalArrows={false} showTitle={false} />
        </div>

      </Pauta4ColsOverlay>
    </section>
  );
}

export default ConstructorPdpPage;
