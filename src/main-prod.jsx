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
import AppProd from '@/AppProd';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <AdminProvider>
        <CartProvider>
          <WishlistProvider>
            <ProductProvider>
              <AdminToolsProvider>
                <ToastProvider>
                  <AppProd />
                </ToastProvider>
              </AdminToolsProvider>
            </ProductProvider>
          </WishlistProvider>
        </CartProvider>
      </AdminProvider>
    </AuthProvider>
  </BrowserRouter>
);