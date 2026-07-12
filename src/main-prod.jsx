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
import { GridDebugProvider } from '@/contexts/GridDebugContext';
import AppProd from '@/AppProd';
import ProdBadge from '@/components/dev/ProdBadge';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <CartProvider>
      <WishlistProvider>
        <ProductProvider>
          <GridDebugProvider>
            <ToastProvider>
              <AppProd />
              <ProdBadge />
            </ToastProvider>
          </GridDebugProvider>
        </ProductProvider>
      </WishlistProvider>
    </CartProvider>
  </BrowserRouter>
);