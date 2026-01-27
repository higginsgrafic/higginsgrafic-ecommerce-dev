import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuració Supabase
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Funció per parsejar el CSV
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = parseCSVLine(lines[0]);

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      rows.push(row);
    }
  }

  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

// Funció per obtenir la URL de la imatge en PNG
function getGelatoImageURL(productUID) {
  if (!productUID) return null;
  // Intentem primer PNG, i si no funciona, es pot provar amb JPG
  return `https://image.cdn.gelato.cloud/products/${productUID}/preview.png`;
}

// Funció per extreure color i talla de les variants
function parseVariantOptions(row) {
  const option1Name = row['Variant Option #1 Name'];
  const option1Value = row['Variant Option #1 Value'];
  const option2Name = row['Variant Option #2 Name'];
  const option2Value = row['Variant Option #2 Value'];

  let color = null;
  let size = null;
  let design = null;

  // Analitzar Option 1
  if (option1Name?.includes('Color')) {
    // Format: "Color - Talla Negro - XL" -> Color: Negro, Talla: XL
    const parts = option1Value?.split(' - ') || [];
    if (parts.length >= 2) {
      color = parts[0];
      size = parts[1];
    } else {
      color = option1Value;
    }
  } else if (option1Name === 'Color') {
    color = option1Value;
  } else if (option1Name === 'Talla' || option1Name === 'Size') {
    size = option1Value;
  }

  // Analitzar Option 2
  if (option2Name === 'Choose Your Option') {
    design = option2Value;
  } else if (option2Name === 'Talla' || option2Name === 'Size') {
    size = option2Value;
  }

  return { color, size, design };
}

// Funció per determinar la col·lecció del producte
function detectCollection(productTitle) {
  const title = productTitle.toLowerCase();

  if (title.includes('austen')) return 'austen';
  if (title.includes('first contact')) return 'first-contact';
  if (title.includes('cube')) return 'cube';
  if (title.includes('dj vader') || title.includes('phoenix') || title.includes('star trek')) return 'grafic';
  if (title.includes('outcasted')) return 'outcasted';
  if (title.includes('human inside')) return 'the-human-inside';

  return 'other';
}

// Funció per mapear colors a codis hex
function getColorHex(colorName) {
  const colorMap = {
    'negro': '#000000',
    'black': '#000000',
    'blanco': '#FFFFFF',
    'white': '#FFFFFF',
    'rojo': '#DC2626',
    'red': '#DC2626',
    'royal': '#1E40AF',
    'real': '#1E40AF',
    'armada': '#1E3A8A',
    'navy': '#1E3A8A',
    'forest green': '#166534',
    'military green': '#4B5320',
    'orange': '#EA580C',
    'yellow': '#EAB308',
    'fuchsia': '#D946EF',
    'blue': '#3B82F6'
  };

  return colorMap[colorName?.toLowerCase()] || '#6B7280';
}

// Funció principal per importar els productes
async function importProducts(csvFilePath) {
  console.log('📦 Llegint CSV...');
  const csvText = fs.readFileSync(csvFilePath, 'utf-8');
  const rows = parseCSV(csvText);

  console.log(`📊 Trobades ${rows.length} files al CSV`);

  // Agrupar per producte
  const productGroups = {};

  for (const row of rows) {
    const productTitle = row['Product Title'];
    const productId = row['Product ID'];

    if (!productGroups[productId]) {
      productGroups[productId] = {
        title: productTitle,
        productId: productId,
        variants: []
      };
    }

    productGroups[productId].variants.push(row);
  }

  console.log(`📦 Trobats ${Object.keys(productGroups).length} productes únics`);

  // Processar cada producte
  let successCount = 0;
  let errorCount = 0;

  for (const [productId, productData] of Object.entries(productGroups)) {
    try {
      console.log(`\n🔄 Processant: ${productData.title}`);

      // Obtenir la primera variant amb Product UID per la imatge principal
      const firstVariantWithUID = productData.variants.find(v => v['Product UID']);
      const mainImageURL = firstVariantWithUID ? getGelatoImageURL(firstVariantWithUID['Product UID']) : null;

      // Crear les variants
      const variants = productData.variants.map(row => {
        const { color, size, design } = parseVariantOptions(row);
        const productUID = row['Product UID'];
        const sku = row['SKU'];

        return {
          sku: sku || `${productId}-${color}-${size}`,
          size: size || 'One Size',
          color: color || 'Default',
          color_hex: getColorHex(color),
          design: design,
          price: 24.99, // Preu per defecte, es pot ajustar
          stock: 999,
          is_available: !!productUID, // Només disponible si té UID
          image_url: productUID ? getGelatoImageURL(productUID) : null,
          gelato_variant_id: productUID
        };
      });

      // Crear el producte
      const product = {
        gelato_product_id: productId,
        name: productData.title,
        description: `${productData.title} - Disponible en múltiples colors i talles`,
        price: 24.99,
        currency: 'EUR',
        category: 'apparel',
        collection: detectCollection(productData.title),
        sku: `PROD-${productId}`,
        is_active: true,
        image: mainImageURL
      };

      console.log(`  📸 Imatge principal: ${mainImageURL ? '✅' : '❌'}`);
      console.log(`  🎨 Variants: ${variants.length}`);

      // Inserir el producte
      const { data: insertedProduct, error: productError } = await supabase
        .from('products')
        .upsert(product, { onConflict: 'gelato_product_id' })
        .select()
        .single();

      if (productError) {
        console.error(`  ❌ Error inserint producte:`, productError);
        errorCount++;
        continue;
      }

      console.log(`  ✅ Producte inserit amb ID: ${insertedProduct.id}`);

      // Eliminar variants antigues d'aquest producte
      await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', insertedProduct.id);

      // Inserir les noves variants
      const variantsWithProductId = variants.map(v => ({
        ...v,
        product_id: insertedProduct.id
      }));

      const { error: variantsError } = await supabase
        .from('product_variants')
        .insert(variantsWithProductId);

      if (variantsError) {
        console.error(`  ❌ Error inserint variants:`, variantsError);
        errorCount++;
      } else {
        console.log(`  ✅ ${variants.length} variants insertades`);
        successCount++;
      }

    } catch (error) {
      console.error(`❌ Error processant ${productData.title}:`, error);
      errorCount++;
    }
  }

  console.log(`\n✨ Importació completada!`);
  console.log(`✅ ${successCount} productes importats correctament`);
  console.log(`❌ ${errorCount} errors`);
}

// Executar la importació
const csvPath = process.argv[2] || path.join(__dirname, '../store_products_export.csv');
importProducts(csvPath).catch(console.error);
