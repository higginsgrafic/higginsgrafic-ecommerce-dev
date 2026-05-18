// Inventari de pàgines de l'app, agrupades per zona.
// Font: src/App.jsx. Inclou només rutes concretes (sense redirects ni wildcards).
// Les rutes dinàmiques (amb :id) es llisten a DYNAMIC_ROUTES amb una mostra opcional.
//
// Tag possibles:
//  - 'keep'             : pàgina activa que es manté.
//  - 'review'           : per revisar/decidir si es manté.
//  - 'dev-only'         : eina interna de desenvolupament.
//  - 'admin'            : zona privada d'administració.
//  - 'legacy-redirect'  : redirecció heretada.

export const GROUPS = [
  'Home',
  'Col·leccions',
  'Constructors',
  'Comerç',
  'Servei',
  'Lab/Proves',
  'Admin',
  'Tècnic',
];

export const PAGES_MANIFEST = [
  // Home
  { path: '/', label: 'Home', group: 'Home', tag: 'keep' },

  // Col·leccions
  // (Cap pàgina per ara — grup reservat al manifest.)

  // Constructors (pàgines per construir un component / preset visual)
  { path: '/constructor/tdp', label: 'TDP Constructor', group: 'Constructors', tag: 'keep' },
  { path: '/constructor/colleccio', label: 'Col·lecció Constructor', group: 'Constructors', tag: 'keep' },
  { path: '/constructor/html-base', label: 'HTML Base Constructor', group: 'Constructors', tag: 'keep' },
  { path: '/constructor/full-wide-slide', label: 'Full Wide Slide Constructor', group: 'Constructors', tag: 'keep' },
  { path: '/full-wide-slide', label: 'Full Wide Slide (alias)', group: 'Constructors', tag: 'review' },
  { path: '/plantilla-cataleg-components', label: 'Plantilla Catàleg Components', group: 'Constructors', tag: 'review' },

  // Comerç
  { path: '/checkout', label: 'Checkout', group: 'Comerç', tag: 'keep', fixedHeight: 1600 },
  { path: '/track', label: 'Seguiment de comanda', group: 'Comerç', tag: 'keep' },
  { path: '/offers', label: 'Ofertes', group: 'Comerç', tag: 'keep' },

  // Servei (footer)
  { path: '/about', label: 'Sobre nosaltres', group: 'Servei', tag: 'keep' },
  { path: '/contact', label: 'Contacte', group: 'Servei', tag: 'keep' },
  { path: '/faq', label: 'FAQ', group: 'Servei', tag: 'keep' },
  { path: '/shipping', label: 'Enviaments', group: 'Servei', tag: 'keep' },
  { path: '/sizing', label: 'Guia de talles', group: 'Servei', tag: 'keep' },
  { path: '/privacy', label: 'Privacitat', group: 'Servei', tag: 'keep' },
  { path: '/terms', label: 'Termes', group: 'Servei', tag: 'keep' },
  { path: '/cc', label: 'Creative Commons', group: 'Servei', tag: 'keep' },

  // Lab/Proves
  { path: '/lab', label: 'Lab Home', group: 'Lab/Proves', tag: 'dev-only' },
  { path: '/lab/demos', label: 'Lab · Demos', group: 'Lab/Proves', tag: 'dev-only' },
  { path: '/lab/wip', label: 'Lab · WIP', group: 'Lab/Proves', tag: 'dev-only' },
  { path: '/lab/proves', label: 'Lab · Proves', group: 'Lab/Proves', tag: 'dev-only' },
  { path: '/proves/demo-nike-tambe', label: 'Demo Nike També', group: 'Lab/Proves', tag: 'dev-only' },
  { path: '/proves/dev-links', label: 'Dev Links', group: 'Lab/Proves', tag: 'dev-only' },
  { path: '/proves/dev-components', label: 'Dev Components Catalog', group: 'Lab/Proves', tag: 'dev-only' },
  { path: '/proves/layout-builder', label: 'Layout Builder', group: 'Lab/Proves', tag: 'dev-only' },
  { path: '/new', label: 'New (sandbox)', group: 'Lab/Proves', tag: 'review' },

  // Tècnic (visors o pantalles d'eines internes accessibles)
  { path: '/ec-preview', label: 'EC Preview (full)', group: 'Tècnic', tag: 'dev-only' },
  { path: '/ec-preview-lite', label: 'EC Preview Lite', group: 'Tècnic', tag: 'dev-only' },
  { path: '/user-icon-picker', label: 'User Icon Picker', group: 'Tècnic', tag: 'dev-only' },
  { path: '/documentation-files', label: 'Documentation Files', group: 'Tècnic', tag: 'dev-only' },

  // Admin (login + nested layout)
  { path: '/admin-login', label: 'Admin Login', group: 'Admin', tag: 'admin' },
  { path: '/admin', label: 'Admin Studio Home', group: 'Admin', tag: 'admin' },
  { path: '/admin/controls', label: 'Admin · Controls', group: 'Admin', tag: 'admin' },
  { path: '/admin/plantilles', label: 'Admin · Plantilles', group: 'Admin', tag: 'admin' },
  { path: '/admin/wip', label: 'Admin · WIP', group: 'Admin', tag: 'admin' },
  { path: '/admin/demos', label: 'Admin · Demos', group: 'Admin', tag: 'admin' },
  { path: '/admin/index', label: 'Admin · Index', group: 'Admin', tag: 'admin' },
  { path: '/admin/promotions', label: 'Admin · Promocions', group: 'Admin', tag: 'admin' },
  { path: '/admin/ec-config', label: 'Admin · EC Config', group: 'Admin', tag: 'admin' },
  { path: '/admin/system-messages', label: 'Admin · System Messages', group: 'Admin', tag: 'admin' },
  { path: '/admin/media', label: 'Admin · Media', group: 'Admin', tag: 'admin' },
  { path: '/admin/hero', label: 'Admin · Hero', group: 'Admin', tag: 'admin' },
  { path: '/admin/collections', label: 'Admin · Col·leccions', group: 'Admin', tag: 'admin' },
  { path: '/admin/mockups', label: 'Admin · Mockups', group: 'Admin', tag: 'admin' },
  { path: '/admin/upload', label: 'Admin · Upload', group: 'Admin', tag: 'admin' },
  { path: '/admin/fulfillment', label: 'Admin · Fulfillment', group: 'Admin', tag: 'admin' },
  { path: '/admin/fulfillment-settings', label: 'Admin · Fulfillment Settings', group: 'Admin', tag: 'admin' },
  { path: '/admin/gelato-sync', label: 'Admin · Gelato Sync', group: 'Admin', tag: 'admin' },
  { path: '/admin/gelato-blank', label: 'Admin · Gelato Blank', group: 'Admin', tag: 'admin' },
  { path: '/admin/gelato-templates', label: 'Admin · Gelato Templates', group: 'Admin', tag: 'admin' },
  { path: '/admin/products-overview', label: 'Admin · Products Overview', group: 'Admin', tag: 'admin' },
  { path: '/admin/unitats', label: 'Admin · Unitats de Canvi', group: 'Admin', tag: 'admin' },
  { path: '/admin/draft/ruleta', label: 'Admin · Draft Ruleta', group: 'Admin', tag: 'admin' },
  { path: '/admin/studio', label: 'Admin · Studio (legacy)', group: 'Admin', tag: 'legacy-redirect' },
];

// Rutes que requereixen paràmetre (no s'inclouen a la Contact Sheet per defecte;
// es poden activar puntualment amb un sample id).
export const DYNAMIC_ROUTES = [
  { pattern: '/product/:id', label: 'Product Detail', group: 'Comerç', sample: null },
  { pattern: '/product-gelato/:id', label: 'Gelato Product Detail', group: 'Comerç', sample: null },
  { pattern: '/proves/product/:id', label: 'Product Detail (proves)', group: 'Lab/Proves', sample: null },
  { pattern: '/order-confirmation/:orderId', label: 'Order Confirmation', group: 'Comerç', sample: null },
  { pattern: '/fulfillment/:id', label: 'Fulfillment Detail', group: 'Admin', sample: null },
];

// Redireccions documentades (no es renderitzen a la Contact Sheet).
export const REDIRECTS = [
  { from: '/the-human-inside', to: '/thin' },
  { from: '/proves', to: '/lab/proves' },
  { from: '/wishlist', to: '/' },
  { from: '/tdp', to: '/constructor/tdp' },
  { from: '/dev-links', to: '/proves/dev-links' },
  { from: '/dev-components', to: '/proves/dev-components' },
  { from: '/layout-builder', to: '/proves/layout-builder' },
  { from: '/nike-tambe', to: '/proves/demo-nike-tambe' },
  { from: '/status', to: '/track' },
  { from: '/ruleta-demo', to: '/admin/draft/ruleta' },
  { from: '/index', to: '/admin/index' },
  { from: '/promotions', to: '/admin/promotions' },
  { from: '/ec-config', to: '/admin/ec-config' },
  { from: '/system-messages', to: '/admin/system-messages' },
  { from: '/hero-settings', to: '/admin/hero' },
  { from: '/colleccio-settings', to: '/admin/collections' },
  { from: '/mockups', to: '/admin/mockups' },
  { from: '/fulfillment', to: '/admin/fulfillment' },
  { from: '/fulfillment-settings', to: '/admin/fulfillment-settings' },
  { from: '/admin/draft', to: '/admin/draft/ruleta' },
];

export const TAG_COLORS = {
  'keep': '#16a34a',
  'review': '#d97706',
  'dev-only': '#6366f1',
  'admin': '#0f172a',
  'legacy-redirect': '#94a3b8',
};
