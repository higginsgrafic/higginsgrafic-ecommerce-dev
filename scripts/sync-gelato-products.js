#!/usr/bin/env node

/**
 * Script per sincronitzar productes de Gelato amb Supabase
 *
 * Executa: npm run sync-gelato
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { SELLING_PRICE, GELATO_PLUS_DISCOUNT } from '../src/config/pricing.js';

// Carregar variables d'entorn
config();

// Variables d'entorn
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
// Per ESCRITURE cal la clau de servei: la taula `products` te activades les
// politiques de seguretat (RLS) i amb la clau anonima Supabase rebutja les
// insercions ("new row violates row-level security policy"). Aquesta clau
// nome s fa servir aqui, en un script local; mai no arriba al navegador.
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
// La clau de Gelato és un secret de servidor i es diu GELATO_API_KEY.
// (Abans es llegia VITE_GELATO_API_KEY: el prefix VITE_ faria que Vite
// l'incrustés dins del JavaScript que baixa el navegador.)
const GELATO_API_KEY = process.env.GELATO_API_KEY || process.env.VITE_GELATO_API_KEY;
const GELATO_STORE_ID = process.env.VITE_GELATO_STORE_ID;
// Cost de reserva si Gelato no ens dona el preu (abans era 5,91).
const GELATO_COST_FALLBACK = 5.91;

// Talles que no venem: no les sincronitzem. La 3XL encareix el producte i no
// la fem servir, i a mes distorsiona la mitjana de costos.
const SIZES_EXCLOSES = new Set(['3XL']);

// COSTOS REALS DE LA GILDAN 64000 (amb el descompte Gelato+ ja aplicat).
//
// ATENCIO: la botiga de Gelato esta muntada amb la Gildan 5000, i l'API ens en
// dona els preus d'ella (7,39 / 7,79). Pero el que venem es la 64000, i el que
// Gelato ens cobra de debò son aquests imports, llegits del seu checkout.
//
// Quan es refacin les fitxes de Gelato amb la 64000, aquesta taula es pot
// treure i deixar que el preu vingui de l'API.
const COSTOS_REALS = {
  S: 3.78, M: 3.78, L: 3.78, XL: 4.95, '2XL': 5.22,
};

console.log('🔧 Configuració:');
console.log('  SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
console.log('  SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✅' : '❌');
console.log('  SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅ (escriure)' : '❌ (sense ella no es pot escriure)');
console.log('  PREU DE VENDA:', SELLING_PRICE, '€');
console.log('  DESCOMPTE GELATO PLUS:', (GELATO_PLUS_DISCOUNT * 100) + '%');
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
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);

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
    // Les cites son d'Austen i Miscel·lania es una colleccio propia. Sense
    // aquestes entrades, tots dos grups queien al valor per defecte i
    // s'assignaven a First Contact (era el bug: 17 a first-contact, 0 a
    // miscellania i 22 a austen, quan han de ser 7, 5 i 27).
    'quotes': 'austen',
    'miscel·lània': 'miscellania',
    'miscellania': 'miscellania',
    'miscel·lania': 'miscellania',
    'miscellània': 'miscellania',
  };

  const productTitle = storeProduct.title || storeProduct.name || `Producte ${index + 1}`;
  const productTitleLower = productTitle.toLowerCase();

  let collection = 'first-contact';
  let reconegut = false;
  for (const [key, value] of Object.entries(collectionMap)) {
    if (productTitleLower.includes(key)) {
      collection = value;
      reconegut = true;
      break;
    }
  }
  if (!reconegut) {
    // Avis visible: si mai arriba un producte amb un nom nou, volem saber-ho
    // en comptes de veure'l apareixer sense avisar a First Contact.
    console.warn(`  ⚠️  Colleccio no reconeguda a "${productTitle}" -> s'assigna a first-contact`);
  }

  const mockupUrl = storeProduct.mockupUrl || storeProduct.previewUrl || storeProduct.imageUrl;
  const images = mockupUrl ? [mockupUrl] : ['/placeholder-product.svg'];

  // SEMPRE el preu de venda: el de Gelato es el cost, no el que cobrem.
  // (Abans s'hi posava storeProduct.price, que es el cost de Gelato: 29,99.)
  const basePrice = SELLING_PRICE;

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

/**
 * Preu real d'una variant a Gelato.
 *
 * L'API de preus exigeix el `productUid` (un identificador llarg que porta la
 * talla i el color a dins), NO el `productId`. Abans s'hi enviava el productId,
 * l'API responia error i el cost quedava sempre amb la constant de reserva.
 */
async function fetchVariantCost(productUid) {
  if (!productUid) return null;
  try {
    const url = new URL(edgeFunctionUrl);
    url.searchParams.set('action', 'prices');
    url.searchParams.set('productId', productUid);
    const res = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'apikey': SUPABASE_ANON_KEY },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const entrada = Array.isArray(data) ? data[0] : (data?.data?.[0] || data?.prices?.[0]);
    const preu = entrada && (entrada.price ?? entrada.value);
    const n = Number(preu);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

function transformStoreVariants(storeProduct, mockupUrl, costs) {
  const variants = (storeProduct.variants || []).map(v => {
    const variantTitle = v.title || '';

    // El titol de les variants de Gelato te aquesta forma:
    //   "Navy - 2XL - DTG (Direct-to-garment)"
    // es a dir: COLOR - TALLA - TECNICA.
    //
    // Abans es buscava "Color - Talla XL" i "Talla XL", que no hi encaixen mai:
    // per aixo TOTES les variants quedaven amb color "Default" i talla "M"
    // (3.990 variants, totes M). Ara es llegeix la posicio.
    const parts = String(variantTitle).split(' - ').map((x) => x.trim()).filter(Boolean);
    const size = parts.length >= 2 ? parts[parts.length - 2] : 'M';
    const color = parts.length >= 3 ? parts.slice(0, -2).join(' - ') : (parts[0] || 'Default');

    return {
      gelato_variant_id: v.id?.toString() || v.variantId?.toString() || '',
      sku: v.sku || '',
      size: size,
      color: color,
      color_hex: mapColorToHex(color),
      price: SELLING_PRICE,
      // Cost real de Gelato per a aquesta variant (amb el descompte del pla).
      // Si no s'ha pogut llegir, es queda el de reserva.
      gelato_cost: COSTOS_REALS[size] != null
        ? COSTOS_REALS[size]
        : (costs && costs.get(v.id) != null ? costs.get(v.id) : GELATO_COST_FALLBACK),
      stock: 999,
      is_available: true,
      image_url: v.mockupUrl || mockupUrl
    };
  });

  // Les talles que no venem no s'arriben a desar mai.
  return variants.filter((v) => !SIZES_EXCLOSES.has(v.size));
}

/**
 * Costos reals de totes les variants d'un producte.
 *
 * Es consulta UNA vegada per talla (no per variant): el preu de Gelato nome s
 * depen del producte i la talla, no del color. Amb 70 variants per producte,
 * aixo estalvia 64 consultes de cada 70.
 */
async function resolveVariantCosts(storeProduct) {
  const costs = new Map();
  const perTalla = new Map();   // talla -> promesa del preu
  const variants = storeProduct.variants || [];
  const feines = [];
  for (const v of variants) {
    const parts = String(v.title || '').split(' - ').map((x) => x.trim()).filter(Boolean);
    const talla = parts.length >= 2 ? parts[parts.length - 2] : '';
    const clau = `${storeProduct.id}|${talla}`;
    if (!perTalla.has(clau)) perTalla.set(clau, fetchVariantCost(v.productUid));
    feines.push(perTalla.get(clau).then((preu) => { if (preu != null) costs.set(v.id, Math.round(preu * (1 - GELATO_PLUS_DISCOUNT) * 100) / 100); }));
  }
  await Promise.all(feines);
  return costs;
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
    const { error: delImgError } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', productId);
    if (delImgError) {
      console.warn(`  ⚠️ No s'han pogut esborrar les imatges antigues:`, delImgError.message);
    }

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
    // L'error s'ha de comprovar: si falla, les variants velles es queden a la
    // base de dades i no ens n'adonem (es va quedar una 3XL antiga per aixo).
    const { error: delVarError } = await supabase
      .from('product_variants')
      .delete()
      .eq('product_id', productId);
    if (delVarError) {
      console.warn(`  ⚠️ No s'han pogut esborrar les variants antigues:`, delVarError.message);
    }

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
        const costs = await resolveVariantCosts(storeProduct);
        const ambPreu = costs.size;
        const variants = transformStoreVariants(storeProduct, mockupUrl, costs);
        if (ambPreu) console.log(`  💰 Cost real llegit per a ${ambPreu} variants`);
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
