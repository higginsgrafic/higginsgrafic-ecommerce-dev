import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Pauta4ColsOverlay from '@/components/pauta/Pauta4ColsOverlay';
import CollectionProductCard from '@/components/tdp/CollectionProductCard';
import CalibrationsHud from '@/components/dev/CalibrationsHud';

const COLLECTION_BG_SRC = '/tmp/PAGINES/PAGINES TIPUS/00 COLLECCIO.png';

const TDP_DESCRIPTION = [
  "Mereixedors són d'honor, glòria e de fama e contínua bona memòria los ",
  'hòmens virtuosos, e singularment aquells qui per la república lluitaren.',
].join('\n');

const TDP_IMAGE_SRC = '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_white_gpr-4-0_front.png';
const OVERLAY_STATE_STORAGE_KEY = 'hg.constructorColleccio.overlayOpacity.v1';

const DEFAULT_OVERLAY_STATE = {
  pautaOpacity: 1,
  tableOpacity: 1,
  backgroundOpacity: 1,
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

function ConstructorColleccioPage() {
  const [selectedSize, setSelectedSize] = useState('M');
  const [overlayState, setOverlayState] = useState(loadOverlayState);
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const { pautaOpacity, tableOpacity, backgroundOpacity } = overlayState;

  useEffect(() => {
    try {
      window.localStorage.setItem(OVERLAY_STATE_STORAGE_KEY, JSON.stringify(overlayState));
    } catch {
      // ignore
    }
  }, [overlayState]);

  return (
    <section className="bg-background">
      <Helmet>
        <title>Col·lecció · Constructor | Higgins Gràfic</title>
        <meta
          name="description"
          content="Plantilla de construcció de col·lecció amb header global, pauta de 4 columnes i footers globals."
        />
      </Helmet>

      <Pauta4ColsOverlay
        pautaEnabled
        tableEnabled
        pautaOpacity={pautaOpacity}
        tableOpacity={tableOpacity}
        topOffset="0px"
        bottomPadding="0px"
      >
        <img
          src={COLLECTION_BG_SRC}
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'fill',
            opacity: backgroundOpacity,
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 0,
          }}
        />
        <div
          aria-label="TDP espai del títol"
          style={{
            gridColumn: '1 / 5',
            gridRow: '1 / 16',
            backgroundColor: 'transparent',
            border: '1px dashed rgba(59, 130, 246, 0.85)',
            boxSizing: 'border-box',
            zIndex: 2,
          }}
        />
        {[1, 4].map((col) => (
          <div
            key={`constructor-colleccio-tdp-slot-${col}`}
            aria-label={`TDP columna ${col}`}
            style={{
              gridColumn: `${col} / ${col + 1}`,
              gridRow: '16 / 31',
              backgroundColor: '#ffffff',
              boxSizing: 'border-box',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
        ))}
        <CollectionProductCard
          gridColumn="2 / 3"
          productName="NOM DE PRODUCTE"
          description={TDP_DESCRIPTION}
          price="15,50€"
          imageSrc={TDP_IMAGE_SRC}
          imageAlt="Samarreta blanca Gildan 5000"
          sizes={sizes}
          selectedSize={selectedSize}
          onSizeChange={setSelectedSize}
          cartCount={0}
          onAddToCart={() => {}}
          editableIdPrefix="constructor-colleccio-tdp"
          presetVersion="constructor-colleccio-tdp-cart-34-v8"
        />
      </Pauta4ColsOverlay>
      <div
        className="font-mono text-neutral-800"
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
        <strong className="mb-2 block">Controls col·lecció</strong>
        <OpacitySlider label="Opacitat pauta" value={pautaOpacity} onChange={(value) => setOverlayState((prev) => ({ ...prev, pautaOpacity: value }))} />
        <OpacitySlider label="Opacitat taula" value={tableOpacity} onChange={(value) => setOverlayState((prev) => ({ ...prev, tableOpacity: value }))} />
        <OpacitySlider label="Opacitat BG" value={backgroundOpacity} onChange={(value) => setOverlayState((prev) => ({ ...prev, backgroundOpacity: value }))} />
      </div>
      <CalibrationsHud />
    </section>
  );
}

function OpacitySlider({ label, value, onChange }) {
  return (
    <label className="mb-2 block">
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
        onChange={(event) => onChange(parseFloat(event.target.value))}
        className="w-full accent-orange-600"
      />
    </label>
  );
}

export default ConstructorColleccioPage;
