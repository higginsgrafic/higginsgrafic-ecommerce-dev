import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDebugOverlays } from '@/hooks/useDebugOverlays';
import DevPortal, { DEV_LAYER_Z } from '@/components/dev/DevPortal';

// Llista editable de pàgines en les quals estem treballant ara mateix.
// Afegeix o treu entrades segons el focus actiu.
const ACTIVE_PAGES = [
  { path: '/constructor/html-base', label: 'HTML BASE', note: 'Header + pauta 4 col. + footers', featured: true },
  { path: '/', label: 'MAIN', note: 'Home' },
  { path: '/constructor/tdp', label: 'TDP', note: 'Pauta + preu/cistell + botonera' },
  { path: '/constructor/full-wide-slide', label: 'FULL-SLIDE', note: 'Full Wide Slide' },
  { path: '/constructor/colleccio', label: 'COL·LECCIÓ', note: 'Constructor pàgina col·lecció (4 col)' },
];

const STORAGE_KEY = 'hg.activeWorkOverlay.collapsed';

function readCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeCollapsed(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
  } catch {
    // ignore
  }
}

function ActiveWorkOverlay() {
  const [collapsed, setCollapsed] = useState(readCollapsed());
  const location = useLocation();
  const { activeWorkEnabled } = useDebugOverlays();

  const isContactSheetRoute = location.pathname === '/dev/contact-sheet';
  const isSiteMapRoute = location.pathname === '/dev/site-map';
  const isEmbeddedPreview = (() => {
    try {
      return new URLSearchParams(location.search).get('embed') === 'contact-sheet';
    } catch {
      return false;
    }
  })();
  if (!activeWorkEnabled) return null;
  if (isContactSheetRoute || isSiteMapRoute || isEmbeddedPreview) return null;

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    writeCollapsed(next);
  };

  return (
    <DevPortal zIndex={DEV_LAYER_Z.hud} pointerEvents="none">
      <div
      style={{
        position: 'fixed',
        left: '28px',
        top: '150px',
        width: '260px',
        maxWidth: '260px',
        maxHeight: 'calc(100vh - 170px)',
        overflow: 'auto',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontSize: '11px',
        lineHeight: 1.3,
        color: '#fff',
        userSelect: 'none',
        pointerEvents: 'auto',
      }}
    >
      <button
        onClick={toggle}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 8px',
          borderRadius: '999px',
          backgroundColor: 'rgba(31, 124, 255, 0.92)',
          border: '1px solid rgba(30, 64, 175, 0.9)',
          color: '#fff',
          fontFamily: 'inherit',
          fontSize: '11px',
          letterSpacing: '0.04em',
          boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
          cursor: 'pointer',
        }}
        title={collapsed ? 'Mostra pàgines actives' : 'Amaga pàgines actives'}
      >
        <span style={{ fontWeight: 700 }}>WORK</span>
        <span style={{ opacity: 0.85 }}>{ACTIVE_PAGES.length}</span>
      </button>

      {!collapsed ? (
        <div
          style={{
            marginTop: '6px',
            padding: '8px 10px',
            borderRadius: '8px',
            backgroundColor: 'rgba(17, 24, 39, 0.92)',
            border: '1px solid rgba(31, 124, 255, 0.55)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.22)',
            width: '260px',
          }}
        >
          <div
            style={{
              fontWeight: 700,
              letterSpacing: '0.06em',
              opacity: 0.85,
              marginBottom: '6px',
            }}
          >
            PÀGINES ACTIVES
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {ACTIVE_PAGES.map((page) => {
              const isCurrent = location.pathname === page.path;
              const isFeatured = page.featured;
              return (
                <li
                  key={page.path}
                  style={isFeatured ? { marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid rgba(251, 191, 36, 0.32)' } : undefined}
                >
                  <Link
                    to={page.path}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      padding: isFeatured ? '7px 8px' : '4px 6px',
                      borderRadius: '6px',
                      backgroundColor: isFeatured
                        ? (isCurrent ? 'rgba(251, 191, 36, 0.34)' : 'rgba(251, 191, 36, 0.18)')
                        : (isCurrent ? 'rgba(31, 124, 255, 0.25)' : 'transparent'),
                      border: isFeatured
                        ? `1px solid ${isCurrent ? 'rgba(251, 191, 36, 0.95)' : 'rgba(251, 191, 36, 0.48)'}`
                        : `1px solid ${isCurrent ? 'rgba(31, 124, 255, 0.65)' : 'rgba(255,255,255,0.08)'}`,
                      color: '#fff',
                      textDecoration: 'none',
                      boxShadow: isFeatured ? '0 0 0 1px rgba(0,0,0,0.12), 0 4px 12px rgba(251, 191, 36, 0.08)' : undefined,
                    }}
                  >
                    <span style={{ fontWeight: 700, color: isFeatured ? '#fef3c7' : '#fff' }}>
                      {page.label}
                      <span style={{ opacity: 0.55, fontWeight: 400, marginLeft: 6 }}>{page.path}</span>
                    </span>
                    {page.note ? (
                      <span style={{ opacity: 0.7, fontWeight: 400 }}>{page.note}</span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      </div>
    </DevPortal>
  );
}

export default ActiveWorkOverlay;
