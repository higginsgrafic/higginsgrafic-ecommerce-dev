/**
 * Servei d'integració amb Gelato Print on Demand API
 * Documentació: https://gelato.com/api-docs
 */

import apiClient from './client';

const GELATO_PRODUCTS_API = 'https://product.gelatoapis.com/v3';
const GELATO_ORDER_API = 'https://order.gelatoapis.com/v4';
const GELATO_API_KEY = import.meta.env.VITE_GELATO_API_KEY;
const GELATO_SANDBOX = import.meta.env.VITE_GELATO_SANDBOX === 'true';

/**
 * Client específic per Gelato
 */
class GelatoClient {
  constructor(apiKey, sandbox = false) {
    this.apiKey = apiKey;
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

      console.log('🌐 [REQUEST] Edge Function URL:', url.toString());

      const response = await fetch(url.toString(), {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers
        }
      });

      console.log('🌐 [RESPONSE] Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🌐 [RESPONSE] Error body:', errorText);
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
      console.log('🌐 [RESPONSE] Data type:', typeof data);
      console.log('🌐 [RESPONSE] Has products?', data?.products ? 'YES' : 'NO');
      console.log('🌐 [RESPONSE] Products count:', data?.products?.length || 0);
      if (data?.products?.length > 0) {
        console.log('🌐 [RESPONSE] First product:', data.products[0]);
      }

      return data;
    } catch (error) {
      console.error('❌ [REQUEST] Gelato API Error:', error);
      console.error('❌ [REQUEST] Error message:', error.message);
      console.error('❌ [REQUEST] Error stack:', error.stack);
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

    console.log('🌐 [API] Cridant:', `${this.productsBaseURL}${endpoint}`);

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
    return this.request(`/products/${productUid}/prices`);
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

      console.log('🎨 [API] Obtenint productes de la botiga...');

      const response = await fetch(url.toString(), {
        headers: this.headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error obtenint productes: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ [API] Productes obtinguts:', data);
      return data;
    } catch (error) {
      console.error('❌ [API] Error obtenint productes:', error);
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

      console.log(`🎨 [API] Obtenint producte ${productId}...`);

      const response = await fetch(url.toString(), {
        headers: this.headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error obtenint producte: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ [API] Producte obtingut:', data);
      return data;
    } catch (error) {
      console.error('❌ [API] Error obtenint producte:', error);
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

      console.log(`🎨 [API] Obtenint template ${templateId}...`);

      const response = await fetch(url.toString(), {
        headers: this.headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error obtenint template: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ [API] Template obtingut:', data);
      return data;
    } catch (error) {
      console.error('❌ [API] Error obtenint template:', error);
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

// Instància del client Gelato
const gelatoClient = GELATO_API_KEY
  ? new GelatoClient(GELATO_API_KEY, GELATO_SANDBOX)
  : null;

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

  console.log(`📐 [mapGelatoProduct] Dimensions for ${productId}:`, JSON.stringify(dimensions, null, 2));

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
        price: 29.99,
        stock: 999,
        is_available: true
      };
      variants.push(variantData);
    }
  });

  const images = extractProductImages(gelatoProduct, index);

  console.log(`📦 [mapGelatoProduct] Product ${productId} mapped:`, {
    name: formatProductName(productName),
    dimensions: dimensions.length,
    sizes: sizes.length,
    colors: colors.length,
    variants: variants.length,
    fullProduct: gelatoProduct
  });

  return {
    id: productId,
    name: formatProductName(productName),
    description: `${formatProductName(productName)} - Print on Demand`,
    price: 29.99,
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
  console.log('🖼️ [extractProductImages] Extracting images for product:', gelatoProduct.productUid);
  console.log('🖼️ [extractProductImages] Full product data:', JSON.stringify(gelatoProduct, null, 2));

  const images = [];

  // Intentar diferents camps on podrien estar les imatges
  if (gelatoProduct.previewUrl) {
    images.push(gelatoProduct.previewUrl);
    console.log('✅ Found previewUrl:', gelatoProduct.previewUrl);
  }

  if (gelatoProduct.imageUrl) {
    images.push(gelatoProduct.imageUrl);
    console.log('✅ Found imageUrl:', gelatoProduct.imageUrl);
  }

  if (gelatoProduct.thumbnailUrl) {
    images.push(gelatoProduct.thumbnailUrl);
    console.log('✅ Found thumbnailUrl:', gelatoProduct.thumbnailUrl);
  }

  if (gelatoProduct.preview && typeof gelatoProduct.preview === 'string') {
    images.push(gelatoProduct.preview);
    console.log('✅ Found preview:', gelatoProduct.preview);
  }

  if (gelatoProduct.image && typeof gelatoProduct.image === 'string') {
    images.push(gelatoProduct.image);
    console.log('✅ Found image:', gelatoProduct.image);
  }

  // Si hi ha un array d'imatges
  if (Array.isArray(gelatoProduct.images)) {
    gelatoProduct.images.forEach(img => {
      if (typeof img === 'string') {
        images.push(img);
        console.log('✅ Found image from array:', img);
      } else if (img && img.url) {
        images.push(img.url);
        console.log('✅ Found image.url from array:', img.url);
      }
    });
  }

  // Si hi ha mockups
  if (Array.isArray(gelatoProduct.mockups)) {
    gelatoProduct.mockups.forEach(mockup => {
      if (mockup && mockup.url) {
        images.push(mockup.url);
        console.log('✅ Found mockup.url:', mockup.url);
      }
    });
  }

  // Si no hem trobat cap imatge, utilitzar placeholder
  if (images.length === 0) {
    const placeholder = `/products/gelato-${index + 1}.jpg`;
    images.push(placeholder);
    console.log('⚠️ No images found, using placeholder:', placeholder);
  }

  console.log('🖼️ [extractProductImages] Final images:', images);
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
    price: gelatoVariant.price?.amount || 0,
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
    const collections = ['first-contact', 'the-human-inside', 'austen', 'cube', 'outcasted'];
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
  console.log('🔍 [syncGelatoCatalog] Iniciant...');
  console.log('🔍 [syncGelatoCatalog] gelatoClient:', gelatoClient ? 'EXISTEIX' : 'NULL');

  if (!gelatoClient) {
    console.warn('⚠️ Gelato API Key no configurada, utilitzant dades mock');
    return [];
  }

  try {
    console.log('📦 Obtenint productes de Gelato...');

    console.log('🔍 [syncGelatoCatalog] Cridant getCatalog(null)...');
    const productsResponse = await gelatoClient.getCatalog(null);

    console.log('🔍 [syncGelatoCatalog] getCatalog() ha retornat:', productsResponse);
    console.log('🔍 [syncGelatoCatalog] Type:', typeof productsResponse);
    console.log('🔍 [syncGelatoCatalog] Keys:', productsResponse ? Object.keys(productsResponse) : 'NULL');

    if (!productsResponse || !productsResponse.products || productsResponse.products.length === 0) {
      console.warn('⚠️ No s\'han trobat productes a Gelato');
      console.warn('   productsResponse:', productsResponse);
      console.warn('   productsResponse.products:', productsResponse?.products);
      console.warn('   Assegureu-vos que el vostre compte té productes configurats');
      return [];
    }

    console.log(`✅ Trobats ${productsResponse.products.length} productes al vostre catàleg`);

    // Obtenir detalls complets de cada producte (amb variants)
    const detailedProducts = [];
    const productsToFetch = productsResponse.products.slice(0, 30);

    console.log(`🔄 Obtenint detalls i variants de ${productsToFetch.length} productes...`);

    for (let i = 0; i < productsToFetch.length; i++) {
      const product = productsToFetch[i];
      const productUid = product.productUid;

      try {
        console.log(`📦 [${i + 1}/${productsToFetch.length}] Obtenint detalls de ${productUid}...`);
        const detailedProduct = await gelatoClient.getProduct(productUid);

        console.log(`✅ Producte obtingut:`, {
          uid: detailedProduct.productUid,
          name: detailedProduct.productNameUid,
          variants: detailedProduct.dimensions?.length || 0
        });

        detailedProducts.push(detailedProduct);
      } catch (error) {
        console.error(`❌ Error obtenint producte ${productUid}:`, error.message);
        detailedProducts.push(product);
      }
    }

    const mappedProducts = detailedProducts.map((product, index) => mapGelatoProduct(product, index));

    const collections = [...new Set(mappedProducts.map(p => p.collection))];
    console.log(`✅ Total sincronitzats: ${mappedProducts.length} productes`);
    console.log(`📚 Col·leccions assignades: ${collections.join(', ')}`);

    return mappedProducts;
  } catch (error) {
    console.error('❌ [syncGelatoCatalog] Error sincronitzant catàleg Gelato:', error);
    console.error('❌ [syncGelatoCatalog] Error type:', error.constructor.name);
    console.error('❌ [syncGelatoCatalog] Missatge:', error.message);
    console.error('❌ [syncGelatoCatalog] Stack:', error.stack);
    throw error;
  }
};

/**
 * Crear comanda a Gelato
 */
export const createGelatoOrder = async (orderData) => {
  if (!gelatoClient) {
    console.warn('⚠️ Gelato API Key no configurada, simulant comanda');
    return {
      orderId: 'GLT-MOCK-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      status: 'processing'
    };
  }

  try {
    // Transformar dades de comanda al format Gelato
    const gelatoOrderData = {
      orderReferenceId: orderData.id,
      currency: 'EUR',
      items: orderData.items.map(item => ({
        productUid: item.gelatoProductId,
        variantUid: item.gelatoVariantId,
        quantity: item.quantity,
        files: item.designFiles || [] // URLs dels dissenys personalitzats
      })),
      shippingAddress: {
        firstName: orderData.shippingAddress.firstName,
        lastName: orderData.shippingAddress.lastName,
        addressLine1: orderData.shippingAddress.street,
        city: orderData.shippingAddress.city,
        postCode: orderData.shippingAddress.postalCode,
        country: orderData.shippingAddress.country,
        email: orderData.email
      }
    };

    const response = await gelatoClient.createOrder(gelatoOrderData);

    console.log(`✅ Comanda creada a Gelato: ${response.orderId}`);

    return response;
  } catch (error) {
    console.error('❌ Error creant comanda a Gelato:', error);
    throw error;
  }
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
    console.error('❌ Error obtenint estat comanda Gelato:', error);
    throw error;
  }
};

/**
 * Sincronitzar productes de la botiga amb base de dades
 */
export const syncGelatoStoreProducts = async () => {
  console.log('🎨 [syncGelatoStoreProducts] Iniciant sincronització...');

  if (!gelatoClient) {
    console.warn('⚠️ Gelato API Key no configurada');
    return [];
  }

  try {
    const products = await gelatoClient.listAllStoreProducts();
    console.log(`✅ Trobats ${products.length} productes`);

    const detailedProducts = [];

    for (const product of products) {
      try {
        console.log(`📦 Processant producte ${product.id}...`);

        if (product.templateId) {
          console.log(`  Template ID: ${product.templateId}`);
          try {
            const templateData = await gelatoClient.getTemplate(product.templateId);
            product.template = templateData;
          } catch (error) {
            console.warn(`  ⚠️ No s'ha pogut obtenir el template: ${error.message}`);
          }
        }

        detailedProducts.push(product);
        console.log(`✅ Producte ${product.id} processat`);
      } catch (error) {
        console.error(`❌ Error processant producte ${product.id}:`, error);
      }
    }

    console.log(`✅ Total productes sincronitzats: ${detailedProducts.length}`);
    return detailedProducts;
  } catch (error) {
    console.error('❌ [syncGelatoStoreProducts] Error:', error);
    throw error;
  }
};

export { gelatoClient };
export default {
  syncCatalog: syncGelatoCatalog,
  syncStoreProducts: syncGelatoStoreProducts,
  createOrder: createGelatoOrder,
  getOrderStatus: getGelatoOrderStatus,
  mapProduct: mapGelatoProduct,
  mapVariant: mapGelatoVariant
};
