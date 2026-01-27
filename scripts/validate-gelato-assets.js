import fs from 'fs';
import path from 'path';

const DEFAULT_TSHIRT_COLORS_JSON = path.join(
  process.cwd(),
  'public',
  'placeholders',
  'apparel',
  't-shirt',
  'gildan_5000',
  'colors.json'
);

function getArg(args, name, fallback = null) {
  const idx = args.indexOf(name);
  if (idx === -1) return fallback;
  const v = args[idx + 1];
  if (!v || v.startsWith('--')) return fallback;
  return v;
}

function hasFlag(args, name) {
  return args.includes(name);
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function isDirectory(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function listDirs(p) {
  try {
    return fs
      .readdirSync(p, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return [];
  }
}

function listFiles(p) {
  try {
    return fs
      .readdirSync(p, { withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => d.name);
  } catch {
    return [];
  }
}

function normalizeSlug(v) {
  return (v || '').toString().trim().toLowerCase();
}

function loadOfficialTshirtColors(colorsJsonPath) {
  const p = colorsJsonPath || DEFAULT_TSHIRT_COLORS_JSON;
  if (!fs.existsSync(p)) {
    throw new Error(`tshirt colors.json not found: ${p}`);
  }
  const data = readJson(p);
  const selected = Array.isArray(data?.selected) ? data.selected : [];
  const set = new Set(selected.map((c) => normalizeSlug(c?.slug)).filter(Boolean));
  return { path: p, selectedSlugs: selected.map((c) => normalizeSlug(c?.slug)).filter(Boolean), set };
}

function parseInkFiles(dirPath) {
  const files = listFiles(dirPath);
  const inks = new Set();
  const invalid = [];
  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    if (ext !== '.png') {
      invalid.push({ reason: 'non_png_file', file: f, dir: dirPath });
      continue;
    }
    const base = path.basename(f, ext);
    const ink = normalizeSlug(base);
    if (!ink) {
      invalid.push({ reason: 'empty_ink_name', file: f, dir: dirPath });
      continue;
    }
    inks.add(ink);
  }
  return { inks, invalid };
}

function validateDesign({ designRoot, baseColorsSet, expectedBaseColors, exceptionsSet }) {
  const errors = [];
  const warnings = [];

  const printRoot = path.join(designRoot, 'print');
  const neckRoot = path.join(designRoot, 'neck_label');

  if (!isDirectory(printRoot)) errors.push({ reason: 'missing_print_folder', path: printRoot });
  if (!isDirectory(neckRoot)) errors.push({ reason: 'missing_neck_label_folder', path: neckRoot });
  if (errors.length) return { errors, warnings, baseColors: new Set(), inksByBase: new Map() };

  const baseColors = new Set();
  const inksByBase = new Map();

  const printBaseFolders = listDirs(printRoot).map(normalizeSlug);
  const neckBaseFolders = listDirs(neckRoot).map(normalizeSlug);

  for (const b of new Set([...printBaseFolders, ...neckBaseFolders])) {
    if (!b) continue;
    baseColors.add(b);
  }

  for (const b of baseColors) {
    const printBasePath = path.join(printRoot, b);
    const neckBasePath = path.join(neckRoot, b);

    if (!baseColorsSet.has(b)) {
      errors.push({ reason: 'non_official_base_color_folder', base_color: b, path: designRoot });
      continue;
    }

    if (!isDirectory(printBasePath)) errors.push({ reason: 'missing_print_base_color_folder', base_color: b, path: printBasePath });
    if (!isDirectory(neckBasePath)) errors.push({ reason: 'missing_neck_label_base_color_folder', base_color: b, path: neckBasePath });

    if (!isDirectory(printBasePath) || !isDirectory(neckBasePath)) continue;

    const p = parseInkFiles(printBasePath);
    const n = parseInkFiles(neckBasePath);

    for (const inv of p.invalid) errors.push({ reason: inv.reason, path: path.join(printBasePath, inv.file) });
    for (const inv of n.invalid) errors.push({ reason: inv.reason, path: path.join(neckBasePath, inv.file) });

    if (p.inks.size === 0) errors.push({ reason: 'no_ink_files_in_print', base_color: b, path: printBasePath });
    if (n.inks.size === 0) errors.push({ reason: 'no_ink_files_in_neck_label', base_color: b, path: neckBasePath });

    for (const ink of p.inks) {
      if (!n.inks.has(ink)) {
        errors.push({ reason: 'missing_neck_label_ink', base_color: b, ink_color: ink, path: neckBasePath });
      }
    }

    for (const ink of n.inks) {
      if (!p.inks.has(ink)) {
        warnings.push({ reason: 'extra_neck_label_ink', base_color: b, ink_color: ink, path: neckBasePath });
      }
    }

    inksByBase.set(b, { print: Array.from(p.inks), neck_label: Array.from(n.inks) });
  }

  for (const expected of expectedBaseColors) {
    if (!baseColors.has(expected)) {
      errors.push({ reason: 'missing_base_color_folder', base_color: expected, path: designRoot });
    }
  }

  const designName = normalizeSlug(path.basename(designRoot));
  const isException = exceptionsSet.has(designName);
  if (!isException) {
    for (const b of baseColors) {
      const inks = inksByBase.get(b);
      if (!inks) continue;
      const p = new Set(inks.print.map(normalizeSlug));
      const mustHave = ['white', 'black'];
      for (const ink of mustHave) {
        if (!p.has(ink)) {
          errors.push({ reason: 'missing_default_ink', base_color: b, ink_color: ink, path: designRoot });
        }
      }
      for (const ink of p) {
        if (!mustHave.includes(ink)) {
          warnings.push({ reason: 'unexpected_ink_for_non_exception', base_color: b, ink_color: ink, path: designRoot });
        }
      }
    }
  }

  return { errors, warnings, baseColors, inksByBase };
}

function main() {
  const args = process.argv.slice(2);
  const root = getArg(args, '--root', path.join(process.cwd(), 'gelato_assets'));
  const colorsJsonPath = getArg(args, '--tshirt-colors-json', DEFAULT_TSHIRT_COLORS_JSON);
  const warnOnly = hasFlag(args, '--warn-only');
  const only = getArg(args, '--only', null);

  const exceptions = new Set(['dj-vader', 'looking-for-my-darcy'].map(normalizeSlug));

  if (!isDirectory(root)) {
    console.error(`❌ gelato assets root not found: ${root}`);
    process.exit(1);
  }

  const tshirtColors = loadOfficialTshirtColors(colorsJsonPath);

  const productType = 'tshirt';
  const model = 'gildan_5000';

  const baseRoot = path.join(root, productType, model);
  if (!isDirectory(baseRoot)) {
    console.error(`❌ expected folder missing: ${baseRoot}`);
    process.exit(1);
  }

  const collections = listDirs(baseRoot).map(normalizeSlug).filter(Boolean);
  const findings = {
    errors: [],
    warnings: [],
    designs: []
  };

  for (const collection of collections) {
    const collectionRoot = path.join(baseRoot, collection);
    const designs = listDirs(collectionRoot).filter(Boolean);

    for (const designFolder of designs) {
      const designName = normalizeSlug(designFolder);
      if (only && designName !== normalizeSlug(only)) continue;

      const designRoot = path.join(collectionRoot, designFolder);
      const res = validateDesign({
        designRoot,
        baseColorsSet: tshirtColors.set,
        expectedBaseColors: tshirtColors.selectedSlugs,
        exceptionsSet: exceptions
      });

      findings.designs.push({
        collection,
        design_name: designName,
        base_colors_found: res.baseColors.size,
        errors: res.errors.length,
        warnings: res.warnings.length
      });

      for (const e of res.errors) findings.errors.push({ collection, design_name: designName, ...e });
      for (const w of res.warnings) findings.warnings.push({ collection, design_name: designName, ...w });
    }
  }

  const totalDesigns = findings.designs.length;
  const totalErrors = findings.errors.length;
  const totalWarnings = findings.warnings.length;

  console.log('\n📦 Gelato assets validation');
  console.log(`   root: ${root}`);
  console.log(`   product: ${productType} / ${model}`);
  console.log(`   official base colors: ${tshirtColors.selectedSlugs.length}`);
  console.log(`   exceptions (multi-ink): ${Array.from(exceptions).join(', ')}`);
  console.log(`\n📊 Summary`);
  console.log(`   designs scanned: ${totalDesigns}`);
  console.log(`   errors: ${totalErrors}`);
  console.log(`   warnings: ${totalWarnings}`);

  if (totalErrors) {
    console.log(`\n❌ Errors (top 50):`);
    findings.errors.slice(0, 50).forEach((e) => {
      const where = e?.path ? ` | ${e.path}` : '';
      const base = e?.base_color ? ` | base=${e.base_color}` : '';
      const ink = e?.ink_color ? ` | ink=${e.ink_color}` : '';
      console.log(`   ${e.collection}/${e.design_name} | ${e.reason}${base}${ink}${where}`);
    });
  }

  if (totalWarnings) {
    console.log(`\n⚠️ Warnings (top 50):`);
    findings.warnings.slice(0, 50).forEach((w) => {
      const where = w?.path ? ` | ${w.path}` : '';
      const base = w?.base_color ? ` | base=${w.base_color}` : '';
      const ink = w?.ink_color ? ` | ink=${w.ink_color}` : '';
      console.log(`   ${w.collection}/${w.design_name} | ${w.reason}${base}${ink}${where}`);
    });
  }

  if (totalErrors && !warnOnly) {
    process.exit(1);
  }
}

main();
