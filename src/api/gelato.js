/**
 * Servei d'integració amb Gelato Print on Demand API
 * Documentació: https://gelato.com/api-docs
 */

import apiClient from './client';

const GELATO_PRODUCTS_API = 'https://product.gelatoapis.com/v3';
const GELATO_ORDER_API = 'https://order.gelatoapis.com/v4';
// GELATO_API_KEY removed from client — server-side only via Netlify functions and edge function

const GELATO_COST_PRICE = 5.91;
const SELLING_PRICE = 15.50;

function calculateSellingPrice() {
  return SELLING_PRICE;
}

/**
 * Client específic per Gelato
 */
class GelatoClient {
  constructor() {
    this.storeId = import.meta.env.VITE_GELATO_STORE_ID;
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    this.edgeFunctionUrl = `${this.supabaseUrl}/functions/v1/gelato-proxy`;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.supabaseAnonKey}`,
      'apikey': this.supabaseAnonKey
    };
  }

  async request(endpoint, options = {}, useOrdersAPI = false) {
    try {
      // Construir URL de la edge function amb paràmetres
      let url;
      try {
        url = new URL(this.edgeFunctionUrl);
      } catch {
        throw new Error('Supabase config invalid: VITE_SUPABASE_URL must be a valid URL');
      }

      // Determinar acció basant-se en l'endpoint
      if (endpoint === '/catalogs') {
        url.searchParams.set('action', 'catalogs');
      } else if (endpoint.startsWith('/catalogs/')) {
        url.searchParams.set('action', 'catalog');
        const catalogId = endpoint.split('/')[2];
        if (catalogId && catalogId !== 'products') {
          url.searchParams.set('catalogId', catalogId);
        }
      } else if (endpoint === '/products') {
        url.searchParams.set('action', 'catalog');
      } else if (endpoint.includes('/prices')) {
        url.searchParams.set('action', 'prices');
        const parts = endpoint.split('/');
        const productId = parts[2];
        url.searchParams.set('productId', productId);
      } else if (endpoint.startsWith('/products/')) {
        url.searchParams.set('action', 'product');
        const productId = endpoint.split('/')[2];
        url.searchParams.set('productId', productId);
      } else if (endpoint.startsWith('/orders')) {
        url.searchParams.set('action', 'order');
        if (endpoint !== '/orders') {
          const orderId = endpoint.split('/')[2];
          url.searchParams.set('orderId', orderId);
        }
      }

            const response = await fetch(url.toString(), {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers
        }
      });

            if (!response.ok) {
        const errorText = await response.text();
                let errorMessage = 'Gelato API error';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorText;
        } catch {
          errorMessage = errorText || `HTTP ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
                        if (data?.products?.length > 0) {
              }

      return data;
    } catch (error) {
                        throw error;
    }
  }

  // ==================== CATÀLEG ====================

  /**
   * Obtenir llista de catàlegs disponibles
   */
  async listCatalogs() {
    return this.request('/catalogs');
  }

  /**
   * Obtenir catàleg de productes disponibles
   * Cerca productes d'un catàleg específic
   */
  async getCatalog(catalogUid = null, filters = {}) {
    const params = new URLSearchParams();

    if (catalogUid) {
      params.append('catalogUid', catalogUid);
    }

    if (filters.productType) {
      params.append('productType', filters.productType);
    }

    if (filters.limit) {
      params.append('limit', filters.limit);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';

        return this.request(endpoint);
  }

  /**
   * Obtenir detalls d'un producte
   */
  async getProduct(productUid) {
    return this.request(`/products/${productUid}`);
  }

  /**
   * Obtenir preus d'un producte
   */
  async getProductPrices(productUid) {
    const url = new URL(this.edgeFunctionUrl);
    url.searchParams.set('action', 'prices');
    url.searchParams.set('productId', productUid);
    url.searchParams.set('currency', 'EUR');
    url.searchParams.set('country', 'ES');
    const response = await fetch(url.toString(), {
      headers: this.headers
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gelato prices error: ${response.status} - ${errorText}`);
    }
    return response.json();
  }

  // ==================== STORE PRODUCTS ====================

  /**
   * Llistar productes de la botiga
   */
  async listStoreProducts(options = {}) {
    try {
      const url = new URL(this.edgeFunctionUrl);
      url.searchParams.set('action', 'store-products');
      if (this.storeId) {
        url.searchParams.set('storeId', this.storeId);
      }

      if (options?.limit != null) {
        url.searchParams.set('limit', options.limit);
      }
      if (options?.offset != null) {
        url.searchParams.set('offset', options.offset);
      }

            const response = await fetch(url.toString(), {
        headers: this.headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error obtenint productes: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
            return data;
    } catch (error) {
            throw error;
    }
  }

  async listAllStoreProducts(options = {}) {
    const pageSize = Number(options?.limit ?? 100);
    const maxPages = Number(options?.maxPages ?? 50);

    const all = [];
    let offset = Number(options?.offset ?? 0);

    for (let page = 0; page < maxPages; page++) {
      const response = await this.listStoreProducts({ limit: pageSize, offset });
      const items = Array.isArray(response?.data)
        ? response.data
        : (Array.isArray(response?.products) ? response.products : (Array.isArray(response) ? response : []));

      all.push(...items);

      if (items.length < pageSize) {
        break;
      }

      offset += items.length;
    }

    return all;
  }

  /**
   * Obtenir detalls d'un producte de la botiga
   */
  async getStoreProduct(productId) {
    try {
      const url = new URL(this.edgeFunctionUrl);
      url.searchParams.set('action', 'store-product');
      url.searchParams.set('productId', productId);
      if (this.storeId) {
        url.searchParams.set('storeId', this.storeId);
      }

            const response = await fetch(url.toString(), {
        headers: this.headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error obtenint producte: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
            return data;
    } catch (error) {
            throw error;
    }
  }

  /**
   * Obtenir template (si el producte té templateId)
   */
  async getTemplate(templateId) {
    try {
      const url = new URL(this.edgeFunctionUrl);
      url.searchParams.set('action', 'template');
      url.searchParams.set('templateId', templateId);

            const response = await fetch(url.toString(), {
        headers: this.headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error obtenint template: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
            return data;
    } catch (error) {
            throw error;
    }
  }

  // ==================== COMANDES ====================

  /**
   * Crear comanda a Gelato
   */
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    }, true);
  }

  /**
   * Obtenir estat d'una comanda
   */
  async getOrder(orderId) {
    return this.request(`/orders/${orderId}`, {}, true);
  }

  /**
   * Cancel·lar comanda
   */
  async cancelOrder(orderId) {
    return this.request(`/orders/${orderId}`, {
      method: 'DELETE'
    }, true);
  }

  /**
   * Obtenir quote per un producte
   */
  async getQuote(quoteData) {
    return this.request('/quotes', {
      method: 'POST',
      body: JSON.stringify(quoteData)
    }, true);
  }
}

// Instància del client Gelato (read-only catalog via edge function)
const gelatoClient = new GelatoClient();

// ==================== MAPEJAT DE PRODUCTES ====================

/**
 * Mapejar producte de Gelato al format intern
 */
export const mapGelatoProduct = (gelatoProduct, index = 0) => {
  const productName = gelatoProduct.productNameUid || gelatoProduct.productTypeUid || 'product';
  const productId = gelatoProduct.productUid || gelatoProduct.id;

  const sizes = [];
  const colors = [];
  const variants = [];

  const dimensions = gelatoProduct.dimensions || [];

    dimensions.forEach(dim => {
    if (dim.name === 'size' || dim.name === 'GarmentSize') {
      if (dim.value && !sizes.includes(dim.value)) {
        sizes.push(dim.value);
      }
    }
    if (dim.name === 'color' || dim.name === 'Color') {
      if (dim.value && !colors.includes(dim.value)) {
        colors.push(dim.value);
      }
    }

    if (dim.valueFormatted) {
      const variantData = {
        gelato_variant_id: productId,
        size: dim.value || 'M',
        color: dim.valueFormatted || 'Default',
        color_hex: '#FFFFFF',
        price: calculateSellingPrice(),
        stock: 999,
        is_available: true
      };
      variants.push(variantData);
    }
  });

  const images = extractProductImages(gelatoProduct, index);

    return {
    id: productId,
    name: formatProductName(productName),
    description: `${formatProductName(productName)} - Print on Demand`,
    price: calculateSellingPrice(),
    currency: 'EUR',
    images: images,
    category: 'apparel',
    collection: mapGelatoProductType(gelatoProduct.productTypeUid),
    sku: productId,
    gelatoProductId: productId,
    sizes: sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
    variants: variants.length > 0 ? variants : []
  };
};

function extractProductImages(gelatoProduct, index) {
      const images = [];

  // Intentar diferents camps on podrien estar les imatges
  if (gelatoProduct.previewUrl) {
    images.push(gelatoProduct.previewUrl);
      }

  if (gelatoProduct.imageUrl) {
    images.push(gelatoProduct.imageUrl);
      }

  if (gelatoProduct.thumbnailUrl) {
    images.push(gelatoProduct.thumbnailUrl);
      }

  if (gelatoProduct.preview && typeof gelatoProduct.preview === 'string') {
    images.push(gelatoProduct.preview);
      }

  if (gelatoProduct.image && typeof gelatoProduct.image === 'string') {
    images.push(gelatoProduct.image);
      }

  // Si hi ha un array d'imatges
  if (Array.isArray(gelatoProduct.images)) {
    gelatoProduct.images.forEach(img => {
      if (typeof img === 'string') {
        images.push(img);
              } else if (img && img.url) {
        images.push(img.url);
              }
    });
  }

  // Si hi ha mockups
  if (Array.isArray(gelatoProduct.mockups)) {
    gelatoProduct.mockups.forEach(mockup => {
      if (mockup && mockup.url) {
        images.push(mockup.url);
              }
    });
  }

  // Si no hem trobat cap imatge, utilitzar placeholder
  if (images.length === 0) {
    const placeholder = `/products/gelato-${index + 1}.jpg`;
    images.push(placeholder);
      }

    return images;
}

function formatProductName(nameUid) {
  return nameUid
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Mapejar variant de Gelato
 */
export const mapGelatoVariant = (gelatoVariant) => {
  return {
    sku: gelatoVariant.sku,
    size: mapGelatoSize(gelatoVariant.size),
    color: mapGelatoColor(gelatoVariant.color),
    price: gelatoVariant.price?.amount || calculateSellingPrice(),
    stock: gelatoVariant.available ? 999 : 0, // Gelato té stock il·limitat
    isAvailable: gelatoVariant.available,
    image: gelatoVariant.image?.url || null,
    gelatoVariantId: gelatoVariant.uid
  };
};

/**
 * Mapejar tipus de producte de Gelato a col·lecció interna
 */
const mapGelatoProductType = (productTypeUid) => {
  if (!productTypeUid) return 'first-contact';

  const productType = productTypeUid.toLowerCase();

  if (productType.includes('t-shirt') || productType.includes('tshirt') || productType.includes('apparel')) {
    const collections = ['first-contact', 'the-human-inside', 'austen', 'cube', 'miscellania'];
    const hash = productTypeUid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return collections[hash % collections.length];
  }

  return 'first-contact';
};

/**
 * Mapejar talla de Gelato a format intern
 */
const mapGelatoSize = (gelatoSize) => {
  const sizeMap = {
    'XS': { id: 'xs', label: 'XS' },
    'S': { id: 's', label: 'S' },
    'M': { id: 'm', label: 'M' },
    'L': { id: 'l', label: 'L' },
    'XL': { id: 'xl', label: 'XL' },
    'XXL': { id: 'xxl', label: 'XXL' }
  };
  return sizeMap[gelatoSize] || { id: 'm', label: 'M' };
};

/**
 * Mapejar color de Gelato a format intern
 */
const mapGelatoColor = (gelatoColor) => {
  const colorMap = {
    'white': { id: 'white', label: 'Blanc', hex: '#FFFFFF' },
    'black': { id: 'black', label: 'Negre', hex: '#181818' },
    'navy': { id: 'blue', label: 'Blau', hex: '#2563EB' },
    'green': { id: 'green', label: 'Verd', hex: '#10B981' },
    'red': { id: 'red', label: 'Vermell', hex: '#DC2626' }
  };
  return colorMap[gelatoColor.toLowerCase()] || { id: 'white', label: 'Blanc', hex: '#FFFFFF' };
};

// ==================== SINCRONITZACIÓ ====================

/**
 * Sincronitzar catàleg de Gelato amb base de dades local
 * Obté productes individuals amb les seves variants i UIDs
 */
export const syncGelatoCatalog = async () => {
      if (!gelatoClient) {
        return [];
  }

  try {
            const productsResponse = await gelatoClient.getCatalog(null);

                if (!productsResponse || !productsResponse.products || productsResponse.products.length === 0) {
                              return [];
    }

        // Obtenir detalls complets de cada producte (amb variants)
    const detailedProducts = [];
    const productsToFetch = productsResponse.products.slice(0, 30);

        for (let i = 0; i < productsToFetch.length; i++) {
      const product = productsToFetch[i];
      const productUid = product.productUid;

      try {
                const detailedProduct = await gelatoClient.getProduct(productUid);

                detailedProducts.push(detailedProduct);
      } catch (error) {
                detailedProducts.push(product);
      }
    }

    const mappedProducts = detailedProducts.map((product, index) => mapGelatoProduct(product, index));

    const collections = [...new Set(mappedProducts.map(p => p.collection))];
            return mappedProducts;
  } catch (error) {
                    throw error;
  }
};

/**
 * Crear comanda a Gelato — DEPRECATED
 * La creació de comandes Gelato es fa server-side via stripe-webhook.js
 * quan es confirma el pagament. Aquesta funció retorna error per evitar
 * ús client-side.
 */
export const createGelatoOrder = async () => {
  throw new Error('La creació de comandes Gelato es fa server-side via stripe-webhook');
};

/**
 * Obtenir estat d'enviament de Gelato
 */
export const getGelatoOrderStatus = async (gelatoOrderId) => {
  if (!gelatoClient) {
    return {
      orderId: gelatoOrderId,
      status: 'in_production',
      trackingNumber: null
    };
  }

  try {
    const order = await gelatoClient.getOrder(gelatoOrderId);
    return {
      orderId: order.orderId,
      status: order.status,
      trackingNumber: order.tracking?.trackingNumber || null,
      trackingUrl: order.tracking?.trackingUrl || null,
      estimatedDelivery: order.estimatedDelivery || null
    };
  } catch (error) {
        throw error;
  }
};

/**
 * Sincronitzar productes de la botiga amb base de dades
 */
export const syncGelatoStoreProducts = async () => {
    if (!gelatoClient) {
        return [];
  }

  try {
    const products = await gelatoClient.listAllStoreProducts();
        const detailedProducts = [];

    for (const product of products) {
      try {
                if (product.templateId) {
                    try {
            const templateData = await gelatoClient.getTemplate(product.templateId);
            product.template = templateData;
          } catch (error) {
                      }
        }

        detailedProducts.push(product);
              } catch (error) {
              }
    }

        return detailedProducts;
  } catch (error) {
        throw error;
  }
};

export { gelatoClient };
export default {
  syncCatalog: syncGelatoCatalog,
  syncStoreProducts: syncGelatoStoreProducts,
  getOrderStatus: getGelatoOrderStatus,
  mapProduct: mapGelatoProduct,
  mapVariant: mapGelatoVariant
};
