/**
 * Sistema d'analytics centralitzat
 * Suporta: Google Analytics 4, Meta Pixel, events personalitzats
 */

const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;
const IS_DEV = import.meta.env.DEV;
const DEBUG_ANALYTICS = import.meta.env.VITE_DEBUG === 'true' || IS_DEV;

// Mock analytics en desenvolupament
const mockAnalytics = {
  initialized: false,
  events: []
};

/**
 * Inicialitzar analytics
 */
export const initAnalytics = () => {
  if (DEBUG_ANALYTICS) {
    console.log('📊 Analytics: Mode debug activat');
    mockAnalytics.initialized = true;
    return;
  }

  // Google Analytics 4
  if (GA4_MEASUREMENT_ID && typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA4_MEASUREMENT_ID);

    // Carregar script de GA4
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    console.log('✅ Google Analytics 4 inicialitzat');
  }

  // Meta Pixel
  if (META_PIXEL_ID && typeof window !== 'undefined') {
    !function(f,b,e,v,n,t,s) {
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)
    }(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');

    console.log('✅ Meta Pixel inicialitzat');
  }
};

/**
 * Registrar event personalitzat
 */
export const trackEvent = (eventName, eventParams = {}) => {
  if (DEBUG_ANALYTICS) {
    console.log(`📊 Event: ${eventName}`, eventParams);
    mockAnalytics.events.push({ eventName, eventParams, timestamp: new Date() });
    return;
  }

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', eventName, eventParams);
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq('trackCustom', eventName, eventParams);
  }
};

/**
 * Registrar vista de pàgina
 */
export const trackPageView = (pagePath, pageTitle) => {
  if (DEBUG_ANALYTICS) {
    console.log(`📊 PageView: ${pagePath} (${pageTitle})`);
    mockAnalytics.events.push({
      eventName: 'page_view',
      eventParams: { pagePath, pageTitle },
      timestamp: new Date()
    });
    return;
  }

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle
    });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }
};

/**
 * Registrar visualització de producte
 */
export const trackProductView = (product) => {
  const eventParams = {
    item_id: product.id,
    item_name: product.name,
    item_category: product.collection,
    price: product.price,
    currency: 'EUR'
  };

  trackEvent('view_item', eventParams);

  // Meta Pixel ViewContent
  if (window.fbq && !DEBUG_ANALYTICS) {
    window.fbq('track', 'ViewContent', {
      content_ids: [product.id],
      content_type: 'product',
      value: product.price,
      currency: 'EUR'
    });
  }
};

/**
 * Registrar afegir al cistell
 */
export const trackAddToCart = (product, quantity = 1) => {
  const eventParams = {
    item_id: product.id,
    item_name: product.name,
    item_category: product.collection,
    price: product.price,
    quantity: quantity,
    currency: 'EUR',
    value: product.price * quantity
  };

  trackEvent('add_to_cart', eventParams);

  // Meta Pixel AddToCart
  if (window.fbq && !DEBUG_ANALYTICS) {
    window.fbq('track', 'AddToCart', {
      content_ids: [product.id],
      content_type: 'product',
      value: product.price * quantity,
      currency: 'EUR'
    });
  }
};

/**
 * Registrar eliminar del cistell
 */
export const trackRemoveFromCart = (product, quantity = 1) => {
  const eventParams = {
    item_id: product.id,
    item_name: product.name,
    item_category: product.collection,
    price: product.price,
    quantity: quantity,
    currency: 'EUR',
    value: product.price * quantity
  };

  trackEvent('remove_from_cart', eventParams);
};

/**
 * Registrar inici de checkout
 */
export const trackBeginCheckout = (items, totalValue) => {
  const eventParams = {
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.collection,
      price: item.price,
      quantity: item.quantity
    })),
    value: totalValue,
    currency: 'EUR'
  };

  trackEvent('begin_checkout', eventParams);

  // Meta Pixel InitiateCheckout
  if (window.fbq && !DEBUG_ANALYTICS) {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: items.map(i => i.id),
      contents: items.map(i => ({ id: i.id, quantity: i.quantity })),
      value: totalValue,
      currency: 'EUR'
    });
  }
};

/**
 * Registrar compra completada
 */
export const trackPurchase = (orderId, items, totalValue, shippingCost = 0, tax = 0) => {
  const eventParams = {
    transaction_id: orderId,
    value: totalValue,
    currency: 'EUR',
    shipping: shippingCost,
    tax: tax,
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.collection,
      price: item.price,
      quantity: item.quantity
    }))
  };

  trackEvent('purchase', eventParams);

  // Meta Pixel Purchase
  if (window.fbq && !DEBUG_ANALYTICS) {
    window.fbq('track', 'Purchase', {
      content_ids: items.map(i => i.id),
      contents: items.map(i => ({ id: i.id, quantity: i.quantity })),
      value: totalValue,
      currency: 'EUR'
    });
  }
};

/**
 * Registrar cerca de productes
 */
export const trackSearch = (searchTerm, resultsCount) => {
  const eventParams = {
    search_term: searchTerm,
    results_count: resultsCount
  };

  trackEvent('search', eventParams);

  // Meta Pixel Search
  if (window.fbq && !DEBUG_ANALYTICS) {
    window.fbq('track', 'Search', {
      search_string: searchTerm
    });
  }
};

/**
 * Registrar clic en producte
 */
export const trackProductClick = (product, position, listName) => {
  const eventParams = {
    item_id: product.id,
    item_name: product.name,
    item_category: product.collection,
    price: product.price,
    index: position,
    item_list_name: listName
  };

  trackEvent('select_item', eventParams);
};

/**
 * Registrar compartir
 */
export const trackShare = (contentType, itemId, method) => {
  const eventParams = {
    content_type: contentType,
    item_id: itemId,
    method: method
  };

  trackEvent('share', eventParams);
};

/**
 * Registrar afegir a wishlist
 */
export const trackAddToWishlist = (product) => {
  const eventParams = {
    item_id: product.id,
    item_name: product.name,
    item_category: product.collection,
    price: product.price,
    currency: 'EUR'
  };

  trackEvent('add_to_wishlist', eventParams);

  // Meta Pixel AddToWishlist
  if (window.fbq && !DEBUG_ANALYTICS) {
    window.fbq('track', 'AddToWishlist', {
      content_ids: [product.id],
      value: product.price,
      currency: 'EUR'
    });
  }
};

/**
 * Obtenir events mock (només desenvolupament)
 */
export const getMockEvents = () => {
  if (DEBUG_ANALYTICS) {
    return mockAnalytics.events;
  }
  return [];
};

/**
 * Netejar events mock
 */
export const clearMockEvents = () => {
  if (DEBUG_ANALYTICS) {
    mockAnalytics.events = [];
    console.log('🗑️ Analytics events cleared');
  }
};

export default {
  initAnalytics,
  trackEvent,
  trackPageView,
  trackProductView,
  trackAddToCart,
  trackRemoveFromCart,
  trackBeginCheckout,
  trackPurchase,
  trackSearch,
  trackProductClick,
  trackShare,
  trackAddToWishlist,
  getMockEvents,
  clearMockEvents
};
