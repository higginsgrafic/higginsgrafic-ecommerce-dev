#!/usr/bin/env node

/**
 * Script per sincronitzar productes de Gelato amb Supabase
 *
 * Executa: npm run sync-gelato
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Carregar variables d'entorn
config();

// Variables d'entorn
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const GELATO_API_KEY = process.env.VITE_GELATO_API_KEY;
const GELATO_STORE_ID = process.env.VITE_GELATO_STORE_ID;

console.log('🔧 Configuració:');
console.log('  SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
console.log('  SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✅' : '❌');
console.log('  GELATO_API_KEY:', GELATO_API_KEY ? '✅' : '❌');
console.log('  GELATO_STORE_ID:', GELATO_STORE_ID || 'No configurat');
console.log('');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: SUPABASE_URL i SUPABASE_ANON_KEY són necessaris');
  process.exit(1);
}

if (!GELATO_API_KEY) {
  console.error('❌ Error: GELATO_API_KEY és necessari');
  process.exit(1);
}

// Client de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Client de Gelato
const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/gelato-proxy`;

async function fetchStoreProducts() {
  try {
    console.log('🏪 Obtenint productes de la teva botiga Gelato...');

    const url = new URL(edgeFunctionUrl);
    url.searchParams.set('action', 'store-products');
    if (GELATO_STORE_ID) {
      url.searchParams.set('storeId', GELATO_STORE_ID);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const products = data.data || data.products || [];
    console.log(`✅ Obtinguts ${products.length} productes de la teva botiga`);
    return products;
  } catch (error) {
    console.error('❌ Error obtenint productes de la botiga:', error.message);
    throw error;
  }
}

function transformStoreProduct(storeProduct, index) {
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

  const productTitle = storeProduct.title || storeProduct.name || `Producte ${index + 1}`;
  const productTitleLower = productTitle.toLowerCase();

  let collection = 'first-contact';
  for (const [key, value] of Object.entries(collectionMap)) {
    if (productTitleLower.includes(key)) {
      collection = value;
      break;
    }
  }

  const mockupUrl = storeProduct.mockupUrl || storeProduct.previewUrl || storeProduct.imageUrl;
  const images = mockupUrl ? [mockupUrl] : ['/placeholder-product.svg'];

  const basePrice = storeProduct.price || 29.99;

  return {
    gelato_product_id: storeProduct.id?.toString() || `store-${index}`,
    name: productTitle,
    description: storeProduct.description || productTitle,
    price: basePrice,
    currency: 'EUR',
    category: 'apparel',
    collection: collection,
    sku: storeProduct.sku || storeProduct.id?.toString() || '',
    is_active: true,
    image: images[0]
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

  const color = (colorName || '').toLowerCase().trim();
  return colorMap[color] || '#FFFFFF';
}

function transformStoreVariants(storeProduct, mockupUrl) {
  const variants = (storeProduct.variants || []).map(v => {
    const variantTitle = v.title || '';

    const colorMatch = variantTitle.match(/Color\s*-?\s*Talla\s+([^,]+)/i) || variantTitle.match(/Color\s+([^,]+)/i);
    const sizeMatch = variantTitle.match(/Talla\s+(\w+)/i);

    const color = colorMatch ? colorMatch[1].trim() : 'Default';
    const size = sizeMatch ? sizeMatch[1].trim() : 'M';

    return {
      gelato_variant_id: v.id?.toString() || v.variantId?.toString() || '',
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

  return variants;
}

async function syncProductToSupabase(product, variants, images) {
  try {
    // 1. Inserir o actualitzar el producte
    const { data: productData, error: productError } = await supabase
      .from('products')
      .upsert({
        gelato_product_id: product.gelato_product_id,
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
        image: product.image,
        category: product.category,
        collection: product.collection,
        sku: product.sku,
        is_active: product.is_active
      }, {
        onConflict: 'gelato_product_id'
      })
      .select()
      .single();

    if (productError) {
      throw productError;
    }

    const productId = productData.id;
    console.log(`  ✅ Producte ${product.name} sincronitzat (ID: ${productId})`);

    // 2. Eliminar imatges antigues i inserir noves
    await supabase
      .from('product_images')
      .delete()
      .eq('product_id', productId);

    if (images.length > 0) {
      const imageRecords = images.map((url, index) => ({
        product_id: productId,
        url: url,
        position: index
      }));

      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(imageRecords);

      if (imagesError) {
        console.warn(`  ⚠️ Error inserint imatges:`, imagesError.message);
      } else {
        console.log(`  ✅ ${images.length} imatges sincronitzades`);
      }
    }

    // 3. Eliminar variants antigues i inserir noves
    await supabase
      .from('product_variants')
      .delete()
      .eq('product_id', productId);

    if (variants.length > 0) {
      const variantRecords = variants.map(v => ({
        product_id: productId,
        ...v
      }));

      const { error: variantsError } = await supabase
        .from('product_variants')
        .insert(variantRecords);

      if (variantsError) {
        console.warn(`  ⚠️ Error inserint variants:`, variantsError.message);
      } else {
        console.log(`  ✅ ${variants.length} variants sincronitzades`);
      }
    }

    return { success: true, productId };
  } catch (error) {
    console.error(`  ❌ Error sincronitzant producte:`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Sincronitzant productes de la teva botiga Gelato...\n');

  try {
    // 1. Obtenir productes de la botiga
    const storeProducts = await fetchStoreProducts();

    if (storeProducts.length === 0) {
      console.log('⚠️ No hi ha productes a la teva botiga Gelato');
      console.log('   Crea productes al teu compte de Gelato primer');
      process.exit(0);
    }

    console.log(`\n📊 Sincronitzant ${storeProducts.length} productes...\n`);

    let successCount = 0;
    let errorCount = 0;

    // 2. Sincronitzar cada producte
    for (let i = 0; i < storeProducts.length; i++) {
      const storeProduct = storeProducts[i];
      const productTitle = storeProduct.title || storeProduct.name || 'Producte';
      console.log(`\n[${i + 1}/${storeProducts.length}] Processant: ${productTitle}...`);

      try {
        // Transformar producte
        const product = transformStoreProduct(storeProduct, i);

        // Obtenir mockup URL
        const mockupUrl = storeProduct.mockupUrl || storeProduct.previewUrl || storeProduct.imageUrl;

        // Transformar variants reals del producte
        const variants = transformStoreVariants(storeProduct, mockupUrl);
        console.log(`  📦 ${variants.length} variants trobades`);

        // Obtenir imatges
        const images = mockupUrl ? [mockupUrl] : ['/placeholder-product.svg'];

        // Sincronitzar amb Supabase
        const result = await syncProductToSupabase(product, variants, images);

        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error(`  ❌ Error processant producte:`, error.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ Sincronització completada!');
    console.log(`  ✅ Productes sincronitzats: ${successCount}`);
    console.log(`  ❌ Errors: ${errorCount}`);
    console.log('='.repeat(60) + '\n');

    if (successCount > 0) {
      console.log('🎉 Els teus productes ja estan disponibles a l\'aplicació!');
      console.log('   Canvia VITE_USE_MOCK_DATA=false al fitxer .env per veure\'ls');
    }

  } catch (error) {
    console.error('\n❌ Error general:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Executar
main();
