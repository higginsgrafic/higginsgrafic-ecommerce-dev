import { initSentry } from '@/lib/sentry';
import { injectPlausible } from '@/lib/analytics';

// Inicialitzem Sentry el més aviat possible per capturar tots els errors
initSentry();
// Inicialitzem Plausible analytics (GDPR-compliant, cookieless)
injectPlausible();

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ProductProvider } from '@/contexts/ProductContext';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { AdminToolsProvider } from '@/contexts/AdminToolsContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { GridDebugProvider } from '@/contexts/GridDebugContext';
// TooltipProvider ve de Radix i és OBLIGATORI: sense ell, qualsevol component
// que faci servir un <Tooltip> peta amb "Tooltip must be used within
// TooltipProvider" i la pàgina sencera cau a la pantalla d'error.
//
// Aquest proveïdor hi faltava. Per això la portada de la botiga publicada
// deia "Alguna cosa no va alhora" mentre que a l'ordinador de desenvolupament
// es veia bé: hi ha DOS fitxers d'arrencada i aquest no el tenia. Es va
// descobrir el dia que es va desactivar el mode "en construcció" i la botiga
// es va poder veure de debò.
import { TooltipProvider } from '@/components/ui/tooltip';
import App from '@/App';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <TooltipProvider delayDuration={200} skipDelayDuration={0}>
      <AuthProvider>
        <AdminProvider>
          <GridDebugProvider>
            <CartProvider>
              <WishlistProvider>
                <ProductProvider>
                  <AdminToolsProvider>
                    <ToastProvider>
                      <App />
                    </ToastProvider>
                  </AdminToolsProvider>
                </ProductProvider>
              </WishlistProvider>
            </CartProvider>
          </GridDebugProvider>
        </AdminProvider>
      </AuthProvider>
    </TooltipProvider>
  </BrowserRouter>
);

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
