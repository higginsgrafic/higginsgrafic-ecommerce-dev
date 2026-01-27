#!/usr/bin/env node

/**
 * Mockups Import Script
 *
 * Usage:
 *   node scripts/import-mockups.js --csv mockups.csv
 *   node scripts/import-mockups.js --scan /path/to/mockups
 *
 * CSV Format:
 * collection,subcategory,sub_subcategory,design_name,drawing_color,base_color,product_type,file_path,variant_id,display_order
 *
 * File naming convention (for --scan):
 * {collection}/{design-name}-{drawing-color}-{base-color}-{product-type}.jpg
 * Example: first-contact/nx-01-black-white-tshirt.jpg
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set');
  process.exit(1);
}

function getSemanticKey(m) {
  return [
    m?.collection || '',
    m?.subcategory || '',
    m?.sub_subcategory || '',
    m?.design_name || '',
    m?.drawing_color || '',
    m?.base_color || '',
    m?.product_type || ''
  ].join('|');
}

function chooseWinnerRow(rows) {
  const list = Array.isArray(rows) ? rows.filter(Boolean) : [];
  if (list.length <= 1) return list[0] || null;
  // Deterministic: prefer shorter path, then lexicographically.
  const sorted = list
    .slice()
    .sort((a, b) => {
      const ap = (a?.file_path || '').toString();
      const bp = (b?.file_path || '').toString();
      if (ap.length !== bp.length) return ap.length - bp.length;
      return ap.localeCompare(bp);
    });
  return sorted[0] || null;
}

function normalizeDrawingColorToDb(v) {
  const s = (v || '').toString().trim().toLowerCase();
  if (!s) return '';
  if (s === 'blanc') return 'white';
  if (s === 'negre') return 'black';
  return normalizeLegacyBaseColor(s);
}

function buildRowFromCanonicalAStorageKey(key, options = {}) {
  const { enforceTshirtColors = false, tshirtColorsSet = null } = options;
  const clean = (key || '').toString().replace(/^\/+/, '').trim();
  if (!clean) return { ok: false, reason: 'empty', file_path: clean };

  const parts = clean.split('/').filter(Boolean);
  if (parts.length < 4) return { ok: false, reason: 'not_canonical_depth', file_path: clean };

  // Ignore non-mockup assets that may live in the same bucket.
  // These paths are not meant to be parsed as mockups inventory.
  const rootPrefix = (parts[0] || '').toString().trim().toLowerCase();
  if (rootPrefix === 'products') return { ok: false, reason: 'ignored_products_prefix', file_path: clean };
  if (rootPrefix === 'proves') return { ok: false, reason: 'ignored_proves_prefix', file_path: clean };

  const collection = toCanonicalCollection(parts[0]);
  const fileName = parts[parts.length - 1];

  // Canonical-A expected layout (new): {collection}/{base_color}/{drawing_color}/{file}
  // Legacy layout observed in exports: {collection}/{design_folder}/{drawing_color}/{file}
  // Example: first_contact/ncc_1701/blanc/first-contact-ncc-1701-white-black.png
  let baseFolder = normalizeLegacyBaseColor(parts[1]);
  let drawingFolder = normalizeDrawingColorToDb(parts[2]);

  if (!collection) return { ok: false, reason: 'missing_collection', file_path: clean };
  if (!isLikelyFileName(fileName)) return { ok: false, reason: 'not_image', file_path: clean };

  const withoutExt = path.basename(fileName, path.extname(fileName));
  const tokens = withoutExt.split('-').filter(Boolean);
  // Expected: first-contact-<design...>-<drawing>-<base>
  if (tokens.length < 4) return { ok: false, reason: 'bad_filename', file_path: clean };

  const baseFromName = normalizeLegacyBaseColor(tokens[tokens.length - 1]);
  const drawingFromName = normalizeDrawingColorToDb(tokens[tokens.length - 2]);
  let designTokens = tokens.slice(0, -2);

  const prefix1 = collection.replace(/_/g, '-');
  if (designTokens.length && designTokens[0].toLowerCase() === prefix1.toLowerCase()) {
    designTokens = designTokens.slice(1);
  }
  const design_name = designTokens.join('-');

  // If parts[1] is not a base color folder (legacy layout), recover base/drawing from filename.
  // We treat folder drawing (parts[2]) as drawing color when it is blanc/negre.
  const folderDrawingIsInk = ['white', 'black'].includes(drawingFolder);
  const looksLikeLegacy = baseFolder && tshirtColorsSet && !tshirtColorsSet.has(baseFolder) && folderDrawingIsInk;
  if (looksLikeLegacy) {
    baseFolder = baseFromName;
    drawingFolder = drawingFromName || drawingFolder;
  }

  // Legacy layout 2: {collection}/{design_folder}/{base_color}/{file}
  // Example: outcasted/arthur-d.-the-second/forest/outcasted-arthur-d.-the-second-black-forest.png
  // In this case parts[1] is design, parts[2] is base color. Drawing color comes from filename.
  const folderBaseCandidate = normalizeLegacyBaseColor(parts[2]);
  const looksLikeLegacyBaseInThirdSegment =
    tshirtColorsSet &&
    baseFolder &&
    !tshirtColorsSet.has(baseFolder) &&
    folderBaseCandidate &&
    tshirtColorsSet.has(folderBaseCandidate);
  if (looksLikeLegacyBaseInThirdSegment) {
    baseFolder = folderBaseCandidate;
    drawingFolder = drawingFromName || drawingFolder;
  }

  if (!baseFolder) return { ok: false, reason: 'missing_base_folder', file_path: clean };
  if (!drawingFolder) return { ok: false, reason: 'missing_drawing_folder', file_path: clean };

  if (tshirtColorsSet && !tshirtColorsSet.has(baseFolder)) {
    // Not an official base color folder for tshirt -> treat as legacy/non-official.
    return { ok: false, reason: 'non_official_base_folder', file_path: clean };
  }
  if (!['white', 'black'].includes(drawingFolder)) {
    return { ok: false, reason: 'non_official_drawing_folder', file_path: clean };
  }

  if (baseFromName && baseFromName !== baseFolder) {
    return { ok: false, reason: 'base_mismatch', file_path: clean, base_folder: baseFolder, base_name: baseFromName };
  }
  if (drawingFromName && drawingFromName !== drawingFolder) {
    return { ok: false, reason: 'drawing_mismatch', file_path: clean, drawing_folder: drawingFolder, drawing_name: drawingFromName };
  }

  const product_type = 'tshirt';
  if (
    enforceTshirtColors &&
    tshirtColorsSet &&
    baseFolder &&
    !tshirtColorsSet.has(baseFolder)
  ) {
    return { ok: false, reason: 'non_official_tshirt_base_color', file_path: clean };
  }

  return {
    ok: true,
    row: {
      collection,
      subcategory: null,
      sub_subcategory: null,
      design_name: design_name || null,
      drawing_color: drawingFolder || null,
      base_color: baseFolder || null,
      product_type,
      file_path: clean,
      variant_id: null,
      display_order: null,
      is_active: true
    }
  };
}

const DEFAULT_TSHIRT_COLORS_JSON = path.join(
  process.cwd(),
  'public',
  'placeholders',
  'apparel',
  't-shirt',
  'gildan_5000',
  'colors.json'
);

function isLikelyFileName(name) {
  const lower = (name || '').toString().toLowerCase();
  return (
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.gif') ||
    lower.endsWith('.svg')
  );
}

function isFileEntry(x) {
  if (!x || !x.name) return false;
  if (x.metadata) return true;
  if (x.created_at || x.updated_at || x.last_accessed_at) return true;
  return isLikelyFileName(x.name);
}

function toCanonicalCollection(seg) {
  const v = (seg || '').toString().trim();
  if (!v) return '';
  if (/^first[-_]?contact$/i.test(v)) return 'first_contact';
  if (/^the[-_]?human[-_]?inside$/i.test(v)) return 'the_human_inside';
  return v.toLowerCase();
}

function normalizeFolderColorToDb(v) {
  const s = (v || '').toString().trim().toLowerCase();
  if (!s) return '';
  if (s === 'blanc') return 'white';
  if (s === 'negre') return 'black';
  return normalizeLegacyBaseColor(s);
}

function buildMockupRowFromStorageKey(key, options = {}) {
  const { tshirtColorsSet = null, enforceTshirtColors = false } = options;
  const clean = (key || '').toString().replace(/^\/+/, '').trim();
  if (!clean) return null;

  const parts = clean.split('/').filter(Boolean);
  if (parts.length < 2) return null;

  const collection = toCanonicalCollection(parts[0]);
  const fileName = parts[parts.length - 1];
  if (!isLikelyFileName(fileName)) return null;

  const folderCandidates = new Set(['white', 'black', 'blanc', 'negre']);
  if (tshirtColorsSet) {
    for (const c of tshirtColorsSet) folderCandidates.add(String(c));
  }

  // Heuristics: detect base/drawing from folder segments near the end.
  let baseFromFolder = '';
  let drawingFromFolder = '';
  for (let i = parts.length - 2; i >= 1; i--) {
    const seg = (parts[i] || '').toString().trim().toLowerCase();
    if (!seg) continue;
    if (!folderCandidates.has(seg)) continue;
    const normalized = normalizeFolderColorToDb(seg);
    if (!baseFromFolder) {
      baseFromFolder = normalized;
    } else if (!drawingFromFolder) {
      drawingFromFolder = normalized;
      break;
    }
  }

  // Filename parsing: {design}-{drawing}-{base}-{product_type}.ext
  const withoutExt = path.basename(fileName, path.extname(fileName));
  const tokens = withoutExt.split('-').filter(Boolean);

  const knownProductTypes = new Set([
    'tshirt',
    'tee',
    'hoodie',
    'sweatshirt',
    'mug',
    'totebag',
    'tote',
    'poster',
    'sticker',
    'cap'
  ]);

  const lastToken = (tokens[tokens.length - 1] || '').toString().toLowerCase();
  const hasProductTypeSuffix = knownProductTypes.has(lastToken);

  // Storage mockups often have no product_type suffix. Default to tshirt.
  let parsed = null;
  if (hasProductTypeSuffix) {
    parsed = parseFileName(fileName, { silent: true });
  } else if (tokens.length >= 4) {
    parsed = {
      design_name: tokens.slice(0, -2).join('-'),
      drawing_color: tokens[tokens.length - 2],
      base_color: tokens[tokens.length - 1],
      product_type: 'tshirt'
    };
  } else {
    parsed = parseFileName(fileName, { silent: true });
  }

  const product_type = (parsed?.product_type || '').toString().toLowerCase();
  const base_color = normalizeLegacyBaseColor(parsed?.base_color || baseFromFolder);
  const drawing_color = normalizeLegacyBaseColor(parsed?.drawing_color || drawingFromFolder);

  if (
    enforceTshirtColors &&
    tshirtColorsSet &&
    String(product_type || '').toLowerCase() === 'tshirt' &&
    base_color &&
    !tshirtColorsSet.has(base_color)
  ) {
    return { __filtered: true };
  }

  // Design name: prefer parsed design, but strip leading collection prefixes if present.
  let design_name = (parsed?.design_name || '').toString().trim();
  if (design_name) {
    const prefix1 = collection.replace(/_/g, '-');
    const prefix2 = collection;
    if (design_name.toLowerCase().startsWith(`${prefix1}-`)) {
      design_name = design_name.slice(prefix1.length + 1);
    } else if (design_name.toLowerCase().startsWith(`${prefix2}-`)) {
      design_name = design_name.slice(prefix2.length + 1);
    }
  } else {
    // Fallback: if we have at least collection/design/... structure
    design_name = (parts[1] || '').toString().trim();
  }

  const row = {
    collection,
    subcategory: null,
    sub_subcategory: null,
    design_name: design_name || null,
    drawing_color: drawing_color || null,
    base_color: base_color || null,
    product_type: product_type || null,
    file_path: clean,
    variant_id: null,
    display_order: null,
    is_active: true
  };

  return row;
}

async function listSupabaseMediaRecursively(prefix = '') {
  const bucket = 'media';
  const root = (prefix || '').toString().replace(/^\/+/, '').replace(/\/+$/, '');
  const queue = [root];
  const keys = [];

  while (queue.length) {
    const folder = queue.shift();
    let offset = 0;
    const limit = 1000;

    // paginate to be safe
    while (true) {
      const { data, error } = await supabase
        .storage
        .from(bucket)
        .list(folder, { limit, offset });

      if (error) throw error;

      const items = data || [];
      for (const it of items) {
        if (!it?.name || it.name === '.keep') continue;
        if (isFileEntry(it)) {
          const key = folder ? `${folder}/${it.name}` : it.name;
          keys.push(key);
        } else {
          const sub = folder ? `${folder}/${it.name}` : it.name;
          queue.push(sub);
        }
      }

      if (items.length < limit) break;
      offset += limit;
    }
  }

  return keys;
}

function normalizeLegacyBaseColor(raw) {
  const v = (raw || '').toString().trim().toLowerCase();
  if (!v) return '';
  if (['white', 'blanc', 'blanco'].includes(v)) return 'white';
  if (['black', 'negre', 'negro'].includes(v)) return 'black';
  if (['militar', 'military'].includes(v)) return 'military-green';
  if (['green'].includes(v)) return 'military-green';
  if (['forest', 'forest-green'].includes(v)) return 'forest-green';
  return v;
}

function loadOfficialTshirtColors(colorsJsonPath) {
  const p = colorsJsonPath || DEFAULT_TSHIRT_COLORS_JSON;
  if (!fs.existsSync(p)) {
    throw new Error(`tshirt colors.json not found: ${p}`);
  }
  const raw = fs.readFileSync(p, 'utf-8');
  const parsed = JSON.parse(raw);
  const selected = Array.isArray(parsed?.selected) ? parsed.selected : [];
  const set = new Set(selected.map((s) => String(s || '').trim()).filter(Boolean));
  return {
    path: p,
    selected,
    selectedSet: set
  };
}

const supabase = createClient(supabaseUrl, supabaseKey);

function toCsvValue(v) {
  const s = v === undefined || v === null ? '' : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function writeCSV(filePath, rows) {
  const headers = [
    'collection',
    'subcategory',
    'sub_subcategory',
    'design_name',
    'drawing_color',
    'base_color',
    'product_type',
    'file_path',
    'variant_id',
    'display_order'
  ];

  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(headers.map((h) => toCsvValue(r?.[h] ?? '')).join(','));
  }
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf-8');
}

function writeSimpleCSV(filePath, headers, rows) {
  const cols = Array.isArray(headers) ? headers : [];
  const lines = [cols.join(',')];
  for (const r of rows || []) {
    lines.push(cols.map((h) => toCsvValue(r?.[h] ?? '')).join(','));
  }
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf-8');
}

function summarize(mockups) {
  const byCollection = new Map();
  const bySemantic = new Map();
  const dupSemantic = new Map();
  const missing = {
    collection: 0,
    design_name: 0,
    drawing_color: 0,
    base_color: 0,
    product_type: 0,
    file_path: 0
  };

  for (const m of mockups) {
    for (const k of Object.keys(missing)) {
      if (!m?.[k]) missing[k]++;
    }

    const c = m?.collection || '(buit)';
    byCollection.set(c, (byCollection.get(c) || 0) + 1);

    const semanticKey = [
      m?.collection || '',
      m?.subcategory || '',
      m?.sub_subcategory || '',
      m?.design_name || '',
      m?.drawing_color || '',
      m?.base_color || '',
      m?.product_type || ''
    ].join('|');

    bySemantic.set(semanticKey, (bySemantic.get(semanticKey) || 0) + 1);
  }

  for (const [k, n] of bySemantic.entries()) {
    if (n > 1) dupSemantic.set(k, n);
  }

  const collectionsTop = [...byCollection.entries()].sort((a, b) => b[1] - a[1]);
  const dupSemanticTop = [...dupSemantic.entries()].sort((a, b) => b[1] - a[1]);

  return {
    total: mockups.length,
    missing,
    collectionsTop,
    duplicateSemanticCount: dupSemanticTop.length,
    duplicateSemanticTop: dupSemanticTop.slice(0, 20)
  };
}

function parseFileName(fileName, options = {}) {
  const withoutExt = path.basename(fileName, path.extname(fileName));
  const parts = withoutExt.split('-');

  if (parts.length < 4) {
    if (!options?.silent) {
      console.warn(`Warning: Invalid filename format: ${fileName}`);
    }
    return null;
  }

  const productType = parts.pop();
  const baseColor = parts.pop();
  const drawingColor = parts.pop();
  const designName = parts.join('-');

  return {
    design_name: designName,
    drawing_color: drawingColor,
    base_color: baseColor,
    product_type: productType
  };
}

function scanDirectory(dirPath, baseDir = dirPath, options = {}) {
  const mockups = [];
  const { enforceTshirtColors = false, tshirtColorsSet = null } = options;
  let filteredByTshirtColor = 0;

  function scan(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scan(fullPath);
        continue;
      }

      if (!stat.isFile()) continue;

      const ext = path.extname(item).toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(ext)) continue;

      const parsed = parseFileName(item);
      if (!parsed) continue;

      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      const segments = relativePath.split('/').filter(Boolean);
      const collection = segments[0] || null;
      const subcategory = segments.length >= 3 ? segments[1] : null;
      const sub_subcategory = segments.length >= 4 ? segments[2] : null;

      if (!collection) continue;

      const product_type = parsed.product_type;
      const base_color = normalizeLegacyBaseColor(parsed.base_color);

      if (
        enforceTshirtColors &&
        tshirtColorsSet &&
        String(product_type || '').toLowerCase() === 'tshirt' &&
        base_color &&
        !tshirtColorsSet.has(base_color)
      ) {
        filteredByTshirtColor += 1;
        continue;
      }

      mockups.push({
        collection,
        subcategory,
        sub_subcategory,
        ...parsed,
        base_color,
        file_path: '/' + relativePath,
        is_active: true
      });
    }
  }

  scan(dirPath);
  mockups._filteredByTshirtColor = filteredByTshirtColor;
  return mockups;
}

function parseCSV(csvPath) {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());

  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const mockups = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const mockup = {};

    headers.forEach((header, index) => {
      const value = values[index];

      if (value && value !== '') {
        if (header === 'display_order') {
          mockup[header] = parseInt(value, 10);
        } else if (header === 'is_active') {
          mockup[header] = value.toLowerCase() === 'true';
        } else {
          mockup[header] = value;
        }
      }
    });

    if (mockup.collection && mockup.design_name && mockup.file_path) {
      mockups.push(mockup);
    }
  }

  return mockups;
}

async function importMockups(mockups, options = {}) {
  const { dryRun = false, batchSize = 50 } = options;

  console.log(`\n📦 Found ${mockups.length} mockups to import`);

  if (dryRun) {
    console.log('\n🔍 DRY RUN - No data will be inserted\n');
    mockups.slice(0, 5).forEach((m, i) => {
      console.log(`${i + 1}. ${m.collection} / ${m.design_name} (${m.drawing_color} on ${m.base_color})`);
    });
    if (mockups.length > 5) {
      console.log(`... and ${mockups.length - 5} more`);
    }
    return;
  }

  let imported = 0;
  let failed = 0;

  for (let i = 0; i < mockups.length; i += batchSize) {
    const batch = mockups.slice(i, i + batchSize);

    try {
      const { data, error } = await supabase
        .from('product_mockups')
        .insert(batch)
        .select();

      if (error) throw error;

      imported += data.length;
      console.log(`✅ Imported batch ${Math.floor(i / batchSize) + 1}: ${data.length} mockups`);
    } catch (error) {
      failed += batch.length;
      console.error(`❌ Failed to import batch ${Math.floor(i / batchSize) + 1}:`, error.message);

      for (const mockup of batch) {
        try {
          const { error: singleError } = await supabase
            .from('product_mockups')
            .insert(mockup)
            .select();

          if (singleError) {
            console.error(`   ❌ Failed: ${mockup.design_name}:`, singleError.message);
          } else {
            imported++;
            failed--;
          }
        } catch (e) {
          console.error(`   ❌ Failed: ${mockup.design_name}`);
        }
      }
    }
  }

  console.log(`\n✨ Import complete!`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ❌ Failed: ${failed}`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node scripts/import-mockups.js --csv mockups.csv');
    console.log('  node scripts/import-mockups.js --scan /path/to/mockups');
    console.log('  node scripts/import-mockups.js --csv mockups.csv --dry-run');
    process.exit(1);
  }

  let mockups = [];
  let dryRun = false;
  let validate = false;
  let outPath = null;
  let inventoryOnly = false;
  let enforceTshirtColors = false;
  let tshirtColorsJsonPath = null;
  let inventorySupabaseMedia = false;
  let supabasePrefix = '';
  let canonicalA = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--csv') {
      const csvPath = args[++i];
      if (!csvPath || !fs.existsSync(csvPath)) {
        console.error(`Error: CSV file not found: ${csvPath}`);
        process.exit(1);
      }
      console.log(`📄 Reading CSV: ${csvPath}`);
      mockups = parseCSV(csvPath);
    } else if (arg === '--scan') {
      const dirPath = args[++i];
      if (!dirPath || !fs.existsSync(dirPath)) {
        console.error(`Error: Directory not found: ${dirPath}`);
        process.exit(1);
      }
      console.log(`📁 Scanning directory: ${dirPath}`);
      const tshirt = enforceTshirtColors ? loadOfficialTshirtColors(tshirtColorsJsonPath) : null;
      mockups = scanDirectory(dirPath, dirPath, {
        enforceTshirtColors,
        tshirtColorsSet: tshirt?.selectedSet || null
      });
    } else if (arg === '--inventory') {
      const dirPath = args[++i];
      if (!dirPath || !fs.existsSync(dirPath)) {
        console.error(`Error: Directory not found: ${dirPath}`);
        process.exit(1);
      }
      console.log(`📁 Building inventory from: ${dirPath}`);
      const tshirt = enforceTshirtColors ? loadOfficialTshirtColors(tshirtColorsJsonPath) : null;
      mockups = scanDirectory(dirPath, dirPath, {
        enforceTshirtColors,
        tshirtColorsSet: tshirt?.selectedSet || null
      });
      inventoryOnly = true;
    } else if (arg === '--inventory-supabase-media') {
      // Optional prefix argument
      const maybePrefix = args[i + 1];
      if (maybePrefix && !maybePrefix.startsWith('--')) {
        supabasePrefix = args[++i];
      }
      inventorySupabaseMedia = true;
      inventoryOnly = true;
    } else if (arg === '--canonical-a') {
      canonicalA = true;
    } else if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg === '--validate') {
      validate = true;
    } else if (arg === '--enforce-tshirt-colors') {
      enforceTshirtColors = true;
    } else if (arg === '--tshirt-colors-json') {
      tshirtColorsJsonPath = args[++i];
      if (!tshirtColorsJsonPath) {
        console.error('Error: --tshirt-colors-json requires a file path');
        process.exit(1);
      }
    } else if (arg === '--out') {
      outPath = args[++i];
      if (!outPath) {
        console.error('Error: --out requires a file path');
        process.exit(1);
      }
    }
  }

  if (inventorySupabaseMedia) {
    console.log(
      `📦 Listing Supabase Storage bucket "media" (recursive)${supabasePrefix ? ` | prefix: ${supabasePrefix}` : ''}...`
    );

    const tshirt = enforceTshirtColors ? loadOfficialTshirtColors(tshirtColorsJsonPath) : null;
    const keys = await listSupabaseMediaRecursively(supabasePrefix);
    console.log(`✅ Storage objects found: ${keys.length}`);

    let filteredByTshirtColor = 0;
    const legacy = [];
    const mismatch = [];
    const candidates = [];

    for (const k of keys) {
      if (canonicalA) {
        const r = buildRowFromCanonicalAStorageKey(k, {
          enforceTshirtColors,
          tshirtColorsSet: tshirt?.selectedSet || null
        });
        if (!r?.ok) {
          if (r?.reason === 'base_mismatch' || r?.reason === 'drawing_mismatch') {
            mismatch.push(r);
          } else if (r?.reason && r?.reason !== 'not_image') {
            legacy.push(r);
          }
          continue;
        }
        candidates.push(r.row);
        continue;
      }

      const row = buildMockupRowFromStorageKey(k, {
        enforceTshirtColors,
        tshirtColorsSet: tshirt?.selectedSet || null
      });
      if (!row) continue;
      if (row.__filtered) {
        filteredByTshirtColor += 1;
        continue;
      }
      if (!row.design_name || !row.product_type) continue;
      candidates.push(row);
    }

    // Deduplicate by semantic key
    const byKey = new Map();
    for (const r of candidates) {
      const k = getSemanticKey(r);
      if (!byKey.has(k)) byKey.set(k, []);
      byKey.get(k).push(r);
    }

    const deduped = [];
    const duplicates = [];
    for (const [k, group] of byKey.entries()) {
      if (!group || group.length === 0) continue;
      if (group.length === 1) {
        deduped.push(group[0]);
        continue;
      }
      const winner = chooseWinnerRow(group);
      if (winner) deduped.push(winner);
      for (const it of group) {
        if (winner && it?.file_path === winner.file_path) continue;
        duplicates.push({ semantic_key: k, file_path: it?.file_path || '' });
      }
    }

    deduped._filteredByTshirtColor = filteredByTshirtColor;
    deduped._legacy = legacy;
    deduped._mismatch = mismatch;
    deduped._duplicates = duplicates;
    mockups = deduped;
  }

  if (mockups.length === 0) {
    console.error('Error: No mockups found');
    process.exit(1);
  }

  if (validate || inventoryOnly) {
    const s = summarize(mockups);
    console.log(`\n📊 Summary`);
    console.log(`   total: ${s.total}`);
    if (enforceTshirtColors) {
      const tshirt = loadOfficialTshirtColors(tshirtColorsJsonPath);
      const filtered = mockups?._filteredByTshirtColor || 0;
      console.log(`   enforce tshirt colors: ON (selected=${tshirt.selected.length})`);
      console.log(`   tshirt colors.json: ${tshirt.path}`);
      console.log(`   filtered (non-official tshirt base_color): ${filtered}`);
    }
    console.log(`   missing: collection=${s.missing.collection}, design_name=${s.missing.design_name}, drawing_color=${s.missing.drawing_color}, base_color=${s.missing.base_color}, product_type=${s.missing.product_type}, file_path=${s.missing.file_path}`);
    console.log(`   duplicate semantic groups: ${s.duplicateSemanticCount}`);

    console.log(`\n🏷️ Top collections:`);
    s.collectionsTop.slice(0, 30).forEach(([c, n]) => console.log(`   ${n} · ${c}`));

    if (s.duplicateSemanticTop.length) {
      console.log(`\n⚠️ Top duplicate semantic groups:`);
      s.duplicateSemanticTop.forEach(([k, n]) => console.log(`   ${n}x · ${k}`));
    }
  }

  if (outPath) {
    writeCSV(outPath, mockups);

    if (inventorySupabaseMedia && canonicalA) {
      const base = outPath.replace(/\.csv$/i, '');
      const legacy = Array.isArray(mockups?._legacy) ? mockups._legacy : [];
      const mismatch = Array.isArray(mockups?._mismatch) ? mockups._mismatch : [];
      const duplicates = Array.isArray(mockups?._duplicates) ? mockups._duplicates : [];

      if (legacy.length) {
        writeSimpleCSV(`${base}-legacy.csv`, ['reason', 'file_path'], legacy);
      }
      if (mismatch.length) {
        writeSimpleCSV(`${base}-mismatch.csv`, ['reason', 'file_path', 'base_folder', 'base_name', 'drawing_folder', 'drawing_name'], mismatch);
      }
      if (duplicates.length) {
        writeSimpleCSV(`${base}-duplicates.csv`, ['semantic_key', 'file_path'], duplicates);
      }
    }
    console.log(`\n✅ Wrote CSV: ${outPath}`);
  }

  if (inventoryOnly) {
    return;
  }

  await importMockups(mockups, { dryRun });
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
