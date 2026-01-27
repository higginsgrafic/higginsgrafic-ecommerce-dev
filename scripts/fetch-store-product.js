/**
 * Script per obtenir productes de la BOTIGA de Gelato (amb dissenys)
 * Aquests SÍ tenen imatges/mockups disponibles
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const GELATO_STORE_ID = process.env.VITE_GELATO_STORE_ID;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/gelato-proxy`;

/**
 * Obtenir productes de la botiga
 */
async function getStoreProducts() {
  console.log('\n🎨 Obtenint productes de la botiga Gelato...');

  const url = new URL(EDGE_FUNCTION_URL);
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
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Obtenir detalls d'un producte de la botiga
 */
async function getStoreProduct(productId) {
  console.log(`\n📦 Obtenint detalls del producte ${productId}...`);

  const url = new URL(EDGE_FUNCTION_URL);
  url.searchParams.set('action', 'store-product');
  url.searchParams.set('productId', productId);
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
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Extreure URLs d'imatges del producte
 */
function extractImages(productData) {
  const images = [];

  console.log('\n🖼️ Cercant imatges...');
  console.log('Estructura del producte:', JSON.stringify(productData, null, 2));

  // Camps possibles d'imatges
  const imageFields = [
    'previewUrl', 'preview_url',
    'imageUrl', 'image_url',
    'thumbnailUrl', 'thumbnail_url',
    'mockupUrl', 'mockup_url'
  ];

  for (const field of imageFields) {
    if (productData[field]) {
      images.push({ type: field, url: productData[field] });
      console.log(`  ✓ ${field}: ${productData[field]}`);
    }
  }

  // Arrays d'imatges
  if (Array.isArray(productData.images)) {
    productData.images.forEach((img, i) => {
      const url = typeof img === 'string' ? img : img?.url;
      if (url) {
        images.push({ type: `image_${i}`, url });
        console.log(`  ✓ images[${i}]: ${url}`);
      }
    });
  }

  if (Array.isArray(productData.mockups)) {
    productData.mockups.forEach((mockup, i) => {
      if (mockup?.url) {
        images.push({ type: `mockup_${i}`, url: mockup.url });
        console.log(`  ✓ mockups[${i}]: ${mockup.url}`);
      }
    });
  }

  // Variants amb imatges
  if (Array.isArray(productData.variants)) {
    productData.variants.forEach((variant, i) => {
      if (variant.imageUrl || variant.image_url) {
        const url = variant.imageUrl || variant.image_url;
        images.push({ type: `variant_${i}`, url });
        console.log(`  ✓ variant[${i}]: ${url}`);
      }
    });
  }

  // Product images array (dels productes de la botiga)
  if (Array.isArray(productData.productImages)) {
    productData.productImages.forEach((img, i) => {
      if (img.fileUrl) {
        images.push({
          type: img.isPrimary ? `product_image_primary` : `product_image_${i}`,
          url: img.fileUrl
        });
        console.log(`  ✓ productImages[${i}]${img.isPrimary ? ' (PRIMARY)' : ''}: ${img.fileUrl.substring(0, 80)}...`);
      }
    });
  }

  console.log(`\n  Total: ${images.length} imatges trobades`);
  return images;
}

/**
 * Descarregar i guardar imatge
 */
async function downloadImage(imageUrl, productId, imageType) {
  console.log(`\n📥 Descarregant ${imageType}...`);

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const blob = await response.blob();
    const ext = imageUrl.split('.').pop().split('?')[0] || 'jpg';
    const fileName = `gelato-store/${productId}/${imageType}.${ext}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, blob, {
        contentType: blob.type,
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    console.log(`  ✅ Guardat: ${fileName}`);
    return publicUrl;

  } catch (error) {
    console.warn(`  ⚠️ Error: ${error.message}`);
    return null;
  }
}

/**
 * Guardar producte a BD
 */
async function saveProduct(productData, images) {
  console.log('\n💾 Guardant a base de dades...');

  const record = {
    gelato_product_uid: productData.id || productData.productId,
    product_name: productData.name || productData.title || 'Unknown',
    product_type: productData.type || 'store-product',
    brand: 'Store Product',
    full_data: productData,
    stored_images: images,
    notes: `Producte de botiga obtingut el ${new Date().toISOString()}`,
    fetched_at: new Date().toISOString()
  };

  const { data: existing } = await supabase
    .from('gelato_blank_products')
    .select('id')
    .eq('gelato_product_uid', record.gelato_product_uid)
    .maybeSingle();

  let result;
  if (existing) {
    result = await supabase
      .from('gelato_blank_products')
      .update({ ...record, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select();
  } else {
    result = await supabase
      .from('gelato_blank_products')
      .insert(record)
      .select();
  }

  if (result.error) throw result.error;

  console.log('✅ Guardat correctament!');
  return result.data[0];
}

/**
 * Main
 */
async function main() {
  console.log('🚀 Fetch Gelato Store Products');
  console.log('═'.repeat(50));

  try {
    // 1. Obtenir llista de productes de la botiga
    const productsResponse = await getStoreProducts();

    // API pot retornar { data: [...] } o { products: [...] }
    const products = productsResponse.data || productsResponse.products || productsResponse;

    if (!Array.isArray(products) || products.length === 0) {
      console.log('\n⚠️ No hi ha productes a la botiga');
      console.log('Response:', JSON.stringify(productsResponse, null, 2));
      return;
    }
    console.log(`\n✅ Trobats ${products.length} productes a la botiga`);

    // 2. Processar cada producte
    for (let i = 0; i < Math.min(products.length, 3); i++) {
      const product = products[i];

      console.log(`\n\n${'═'.repeat(50)}`);
      console.log(`PRODUCTE ${i + 1}/${products.length}`);
      console.log('═'.repeat(50));

      // Obtenir detalls
      const details = await getStoreProduct(product.id);

      // Extreure imatges
      const imageUrls = extractImages(details);

      // Descarregar imatges
      const downloadedImages = [];
      for (const img of imageUrls) {
        const url = await downloadImage(img.url, product.id, img.type);
        if (url) {
          downloadedImages.push({
            type: img.type,
            original_url: img.url,
            stored_url: url
          });
        }
      }

      // Guardar a BD
      await saveProduct(details, downloadedImages);

      console.log(`\n✅ Producte ${i + 1} completat`);
      console.log(`   Imatges descarregades: ${downloadedImages.length}`);
    }

    console.log('\n\n✅ Procés completat!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
