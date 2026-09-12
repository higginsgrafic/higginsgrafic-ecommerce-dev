import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBottomSheetDrag } from '../hooks/useBottomSheetDrag.js';
import { MobileMockupCarousel } from './MobileMockupCarousel.jsx';
import {
  COLLECTIONS,
  getDrawingsForCollection,
  getVariantsForCollection,
  getMockupColors,
} from '../data/mockups.js';

const COLLECTION_IDS = ['first_contact', 'the_human_inside', 'cube'];
const VARIANT_LABELS = { black: 'Negre', white: 'Blanc', color: 'Color' };

const NAV_HEIGHT = 56; // BottomTabBar h-14
const HANDLE_HEIGHT = 44;

export function MobileCercadorSheet() {
  const navigate = useNavigate();
  const [collection, setCollection] = useState('first_contact');
  const [variant, setVariant] = useState('black');
  const [drawing, setDrawing] = useState('NX-01');
  const [color, setColor] = useState('white');

  const drawings = useMemo(() => getDrawingsForCollection(collection), [collection]);
  const variants = useMemo(() => getVariantsForCollection(collection), [collection]);
  const colors = useMemo(() => getMockupColors(collection, drawing, variant), [collection, drawing, variant]);

  const vh = typeof window !== 'undefined' ? window.innerHeight : 844;
  const closedY = vh; // completament fora de pantalla
  const openY = 0;

  const sheet = useBottomSheetDrag({ closedTranslate: closedY, openTranslate: openY });
  const isOpen = sheet.state === 'open';
  const translateY = sheet.translateY ?? (sheet.state === 'open' ? openY : closedY);

  useEffect(() => {
    const handler = () => sheet.open();
    window.addEventListener('hg:open-cercador', handler);
    return () => window.removeEventListener('hg:open-cercador', handler);
  }, [sheet]);

  const cycleVariant = () => {
    if (variants.length <= 1) return;
    const idx = variants.indexOf(variant);
    setVariant(variants[(idx + 1) % variants.length]);
  };
  const cycleCollection = () => {
    const idx = COLLECTION_IDS.indexOf(collection);
    const next = COLLECTION_IDS[(idx + 1) % COLLECTION_IDS.length];
    setCollection(next);
    const nextDrawings = getDrawingsForCollection(next);
    setDrawing(nextDrawings[0] || '');
  };
  const cycleDrawing = () => {
    const idx = drawings.indexOf(drawing);
    setDrawing(drawings[(idx + 1) % drawings.length]);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={sheet.close}
        style={{
          position: 'fixed', left: 0, right: 0, top: 0, bottom: `${NAV_HEIGHT + HANDLE_HEIGHT}px`, zIndex: 40,
          background: 'rgba(0,0,0,0.35)',
          opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 280ms ease',
        }}
      />

      {/* Slide — per darrere de la barra de navegació i la nansa */}
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: '0px', top: 0, zIndex: 45,
          background: '#fff',
          transform: `translateY(${translateY}px)`,
          transition: sheet.isDragging ? 'none' : 'transform 320ms cubic-bezier(0.32, 0.72, 0, 1)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Arcs SVG + Carrusel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          {/* Arcs de guia (subtils) */}
          <svg
            viewBox="0 0 390 744"
            preserveAspectRatio="xMidYMid meet"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.35 }}
          >
            <path d="M 390,269 A 475,475 0 0,0 -85,744" fill="none" stroke="rgba(255,80,0,0.5)" strokeWidth="1.5" strokeDasharray="5,4"/>
            <path d="M 390,375 A 369,369 0 0,0 21,744" fill="none" stroke="rgba(0,100,255,0.5)" strokeWidth="1.5" strokeDasharray="5,4"/>
            <path d="M 390,427 A 317,317 0 0,0 73,744" fill="none" stroke="rgba(150,100,255,0.5)" strokeWidth="1.5" strokeDasharray="5,4"/>
            <path d="M 390,533 A 211,211 0 0,0 179,744" fill="none" stroke="rgba(0,180,0,0.5)" strokeWidth="1.5" strokeDasharray="5,4"/>
            <circle cx="390" cy="744" r="6" fill="none" stroke="red" strokeWidth="2"/>
            <circle cx="390" cy="744" r="2" fill="red"/>
          </svg>

          {/* Carrusel de mockups — franja exterior (70-90mm) */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <MobileMockupCarousel
              colors={colors}
              selectedColor={color}
              onSelectColor={setColor}
            />
          </div>

          {/* Info sota el carrusel */}
          <div style={{ padding: '8px 16px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{drawing}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
              {COLLECTIONS[collection]?.label} · {VARIANT_LABELS[variant] || variant} · {color}
            </div>
          </div>
        </div>
      </div>

      {/* Nansa — per sobre de la BottomTabBar, sempre visible */}
      <div
        {...sheet.handlers}
        style={{
          position: 'fixed', left: 0, right: 0, bottom: `${NAV_HEIGHT}px`, zIndex: 120, height: HANDLE_HEIGHT,
          background: '#fff', borderTop: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'grab', touchAction: 'none',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.08)',
          transition: sheet.isDragging ? 'none' : 'transform 320ms cubic-bezier(0.32, 0.72, 0, 1), bottom 240ms cubic-bezier(0.32, 0.72, 0, 1)',
          userSelect: 'none',
        }}
      >
        <div style={{ width: 60, height: 5, borderRadius: 3, background: '#1a1a1a' }} />
      </div>

      {/* Barra del sheet — tapa la BottomTabBar quan és obert */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: '0px', height: NAV_HEIGHT, zIndex: 115,
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        background: '#fff', borderTop: '1px solid #e5e7eb',
        transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 320ms cubic-bezier(0.32, 0.72, 0, 1), bottom 240ms cubic-bezier(0.32, 0.72, 0, 1)',
      }}>
        <SheetBtn icon="🏠" label="Logo" onClick={() => { sheet.close(); navigate('/'); }} />
        <SheetBtn icon="🎨" label={VARIANT_LABELS[variant] || 'B/N'} onClick={cycleVariant} />
        <SheetBtn icon="📚" label={COLLECTIONS[collection]?.label || 'Col.'} onClick={cycleCollection} />
        <SheetBtn icon="✏️" label="Dibuix" onClick={cycleDrawing} />
      </div>
    </>
  );
}

function SheetBtn({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, height: '100%', border: 'none', background: 'transparent',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 2, cursor: 'pointer', color: '#1a1a1a', fontSize: 10, fontWeight: 600,
    }}>
      <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
