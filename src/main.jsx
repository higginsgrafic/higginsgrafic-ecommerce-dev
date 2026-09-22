import { initSentry } from '@/lib/sentry';
import { injectPlausible } from '@/lib/analytics';

// Inicialitzem Sentry el més aviat possible per capturar tots els errors
initSentry();
// Inicialitzem Plausible analytics (GDPR-compliant, cookieless)
injectPlausible();

console.log('🚀 main.jsx is loading...');

// El carril de la pauta ja NO es publica des d'aquí: el declara `foundation.css`
// amb `--contingut-max: min(70.3125vw, 1350px)`. Aquella publicacio existia
// perque el carril es calculava amb `getSafeBelt()` i arribava tard, quan es
// carregava el chunk de la pauta (cap a 1,2 s). Un full de estils no arriba
// tard: les variables hi son abans que es pinti res.


const __HG_FATAL_OVERLAY_ID__ = '__HG_FATAL_OVERLAY__';

function showFatalOverlay(title, details) {
  try {
    const root = document.getElementById('root');
    if (root && !root.innerHTML) root.innerHTML = '';

    let el = document.getElementById(__HG_FATAL_OVERLAY_ID__);
    if (!el) {
      el = document.createElement('div');
      el.id = __HG_FATAL_OVERLAY_ID__;
      el.style.position = 'fixed';
      el.style.left = '12px';
      el.style.top = '12px';
      el.style.right = '12px';
      el.style.bottom = '12px';
      el.style.zIndex = '2147483647';
      el.style.background = 'rgba(255,255,255,0.98)';
      el.style.border = '2px solid rgba(239,68,68,0.45)';
      el.style.borderRadius = '12px';
      el.style.padding = '16px';
      el.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
      el.style.color = '#111827';
      el.style.whiteSpace = 'pre-wrap';
      el.style.overflow = 'auto';
      document.body.appendChild(el);
    }

    el.textContent = `${String(title || 'Fatal error')}${details ? `\n\n${String(details)}` : ''}`;
  } catch {
    // ignore
  }
}

window.addEventListener('error', (e) => {
  try {
    const msg = e?.error?.stack || e?.error?.message || e?.message || String(e);
    window.__HG_LAST_FATAL__ = { kind: 'error', msg };
    showFatalOverlay('window.error', msg);
  } catch {
    // ignore
  }
});

window.addEventListener('unhandledrejection', (e) => {
  try {
    const reason = e?.reason;
    const msg = reason?.stack || reason?.message || String(reason);
    window.__HG_LAST_FATAL__ = { kind: 'unhandledrejection', msg };
    showFatalOverlay('unhandledrejection', msg);
  } catch {
    // ignore
  }
});

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ProductProvider } from '@/contexts/ProductContext';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { GridDebugProvider } from '@/contexts/GridDebugContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import App from '@/App';
import BranchBadge from '@/components/dev/BranchBadge';
import '@/index.css';
// La fonamenta nova (la unitat unica i l'escala d'espaiat). Es additiva: no
// toca cap regla del lloc actual.
import '@/foundation.css';
import { onLCP, onCLS, onINP, onFCP, onTTFB } from 'web-vitals';
if (import.meta.env.DEV) {
  import('@/debug.css');
}

const vitals = {};
const logVitals = (metric) => {
  vitals[metric.name] = metric.value;
  console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} ${metric.rating || ''}`);
  if (metric.name === 'CLS' || metric.name === 'LCP' || metric.name === 'INP') {
    window.__HG_VITALS__ = vitals;
  }
};
onLCP(logVitals);
onCLS(logVitals);
onINP(logVitals);
onFCP(logVitals);
onTTFB(logVitals);

console.log('📦 All imports loaded successfully');

console.log('🎯 About to render React app...');

window.__GRAFIC_REACT_MOUNTED__ = false;

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <TooltipProvider delayDuration={200} skipDelayDuration={0}>
    <AuthProvider>
      <GridDebugProvider>
        <CartProvider>
          <WishlistProvider>
            <ProductProvider>
              <ToastProvider>
                <App />
                <BranchBadge />
              </ToastProvider>
            </ProductProvider>
          </WishlistProvider>
        </CartProvider>
      </GridDebugProvider>
    </AuthProvider>
    </TooltipProvider>
  </BrowserRouter>
);

window.__GRAFIC_REACT_MOUNTED__ = true;

console.log('✅ React app rendered');

// ---------------------------------------------------------------------------
// Service worker: ESBORRAT A POSTA
//
// El codi actual no en registra cap. Però versions anteriors de la botiga sí
// que ho feien, i un navegador que encara el tingui instal·lat pot servir
// fitxers vells (JavaScript i CSS d'abans) i fer que la botiga sembli
// espatllada fins que l'usuari refresca. Aquí el desregistrem i buidem la
// memòria cau perquè això no pugui passar.
// ---------------------------------------------------------------------------
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registres) => registres.forEach((registre) => registre.unregister()))
    .catch(() => { /* ignore */ });
}
if (typeof caches !== 'undefined' && typeof caches.keys === 'function') {
  caches
    .keys()
    .then((noms) => noms.forEach((nom) => caches.delete(nom)))
    .catch(() => { /* ignore */ });
}
