import { syncGelatoStoreProducts, mapGelatoProduct } from './gelato';
import productsService from './supabase-products';

export async function syncGelatoProductsToSupabase() {
  try {
    console.log('🔄 [SYNC] Iniciant sincronització productes de la teva botiga Gelato...');
    console.log('🔄 [SYNC] Cridant syncGelatoStoreProducts()...');

    const gelatoProducts = await syncGelatoStoreProducts();

    console.log('🔄 [SYNC] syncGelatoStoreProducts() ha retornat:', gelatoProducts);
    console.log('🔄 [SYNC] Nombre de productes:', gelatoProducts?.length || 0);

    if (!gelatoProducts || gelatoProducts.length === 0) {
      console.warn('⚠️ [SYNC] No s\'han trobat productes a la teva botiga Gelato');
      return { success: false, count: 0, error: 'No s\'han trobat productes a la teva botiga. Assegureu-vos que teniu productes creats al vostre compte de Gelato.' };
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const gelatoProduct of gelatoProducts) {
      try {
        const transformedProduct = transformStoreProductForSupabase(gelatoProduct);
        await productsService.upsertProduct(transformedProduct);
        results.push({ success: true, product: gelatoProduct.title || gelatoProduct.name });
        successCount++;
      } catch (error) {
        console.error(`❌ Error sincronitzant producte ${gelatoProduct.title || gelatoProduct.name}:`, error);
        results.push({ success: false, product: gelatoProduct.title || gelatoProduct.name, error: error.message });
        errorCount++;
      }
    }

    console.log(`✅ Sincronització completada: ${successCount} productes sincronitzats, ${errorCount} errors`);

    return {
      success: errorCount === 0,
      count: successCount,
      errors: errorCount,
      details: results
    };
  } catch (error) {
    console.error('❌ Error general en la sincronització:', error);
    return {
      success: false,
      count: 0,
      error: error.message
    };
  }
}

function transformStoreProductForSupabase(storeProduct) {
  const collectionMap = {
    'austen': 'austen',
    'first-contact': 'first-contact',
    'first contact': 'first-contact',
    'the-human-inside': 'the-human-inside',
    'human inside': 'the-human-inside',
    'cube': 'cube',
    'outcasted': 'outcasted',
    'dj vader': 'first-contact'
  };

  const productTitle = storeProduct.title || storeProduct.name || 'Product';
  const productTitleLower = productTitle.toLowerCase();

  const normalizeComparable = (value) => {
    return (value || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ');
  };

  let collection = 'first-contact';
  for (const [key, value] of Object.entries(collectionMap)) {
    if (productTitleLower.includes(key)) {
      collection = value;
      break;
    }
  }

  const mockupUrl = storeProduct.mockupUrl || storeProduct.previewUrl || storeProduct.imageUrl;
  const images = mockupUrl ? [mockupUrl] : [];

  const variants = (storeProduct.variants || []).map(v => {
    const colorMatch = v.title?.match(/Color\s+([^,]+)/i);
    const sizeMatch = v.title?.match(/Talla\s+(\w+)/i);

    const color = colorMatch ? colorMatch[1].trim() : 'Default';
    const size = sizeMatch ? sizeMatch[1].trim() : 'M';

    return {
      gelato_variant_id: v.id?.toString() || v.variantId?.toString(),
      sku: v.sku || '',
      size: size,
      color: color,
      color_hex: mapColorToHex(color),
      price: v.price || storeProduct.price || 29.99,
      stock: 999,
      is_available: true,
      image_url: v.mockupUrl || mockupUrl
    };
  });

  return {
    gelato_product_id: storeProduct.id?.toString() || storeProduct.productId?.toString(),
    name: productTitle,
    description: (() => {
      const raw = (storeProduct.description || '').toString().trim();
      if (!raw) return '';
      if (normalizeComparable(raw) === normalizeComparable(productTitle)) return '';
      return raw;
    })(),
    price: storeProduct.price || 29.99,
    currency: 'EUR',
    category: 'apparel',
    collection: collection,
    sku: storeProduct.sku || storeProduct.id?.toString() || '',
    is_active: true,
    product_type: 'fulfillment',
    product_images: images.map((url, index) => ({
      url,
      position: index
    })),
    product_variants: variants
  };
}

function mapColorToHex(colorName) {
  const colorMap = {
    'blanco': '#FFFFFF',
    'white': '#FFFFFF',
    'negro': '#181818',
    'black': '#181818',
    'armada': '#1E3A8A',
    'navy': '#1E3A8A',
    'azul': '#2563EB',
    'blue': '#2563EB',
    'verde': '#10B981',
    'green': '#10B981',
    'rojo': '#DC2626',
    'red': '#DC2626',
    'amarillo': '#FCD34D',
    'yellow': '#FCD34D',
    'gris': '#6B7280',
    'gray': '#6B7280'
  };

  const color = colorName.toLowerCase();
  return colorMap[color] || '#FFFFFF';
}

export async function syncMockProductsToSupabase() {
  try {
    console.log('🔄 Sincronitzant productes mock amb Supabase...');

    const { mockProducts, mockProductsBlava, mockProductsNegra, mockProductsGreen, mockProductsCube } = await import('@/data/mockProducts.jsx');
    const allMockProducts = [
      ...mockProducts,
      ...mockProductsBlava,
      ...mockProductsNegra,
      ...mockProductsGreen,
      ...mockProductsCube
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const mockProduct of allMockProducts) {
      try {
        const transformedProduct = {
          gelato_product_id: `mock-${mockProduct.id}`,
          name: mockProduct.name,
          description: mockProduct.description || '',
          price: mockProduct.price,
          currency: 'EUR',
          category: 'apparel',
          collection: mockProduct.collection || 'first-contact',
          sku: mockProduct.sku || `SKU-${mockProduct.id}`,
          is_active: true,
          product_type: 'mockup',
          product_images: mockProduct.images?.map((url, index) => ({
            url,
            position: index
          })) || [],
          product_variants: mockProduct.sizes?.map(size => ({
            size: size,
            color: 'Default',
            color_hex: '#FFFFFF',
            price: mockProduct.price,
            stock: 999,
            is_available: true
          })) || []
        };

        await productsService.upsertProduct(transformedProduct);
        successCount++;
      } catch (error) {
        console.error(`❌ Error sincronitzant producte mock ${mockProduct.name}:`, error);
        errorCount++;
      }
    }

    console.log(`✅ Sincronització mock completada: ${successCount} productes, ${errorCount} errors`);

    return {
      success: errorCount === 0,
      count: successCount,
      errors: errorCount
    };
  } catch (error) {
    console.error('❌ Error sincronitzant productes mock:', error);
    return {
      success: false,
      count: 0,
      error: error.message
    };
  }
}

export default {
  syncGelatoProductsToSupabase,
  syncMockProductsToSupabase
};
