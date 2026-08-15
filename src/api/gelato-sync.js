import { syncGelatoStoreProducts, mapGelatoProduct, gelatoClient } from './gelato';
import productsService from './supabase-products';
import { supabase } from './supabase-products';

const GELATO_COST_PRICE = 5.91;
const SELLING_PRICE = 15.50;
const GELATO_PLUS_DISCOUNT = 0.20;

function calculateSellingPrice() {
  return SELLING_PRICE;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchVariantCosts(storeProduct) {
  if (!gelatoClient || !storeProduct.variants) return;
  const batchSize = 20;
  for (let i = 0; i < storeProduct.variants.length; i += batchSize) {
    const batch = storeProduct.variants.slice(i, i + batchSize);
    await Promise.all(batch.map(async (v) => {
      const variantUid = v.productUid || v.id?.toString();
      if (!variantUid) return;
      try {
        const prices = await gelatoClient.getProductPrices(variantUid);
        const arr = Array.isArray(prices) ? prices : (prices?.data || []);
        const entry = arr.find(p => p.quantity === 1) || arr[0];
        if (entry && entry.price != null) {
          v.cost = parseFloat(entry.price) * (1 - GELATO_PLUS_DISCOUNT);
        }
      } catch (e) {
        // s'usa el fallback GELATO_COST_PRICE
      }
    }));
  }
}

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
    const usedSlugs = new Set();

    for (const gelatoProduct of gelatoProducts) {
      try {
        console.log(`🔄 [SYNC] Obtenint preus per ${gelatoProduct.title || gelatoProduct.name}...`);
        await fetchVariantCosts(gelatoProduct);
        const transformedProduct = transformStoreProductForSupabase(gelatoProduct);
        let slug = transformedProduct.slug;
        if (usedSlugs.has(slug)) {
          let suffix = 2;
          while (usedSlugs.has(`${slug}-${suffix}`)) suffix++;
          slug = `${slug}-${suffix}`;
          transformedProduct.slug = slug;
        }
        usedSlugs.add(slug);
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

    const syncedGelatoIds = gelatoProducts
      .map(p => (p.id || p.productId || '').toString())
      .filter(Boolean);

    if (syncedGelatoIds.length > 0 && supabase) {
      console.log('🔄 [SYNC] Desactivant productes que ja no existeixen a Gelato...');
      const { error: deactivateError } = await supabase
        .from('products')
        .update({ is_active: false })
        .not('gelato_product_id', 'in', `(${syncedGelatoIds.map(id => `"${id}"`).join(',')})`)
        .eq('product_type', 'fulfillment');

      if (deactivateError) {
        console.error('⚠️ [SYNC] Error desactivant productes obsolets:', deactivateError);
      } else {
        console.log('✅ [SYNC] Productes obsolets desactivats');
      }
    }

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

function slugify(str) {
  return (str || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

function generateProductSlug(collection, title) {
  let name = title.toLowerCase();
  name = name.replace(/^(austen|first\s*contact|the\s*human\s*inside|cube|miscel·lània|miscellania)\s*[-\s]+/, '');
  name = name.replace(/\s*[-\s]+[nbc]\s*$/, '');
  name = name.replace(/^(cites|crosswords|quotes)\s*[-\s]+/, '');
  name = name.replace(/\s*[-\s]+[nc]\s*$/, '');
  return `${collection}-${slugify(name)}`;
}

function transformStoreProductForSupabase(storeProduct) {
  const collectionMap = {
    'austen': 'austen',
    'first-contact': 'first-contact',
    'first contact': 'first-contact',
    'the-human-inside': 'the-human-inside',
    'human inside': 'the-human-inside',
    'cube': 'cube',
    'miscel·lània': 'miscellania',
    'miscellania': 'miscellania',
    'dj vader': 'miscellania',
    'death star': 'miscellania',
    'r2d2': 'miscellania',
    'arthur d': 'miscellania',
    'pont del diable': 'miscellania',
    'quotes': 'austen'
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
    const parts = (v.title || '').split(' - ');
    const color = parts[0]?.trim() || 'Default';
    const size = parts[1]?.trim() || 'M';

    return {
      gelato_variant_id: v.productUid || v.id?.toString() || v.variantId?.toString(),
      sku: v.sku || '',
      size: size,
      color: color,
      color_hex: mapColorToHex(color),
      price: v.price || storeProduct.price || calculateSellingPrice(),
      gelato_cost: v.cost || GELATO_COST_PRICE,
      stock: 999,
      is_available: true,
      image_url: v.mockupUrl || mockupUrl
    };
  });

  const generatedSlug = generateProductSlug(collection, productTitle);

  return {
    gelato_product_id: storeProduct.id?.toString() || storeProduct.productId?.toString(),
    slug: generatedSlug,
    name: productTitle,
    description: (() => {
      const raw = (storeProduct.description || '').toString().trim();
      if (!raw) return '';
      if (normalizeComparable(raw) === normalizeComparable(productTitle)) return '';
      return raw;
    })(),
    price: storeProduct.price || calculateSellingPrice(),
    currency: 'EUR',
    category: 'apparel',
    collection: collection,
    sku: storeProduct.sku || storeProduct.id?.toString() || '',
    is_active: true,
    product_type: 'fulfillment',
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
