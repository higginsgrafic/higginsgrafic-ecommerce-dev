import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Pauta4ColsOverlay from '@/components/pauta/Pauta4ColsOverlay';
import CollectionProductCard from '@/components/tdp/CollectionProductCard';
import TambeRail from '@/pages/nikeTambe/TambeRail';
import CarouselArrows from '@/pages/nikeTambe/CarouselArrows';
import Breadcrumbs from '@/components/Breadcrumbs';
import EditableTextBox from '@/components/dev/EditableTextBox';

const PDP_PRESET_VERSION = 'pdp-layout-2026-05-20-1135';

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
  x: 0, y: 0, fontFamily: 'Oswald', fontSize: 24, fontWeight: 300, selectedFontWeight: 700,
  letterSpacing: 0, lineHeight: 1, textAlign: 'left', verticalAlign: 'center',
  color: '#475059', textTransform: 'none',
};
const PDP_CTA_SETTINGS = {
  x: 0, y: 0, fontFamily: 'Oswald', fontSize: 20, fontWeight: 300, selectedFontWeight: 700,
  letterSpacing: 0.04, lineHeight: 1, textAlign: 'center', verticalAlign: 'center',
  color: '#475059', textTransform: 'uppercase',
};
const PDP_SIZE_SETTINGS = {
  x: 0, y: 0, fontFamily: 'Oswald', fontSize: 20, fontWeight: 300, selectedFontWeight: 700,
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

const OVERLAY_STATE_STORAGE_KEY = 'hg.constructorPdp.overlayState.v1';

const DEFAULT_OVERLAY_STATE = {
  pautaEnabled: true,
  tableEnabled: true,
  pautaOpacity: 1,
  tableOpacity: 0.5,
};

function loadOverlayState() {
  try {
    const raw = window.localStorage.getItem(OVERLAY_STATE_STORAGE_KEY);
    if (!raw) return DEFAULT_OVERLAY_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_OVERLAY_STATE, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
  } catch {
    return DEFAULT_OVERLAY_STATE;
  }
}

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

// 14 colors oficials Gildan 5000 (ordre alfabètic dels seleccionats a colors.json).
const OFFICIAL_COLORS = [
  'black', 'daisy', 'forest-green', 'gold', 'irish-green', 'kiwi',
  'light-blue', 'light-pink', 'military-green', 'navy', 'purple', 'red',
  'royal', 'white',
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

function ConstructorPdpPage() {
  const [selectedSize, setSelectedSize] = useState('M');
  const [sizeButtonTextSettings, setSizeButtonTextSettings] = useState(PDP_SIZE_SETTINGS);
  const [ctaTextSettings, setCtaTextSettings] = useState(PDP_CTA_SETTINGS);
  const [mainVariantIndex, setMainVariantIndex] = useState(0);
  const goPrevVariant = () => setMainVariantIndex((i) => (i - 1 + OFFICIAL_COLORS.length) % OFFICIAL_COLORS.length);
  const goNextVariant = () => setMainVariantIndex((i) => (i + 1) % OFFICIAL_COLORS.length);
  const mainVariantColor = OFFICIAL_COLORS[mainVariantIndex];
  const [overlayState, setOverlayState] = useState(loadOverlayState);
  const { pautaEnabled, tableEnabled, pautaOpacity, tableOpacity } = overlayState;

  useEffect(() => {
    try {
      window.localStorage.setItem(OVERLAY_STATE_STORAGE_KEY, JSON.stringify(overlayState));
    } catch {
      // ignore
    }
  }, [overlayState]);

  const updateState = (patch) => setOverlayState((prev) => ({ ...prev, ...patch }));

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
        numRows={30}
        canvasAspect={[2642, 2236]}
        pautaEnabled={pautaEnabled}
        tableEnabled={tableEnabled}
        pautaOpacity={pautaOpacity}
        tableOpacity={tableOpacity}
        topOffset="0px"
        bottomPadding="0px"
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
          renderHandle
          handleRight="4px"
          style={{ gridColumn: '4 / 5', gridRow: '6 / 7', alignSelf: 'end' }}
        />

        <EditableTextBox
          id="pdp-collection-name"
          initialText="NOM DE COL·LECCIÓ"
          initialSettings={PDP_COLLECTION_SETTINGS}
          presetVersion={PDP_PRESET_VERSION}
          renderHandle
          handleRight="4px"
          style={{ gridColumn: '4 / 5', gridRow: '7 / 8', alignSelf: 'start' }}
        />

        <EditableTextBox
          id="pdp-product-description"
          initialText={PRODUCT_DESCRIPTION}
          initialSettings={PDP_DESCRIPTION_SETTINGS}
          presetVersion={PDP_PRESET_VERSION}
          multiline
          renderHandle
          handleRight="4px"
          style={{ gridColumn: '4 / 5', gridRow: '9 / 16' }}
        />

        <EditableTextBox
          id="pdp-price"
          initialText="15,50€"
          initialSettings={PDP_PRICE_SETTINGS}
          presetVersion={PDP_PRESET_VERSION}
          renderHandle
          handleRight="4px"
          style={{ gridColumn: '4 / 5', gridRow: '16 / 17', alignSelf: 'center' }}
        />

        <div
          style={{
            gridColumn: '4 / 5',
            gridRow: '17 / 18',
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: `repeat(${SIZES.length}, minmax(0, 1fr))`,
            columnGap: 10,
            alignSelf: 'center',
            justifySelf: 'start',
            width: '75%',
            height: '100%',
          }}
        >
          {SIZES.map((size) => {
            const isSelected = size === selectedSize;
            return (
              <button
                key={`size-${size}`}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`relative flex h-full w-full items-center justify-center transition-all duration-200 active:scale-95 ${isSelected ? 'bg-[#475059] text-whiteStrong' : 'bg-muted text-[#475059] hover:text-muted-foreground'}`}
                style={{
                  borderRadius: 'clamp(2.81px, 0.8vw, 5.06px)',
                  fontFamily: `${sizeButtonTextSettings.fontFamily}, sans-serif`,
                  fontSize: `${sizeButtonTextSettings.fontSize}pt`,
                  fontWeight: isSelected ? sizeButtonTextSettings.selectedFontWeight : sizeButtonTextSettings.fontWeight,
                  letterSpacing: `${sizeButtonTextSettings.letterSpacing}em`,
                  lineHeight: sizeButtonTextSettings.lineHeight,
                  textTransform: sizeButtonTextSettings.textTransform,
                  cursor: 'pointer',
                  border: 'none',
                  padding: 0,
                }}
              >
                {size}
              </button>
            );
          })}
        </div>

        {/* Handle d'edició per als botons de talles (mode columns) */}
        <EditableTextBox
          id="pdp-size-buttons"
          initialText={SIZES.join(' ')}
          columns={SIZES}
          selectedColumn={selectedSize}
          onColumnSelect={setSelectedSize}
          renderText={false}
          renderHandle
          onSettingsChange={setSizeButtonTextSettings}
          initialSettings={PDP_SIZE_SETTINGS}
          presetVersion={PDP_PRESET_VERSION}
          handleRight="4px"
          style={{ gridColumn: '4 / 5', gridRow: '17 / 18', zIndex: 10, pointerEvents: 'none' }}
        />

        <button
          type="button"
          aria-label="Afegeix al cistell"
          className="bg-muted text-[#475059] transition-all duration-200 hover:bg-[#475059] hover:text-whiteStrong active:scale-95"
          style={{
            gridColumn: '4 / 5',
            gridRow: '19 / 20',
            width: '100%',
            height: '100%',
            minWidth: 0,
            minHeight: 0,
            border: 'none',
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
          <img
            src="/custom_logos/icons/v3-buit.svg"
            alt=""
            aria-hidden="true"
            draggable="false"
            style={{ width: 'calc(1.2em - 1px)', height: 'calc(1.2em - 1px)', objectFit: 'contain', display: 'block', transform: 'translateY(-2px)' }}
          />
          AFEGEIX AL CISTELL
        </button>

        {/* Handle d'edició per al CTA (no renderitza text, només handle) */}
        <EditableTextBox
          id="pdp-cta"
          initialText="AFEGEIX AL CISTELL"
          initialSettings={PDP_CTA_SETTINGS}
          presetVersion={PDP_PRESET_VERSION}
          renderText={false}
          renderHandle
          onSettingsChange={setCtaTextSettings}
          handleRight="4px"
          style={{ gridColumn: '4 / 5', gridRow: '19 / 20', zIndex: 10, pointerEvents: 'none' }}
        />

        {/* ─── Carrusel: imatge gran (col 2-3, centre) + thumbs (col 3 dreta de la imatge) ─── */}
        <div
          style={{
            gridColumn: '2 / 4',
            gridRow: '6 / 20',
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: '1fr 72px',
            gridTemplateRows: 'subgrid',
            gap: 8,
          }}
        >
          {/* Thumbs (col 2 del subgrid — a la dreta de la imatge).
              Es mostren `THUMB_VISIBLE` thumbs alhora; els altres viuen al
              carrusel i s'amaguen fins que arribin a la finestra visible. */}
          {(() => {
            const THUMB_VISIBLE = 7;
            const maxStart = Math.max(0, OFFICIAL_COLORS.length - THUMB_VISIBLE);
            const startIdx = Math.min(maxStart, Math.max(0, mainVariantIndex - Math.floor(THUMB_VISIBLE / 2)));
            const visible = OFFICIAL_COLORS.slice(startIdx, startIdx + THUMB_VISIBLE);
            return visible.map((color, vIdx) => {
              const idx = startIdx + vIdx;
              const isActive = idx === mainVariantIndex;
              return (
                <button
                  key={`thumb-${color}`}
                  type="button"
                  aria-label={`Variant ${color}`}
                  aria-pressed={isActive}
                  onClick={() => setMainVariantIndex(idx)}
                  style={{
                    position: 'relative',
                    gridColumn: '2 / 3',
                    gridRow: `${vIdx * 2 + 1} / ${vIdx * 2 + 3}`,
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
            {/* Fletxes carrusel a la cantonada inferior esquerra */}
            <div style={{ position: 'absolute', left: 0, bottom: 0, width: 0, height: 0 }}>
              <CarouselArrows
                leftPx={0}
                topPx={-44}
                onPrev={goPrevVariant}
                onNext={goNextVariant}
                prevLabel="Variant anterior"
                nextLabel="Variant següent"
              />
            </div>
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

      </Pauta4ColsOverlay>

      {/* ─── Bloc "També et pot interessar" (rail Nike) ─── */}
      <div style={{ marginTop: '-102px' }}>
        <TambeRail cardHref="/constructor/pdp" title="cada peça té una història" />
      </div>


      <div
        className="font-mono text-neutral-800 debug-exempt"
        style={{
          position: 'fixed',
          right: 16,
          top: 170,
          width: 260,
          zIndex: 100000,
          background: 'rgba(255,255,255,0.96)',
          border: '1px solid rgba(0,0,0,0.10)',
          borderRadius: 10,
          padding: 12,
          fontSize: 12,
          boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
        }}
      >
        <strong className="mb-2 block">Controls PDP</strong>
        <ToggleRow
          label="Pauta"
          checked={pautaEnabled}
          onChange={(v) => updateState({ pautaEnabled: v })}
        />
        <OpacitySlider
          label="Opacitat pauta"
          value={pautaOpacity}
          onChange={(v) => updateState({ pautaOpacity: v })}
          disabled={!pautaEnabled}
        />
        <ToggleRow
          label="Taula + numeració"
          checked={tableEnabled}
          onChange={(v) => updateState({ tableEnabled: v })}
        />
        <OpacitySlider
          label="Opacitat taula"
          value={tableOpacity}
          onChange={(v) => updateState({ tableOpacity: v })}
          disabled={!tableEnabled}
        />
      </div>
    </section>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="mb-2 flex items-center justify-between gap-3 text-[12px] text-neutral-800">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-orange-600"
      />
    </label>
  );
}

function OpacitySlider({ label, value, onChange, disabled = false }) {
  return (
    <label className={`mb-2 block ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between text-[11px] text-neutral-700">
        <span>{label}</span>
        <span className="tabular-nums text-neutral-900">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(parseFloat(event.target.value))}
        className="w-full accent-orange-600"
      />
    </label>
  );
}

export default ConstructorPdpPage;
