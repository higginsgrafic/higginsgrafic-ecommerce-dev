/**
 * Script per obtenir informació d'un producte en blanc de Gelato
 * i guardar-la a la base de dades per comparar
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const GELATO_API_KEY = process.env.GELATO_API_KEY || process.env.VITE_GELATO_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Proxy a través de la edge function
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/gelato-proxy`;

/**
 * Fer petició a Gelato a través de la edge function
 */
async function gelatoRequest(action, params = {}) {
  const url = new URL(EDGE_FUNCTION_URL);
  url.searchParams.set('action', action);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  console.log(`🌐 Request: ${url.toString()}`);

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Cercar producte per nom
 */
async function searchProduct(productName) {
  console.log(`\n🔍 Cercant producte: "${productName}"...`);

  // Obtenir tot el catàleg
  const catalogData = await gelatoRequest('catalog');

  if (!catalogData || !catalogData.products) {
    console.error('❌ No s\'han trobat productes al catàleg');
    return null;
  }

  console.log(`📦 Total productes al catàleg: ${catalogData.products.length}`);

  // Mostrar tots els camps disponibles del primer producte
  if (catalogData.products.length > 0) {
    console.log('\n📋 Estructura primer producte:');
    console.log(JSON.stringify(catalogData.products[0], null, 2));
  }

  // Cercar per nom (case-insensitive)
  const searchTerm = productName.toLowerCase();
  const matches = catalogData.products.filter(p => {
    const name = (p.productNameUid || p.productName || p.name || '').toLowerCase();
    const type = (p.productTypeUid || p.productType || p.type || '').toLowerCase();
    const uid = (p.productUid || p.uid || '').toLowerCase();

    return name.includes(searchTerm) ||
           type.includes(searchTerm) ||
           uid.includes(searchTerm);
  });

  if (matches.length === 0) {
    console.log(`⚠️ No s'ha trobat cap producte amb "${productName}"`);
    console.log('\n📋 Mostrant primers 20 productes del catàleg:');
    catalogData.products.slice(0, 20).forEach((p, i) => {
      const name = p.productNameUid || p.productName || p.name || p.productUid;
      const type = p.productTypeUid || p.productType || p.type || 'N/A';
      console.log(`  ${i + 1}. ${name} (${type})`);
    });

    // Mostrar tipus únics
    const types = [...new Set(catalogData.products.map(p =>
      p.productTypeUid || p.productType || p.type || 'unknown'
    ))];
    console.log(`\n📊 Tipus de productes disponibles (${types.length}):`, types.slice(0, 20).join(', '));

    return null;
  }

  console.log(`✅ Trobats ${matches.length} productes:`);
  matches.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.productNameUid || p.productName} (${p.productUid})`);
  });

  return matches;
}

/**
 * Obtenir detalls complets d'un producte
 */
async function getProductDetails(productUid) {
  console.log(`\n📦 Obtenint detalls de ${productUid}...`);

  const productData = await gelatoRequest('product', { productId: productUid });

  console.log('✅ Detalls obtinguts');
  console.log(`   Nom: ${productData.productNameUid || productData.productName}`);
  console.log(`   Tipus: ${productData.productTypeUid || 'N/A'}`);
  console.log(`   Variants/Dimensions: ${productData.dimensions?.length || 0}`);

  return productData;
}

/**
 * Obtenir preus d'un producte
 */
async function getProductPrices(productUid) {
  console.log(`\n💰 Obtenint preus de ${productUid}...`);

  try {
    const priceData = await gelatoRequest('prices', { productId: productUid });
    console.log('✅ Preus obtinguts');
    return priceData;
  } catch (error) {
    console.warn('⚠️ No s\'han pogut obtenir els preus:', error.message);
    return null;
  }
}

/**
 * Intentar obtenir imatges/mockups del producte
 */
async function getProductImages(productData) {
  console.log(`\n🖼️ Cercant imatges/mockups...`);

  const images = [];

  // Revisar diferents fonts d'imatges
  const imageFields = [
    'previewUrl', 'imageUrl', 'thumbnailUrl',
    'preview', 'image', 'thumbnail'
  ];

  for (const field of imageFields) {
    if (productData[field] && typeof productData[field] === 'string') {
      images.push({ type: field, url: productData[field] });
      console.log(`  ✓ Trobat ${field}: ${productData[field]}`);
    }
  }

  // Revisar arrays d'imatges
  if (Array.isArray(productData.images)) {
    productData.images.forEach((img, i) => {
      const url = typeof img === 'string' ? img : img?.url;
      if (url) {
        images.push({ type: `image_${i}`, url });
        console.log(`  ✓ Trobat image[${i}]: ${url}`);
      }
    });
  }

  // Revisar mockups
  if (Array.isArray(productData.mockups)) {
    productData.mockups.forEach((mockup, i) => {
      if (mockup?.url) {
        images.push({ type: `mockup_${i}`, url: mockup.url });
        console.log(`  ✓ Trobat mockup[${i}]: ${mockup.url}`);
      }
    });
  }

  if (images.length === 0) {
    console.log('  ⚠️ No s\'han trobat imatges per aquest producte');
  } else {
    console.log(`  ✅ Total imatges trobades: ${images.length}`);
  }

  return images;
}

/**
 * Descarregar imatge i guardar-la a Supabase Storage
 */
async function downloadAndStoreImage(imageUrl, productUid, imageType) {
  console.log(`\n📥 Descarregant imatge: ${imageType}...`);

  try {
    // Descarregar imatge
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const ext = imageUrl.split('.').pop().split('?')[0] || 'jpg';
    const fileName = `gelato-blank/${productUid}/${imageType}.${ext}`;

    // Pujar a Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, blob, {
        contentType: blob.type,
        upsert: true
      });

    if (error) {
      console.warn(`  ⚠️ Error pujant imatge: ${error.message}`);
      return null;
    }

    // Obtenir URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    console.log(`  ✅ Imatge guardada: ${fileName}`);
    return publicUrl;

  } catch (error) {
    console.warn(`  ⚠️ No s'ha pogut descarregar la imatge: ${error.message}`);
    return null;
  }
}

/**
 * Extreure talles i colors
 */
function extractSizesAndColors(productData) {
  const sizes = new Set();
  const colors = new Set();

  if (productData.dimensions && Array.isArray(productData.dimensions)) {
    productData.dimensions.forEach(dim => {
      if (dim.name === 'size' || dim.name === 'GarmentSize') {
        if (dim.value) sizes.add(dim.value);
      }
      if (dim.name === 'color' || dim.name === 'Color') {
        if (dim.value) colors.add(dim.value);
        if (dim.valueFormatted) colors.add(dim.valueFormatted);
      }
    });
  }

  return {
    sizes: Array.from(sizes),
    colors: Array.from(colors)
  };
}

/**
 * Guardar dades a Supabase
 */
async function saveToDatabase(productData, priceData, downloadImages = true) {
  console.log('\n💾 Guardant a base de dades...');

  const { sizes, colors } = extractSizesAndColors(productData);

  const record = {
    gelato_product_uid: productData.productUid,
    product_name: productData.productNameUid || productData.productName || productData.productUid,
    product_type: productData.productTypeUid || 'tshirt',
    brand: extractBrand(productData.productNameUid || productData.productName || ''),
    full_data: productData,
    variants_data: productData.dimensions || [],
    pricing_data: priceData || {},
    available_sizes: sizes,
    available_colors: colors,
    notes: `Obtingut automàticament el ${new Date().toISOString()}`,
    fetched_at: new Date().toISOString()
  };

  // Intentar descarregar imatges si està habilitat
  if (downloadImages) {
    const images = await getProductImages(productData);
    if (images.length > 0) {
      console.log(`\n📦 Descarregant ${images.length} imatges...`);
      const storedImages = [];

      for (const img of images) {
        const publicUrl = await downloadAndStoreImage(
          img.url,
          productData.productUid,
          img.type
        );
        if (publicUrl) {
          storedImages.push({
            type: img.type,
            original_url: img.url,
            stored_url: publicUrl
          });
        }
      }

      if (storedImages.length > 0) {
        record.stored_images = storedImages;
        console.log(`✅ ${storedImages.length} imatges guardades`);
      }
    }
  }

  // Intentar actualitzar primer, si no existeix, inserir
  const { data: existing } = await supabase
    .from('gelato_blank_products')
    .select('id')
    .eq('gelato_product_uid', record.gelato_product_uid)
    .maybeSingle();

  let result;
  if (existing) {
    console.log('📝 Actualitzant registre existent...');
    result = await supabase
      .from('gelato_blank_products')
      .update({
        ...record,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select();
  } else {
    console.log('➕ Creant nou registre...');
    result = await supabase
      .from('gelato_blank_products')
      .insert(record)
      .select();
  }

  if (result.error) {
    console.error('❌ Error guardant:', result.error);
    throw result.error;
  }

  console.log('✅ Dades guardades correctament!');
  return result.data[0];
}

/**
 * Extreure marca del nom del producte
 */
function extractBrand(productName) {
  const brands = ['Gildan', 'Bella+Canvas', 'Next Level', 'Fruit of the Loom', 'Hanes'];
  for (const brand of brands) {
    if (productName.includes(brand)) {
      return brand;
    }
  }
  return 'Unknown';
}

/**
 * Main
 */
async function main() {
  const productName = process.argv[2] || 'Gildan 5000';

  console.log('🚀 Fetch Gelato Blank Product');
  console.log('═'.repeat(50));

  try {
    // 1. Cercar producte
    const matches = await searchProduct(productName);

    if (!matches || matches.length === 0) {
      console.log('\n❌ No s\'ha trobat el producte');
      process.exit(1);
    }

    // 2. Agafar primer match
    const product = matches[0];
    console.log(`\n✅ Processant: ${product.productNameUid || product.productName}`);

    // 3. Obtenir detalls complets
    const productDetails = await getProductDetails(product.productUid);

    // 4. Obtenir preus
    const priceData = await getProductPrices(product.productUid);

    // 5. Guardar a BD
    const saved = await saveToDatabase(productDetails, priceData);

    // 6. Mostrar resum
    console.log('\n📊 RESUM');
    console.log('═'.repeat(50));
    console.log(`Product: ${saved.product_name}`);
    console.log(`Marca: ${saved.brand}`);
    console.log(`Tipus: ${saved.product_type}`);
    console.log(`UID: ${saved.gelato_product_uid}`);
    console.log(`Talles: ${saved.available_sizes.join(', ')}`);
    console.log(`Colors: ${saved.available_colors.length} disponibles`);
    console.log(`Variants: ${saved.variants_data.length} dimensions`);
    console.log('\n✅ Procés completat!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
