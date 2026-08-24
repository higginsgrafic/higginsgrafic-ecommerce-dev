import { initSentry } from '@/lib/sentry';
import { injectPlausible } from '@/lib/analytics';

// Inicialitzem Sentry el més aviat possible per capturar tots els errors
initSentry();
// Inicialitzem Plausible analytics (GDPR-compliant, cookieless)
injectPlausible();

console.log('🚀 main.jsx is loading...');

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
if (import.meta.env.DEV) {
  import('@/debug.css');
}

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

// Registre del Service Worker per PWA
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    const pathname = (typeof window !== 'undefined' ? window.location?.pathname : '') || '';
    const search = (typeof window !== 'undefined' ? window.location?.search : '') || '';
    const hostname = (typeof window !== 'undefined' ? window.location?.hostname : '') || '';
    const isPrimaryProdDomain = hostname === 'higginsgrafic.com' || hostname === 'www.higginsgrafic.com';
    const bypassSW = isPrimaryProdDomain || pathname === '/ec-preview' || pathname === '/ec-preview-lite' || /[?&]no_sw=1\b/.test(search);

    if (bypassSW) {
      // /ec-preview is a live iteration surface; SW caching can serve stale JS/CSS and break rapid fixes.
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister());
      });
      if ('caches' in window) {
        caches.keys().then((names) => names.forEach((n) => caches.delete(n)));
      }
    }

    window.addEventListener('load', () => {
      if (bypassSW) return;
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registrat correctament:', registration);
        })
        .catch((error) => {
          console.log('❌ Error al registrar Service Worker:', error);
        });
    });
  } else {
    // DEV: evita que un SW antic segresti assets cachejats i impedeixi veure canvis.
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister());
    });
    if ('caches' in window) {
      caches.keys().then((names) => names.forEach((n) => caches.delete(n)));
    }
  }
}
