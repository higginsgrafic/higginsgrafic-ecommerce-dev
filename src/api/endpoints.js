import apiClient from './client';

/**
 * Endpoints de l'API
 * En desenvolupament utilitzen mocks, en producció connecten amb backend real
 */

const USE_MOCK = import.meta.env.DEV || !import.meta.env.VITE_API_URL;

// ==================== PRODUCTES ====================

export const productsAPI = {
  /**
   * Obtenir tots els productes
   */
  getAll: async (params = {}) => {
    if (USE_MOCK) {
      // Mock: retornar mockProducts
      const { mockProducts, mockProductsBlava, mockProductsNegra, mockProductsGreen, mockProductsCube } = await import('@/data/mockProducts.jsx');
      return [...mockProducts, ...mockProductsBlava, ...mockProductsNegra, ...mockProductsGreen, ...mockProductsCube];
    }
    return apiClient.get('/products', { params });
  },

  /**
   * Obtenir un producte per ID
   */
  getById: async (id) => {
    if (USE_MOCK) {
      const products = await productsAPI.getAll();
      return products.find(p => p.id === parseInt(id));
    }
    return apiClient.get(`/products/${id}`);
  },

  /**
   * Obtenir productes per col·lecció
   */
  getByCollection: async (collection) => {
    if (USE_MOCK) {
      const products = await productsAPI.getAll();
      return products.filter(p => p.collection === collection);
    }
    return apiClient.get(`/products/collection/${collection}`);
  },

  /**
   * Cercar productes
   */
  search: async (query) => {
    if (USE_MOCK) {
      const products = await productsAPI.getAll();
      const lowercaseQuery = query.toLowerCase();
      return products.filter(p =>
        p.name.toLowerCase().includes(lowercaseQuery) ||
        p.description.toLowerCase().includes(lowercaseQuery)
      );
    }
    return apiClient.get('/products/search', { params: { q: query } });
  },

  /**
   * Obtenir variants d'un producte
   */
  getVariants: async (productId) => {
    if (USE_MOCK) {
      const { generateVariantsForProduct } = await import('@/data/productVariants');
      const product = await productsAPI.getById(productId);
      return generateVariantsForProduct(productId, product?.price || 29.99);
    }
    return apiClient.get(`/products/${productId}/variants`);
  }
};

// ==================== COMANDES ====================

export const ordersAPI = {
  /**
   * Crear nova comanda
   */
  create: async (orderData) => {
    if (USE_MOCK) {
      // Mock: retornar comanda simulada
      return {
        id: 'GRF-2024-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        ...orderData,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
    }
    return apiClient.post('/orders', orderData);
  },

  /**
   * Obtenir comanda per ID
   */
  getById: async (orderId) => {
    if (USE_MOCK) {
      // Mock: retornar dades simulades
      return {
        id: orderId,
        status: 'processing',
        items: [],
        total: 0,
        createdAt: new Date().toISOString()
      };
    }
    return apiClient.get(`/orders/${orderId}`);
  },

  /**
   * Obtenir comandes de l'usuari
   */
  getUserOrders: async () => {
    if (USE_MOCK) {
      return [];
    }
    return apiClient.get('/orders/user');
  }
};

// ==================== PAGAMENTS ====================

export const paymentsAPI = {
  /**
   * Crear intenció de pagament amb Stripe
   */
  createPaymentIntent: async (amount, currency = 'EUR') => {
    if (USE_MOCK) {
      // Mock: retornar client secret simulat
      return {
        clientSecret: 'pi_test_' + Math.random().toString(36).substr(2, 9),
        amount,
        currency
      };
    }
    return apiClient.post('/payments/intent', { amount, currency });
  },

  /**
   * Confirmar pagament
   */
  confirmPayment: async (paymentIntentId) => {
    if (USE_MOCK) {
      return {
        status: 'succeeded',
        paymentIntentId
      };
    }
    return apiClient.post('/payments/confirm', { paymentIntentId });
  }
};

// ==================== USUARIS ====================

export const usersAPI = {
  /**
   * Registrar nou usuari
   */
  register: async (userData) => {
    if (USE_MOCK) {
      return {
        id: Math.random().toString(36).substr(2, 9),
        ...userData,
        createdAt: new Date().toISOString()
      };
    }
    return apiClient.post('/users/register', userData);
  },

  /**
   * Login
   */
  login: async (email, password) => {
    if (USE_MOCK) {
      return {
        token: 'mock_token_' + Math.random().toString(36).substr(2, 9),
        user: {
          id: '1',
          email,
          name: 'Test User'
        }
      };
    }
    return apiClient.post('/users/login', { email, password });
  },

  /**
   * Obtenir perfil de l'usuari
   */
  getProfile: async () => {
    if (USE_MOCK) {
      return {
        id: '1',
        email: 'test@example.com',
        name: 'Test User'
      };
    }
    return apiClient.get('/users/profile');
  }
};

// ==================== GELATO ====================

export const gelatoAPI = {
  /**
   * Sincronitzar catàleg de productes
   */
  syncCatalog: async () => {
    if (USE_MOCK) {
      return { synced: true, count: 20 };
    }
    return apiClient.post('/gelato/sync-catalog');
  },

  /**
   * Crear comanda a Gelato
   */
  createOrder: async (orderData) => {
    if (USE_MOCK) {
      return {
        gelatoOrderId: 'GLT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        status: 'processing'
      };
    }
    return apiClient.post('/gelato/orders', orderData);
  },

  /**
   * Obtenir estat d'una comanda de Gelato
   */
  getOrderStatus: async (gelatoOrderId) => {
    if (USE_MOCK) {
      return {
        gelatoOrderId,
        status: 'in_production',
        trackingNumber: null
      };
    }
    return apiClient.get(`/gelato/orders/${gelatoOrderId}`);
  }
};

// ==================== CONFIGURACIÓ ====================

export const configAPI = {
  /**
   * Obtenir configuració del header d'ofertes
   * Retorna: { enabled: boolean, text: string, link: string }
   */
  getOffersConfig: async () => {
    if (USE_MOCK) {
      // Mock: retornar configuració per defecte
      // En producció, això vindria del WordPress (custom field o ACF)
      return {
        enabled: import.meta.env.VITE_OFFERS_ENABLED !== 'false',
        text: 'Enviament gratuït en comandes superiors a 50€',
        link: '/offers'
      };
    }
    return apiClient.get('/config/offers-header');
  },

  /**
   * Actualitzar configuració del header d'ofertes (només admin)
   */
  updateOffersConfig: async (config) => {
    if (USE_MOCK) {
      return { success: true, config };
    }
    return apiClient.post('/config/offers-header', config);
  }
};

export default {
  products: productsAPI,
  orders: ordersAPI,
  payments: paymentsAPI,
  users: usersAPI,
  gelato: gelatoAPI,
  config: configAPI,

  // Shortcuts per compatibilitat
  getOffersConfig: configAPI.getOffersConfig,
  updateOffersConfig: configAPI.updateOffersConfig
};
