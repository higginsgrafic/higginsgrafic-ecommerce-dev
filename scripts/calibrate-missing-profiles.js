import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { config } from 'dotenv';
import sharp from 'sharp';

config();

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

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function mkdirp(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeJson(p, obj) {
  fs.writeFileSync(p, `${JSON.stringify(obj, null, 2)}\n`, 'utf-8');
}

function readDirSafe(dir) {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}

function copyFileSafe(from, to) {
  fs.copyFileSync(from, to);
}

function normalizeComparable(value) {
  return (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9\s-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value) {
  return normalizeComparable(value)
    .split(' ')
    .map((t) => t.trim())
    .filter(Boolean);
}

function getMetadataText(product) {
  const meta = product?.metadata;
  if (!meta) return '';
  if (Array.isArray(meta)) {
    return meta
      .map((m) => {
        const k = (m?.key || '').toString();
        const v = (m?.value || '').toString();
        return `${k} ${v}`.trim();
      })
      .join(' ');
  }
  if (typeof meta === 'object') {
    try {
      return JSON.stringify(meta);
    } catch {
      return '';
    }
  }
  return `${meta}`;
}

function normalizeDesignForMatching(designSlug) {
  const raw = (designSlug || '').toString().trim();
  if (!raw) return '';
  // Allow matching NX-01 like tokens even if stored with uppercase.
  return raw.replace(/_/g, '-');
}

function designNeedles(designSlug) {
  const norm = normalizeComparable(designSlug).replace(/\s+/g, ' ').trim();
  if (!norm) return [];
  const compact = norm.replace(/[\s-]+/g, '');
  return Array.from(new Set([norm, compact].filter(Boolean)));
}

function slugifyComparable(value) {
  return normalizeComparable(value).replace(/\s+/g, '-').trim();
}

function extractChooseYourOption(product) {
  const meta = product?.metadata;
  if (!Array.isArray(meta)) return null;
  for (const m of meta) {
    if ((m?.key || '').toString() !== 'primaryPreviewProductVariantKey') continue;
    const v = (m?.value || '').toString();
    const marker = 'Choose Your Option=';
    const idx = v.indexOf(marker);
    if (idx === -1) continue;
    const opt = v.slice(idx + marker.length).trim();
    return opt || null;
  }
  return null;
}

function cubeOptionAliases(optionRaw) {
  const s = slugifyComparable(optionRaw);
  const compact = s.replace(/[\s-]+/g, '');

  // Map Gelato option labels to our internal cube slugs.
  // Note: we only use these aliases to match the current missing.design.
  if (s === 'c-cube-p0' || compact === 'ccubep0') return ['cube-3-p0'];
  if (s === 'cylon-cube' || compact === 'cyloncube') return ['cylon-cube-03'];
  if (s === 'iron-kong' || compact === 'ironkong') return ['iron-cube-08-iron-kong'];
  if (s === 'iron-cube' || compact === 'ironcube') return ['iron-cube-68'];

  return [];
}

function scoreMatch({ titleTokens, designTokens }) {
  // simple overlap score
  const set = new Set(titleTokens);
  let hits = 0;
  for (const t of designTokens) if (set.has(t)) hits++;
  return hits;
}

function guessCollectionFromTitle(title) {
  const t = normalizeComparable(title);
  if (t.includes('first contact') || t.includes('first-contact') || t.includes('first_contact')) return 'first_contact';
  if (t.includes('the human inside') || t.includes('the-human-inside') || t.includes('the_human_inside')) return 'the_human_inside';
  if (t.includes('outcasted')) return 'outcasted';
  if (t.includes('austen')) return 'austen';
  if (t.includes('cube')) return 'cube';
  return null;
}

async function fetchJson(url, headers) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

async function listAllStoreProducts({ supabaseUrl, anonKey, storeId }) {
  const edgeUrl = `${supabaseUrl.replace(/\/+$/, '')}/functions/v1/gelato-proxy`;
  const headers = {
    Authorization: `Bearer ${anonKey}`,
    apikey: anonKey,
    'Content-Type': 'application/json'
  };

  const all = [];
  const limit = 100;
  let offset = 0;
  for (let page = 0; page < 50; page++) {
    const url = new URL(edgeUrl);
    url.searchParams.set('action', 'store-products');
    if (storeId) url.searchParams.set('storeId', storeId);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('offset', String(offset));

    const data = await fetchJson(url.toString(), headers);
    const items = Array.isArray(data?.data)
      ? data.data
      : (Array.isArray(data?.products) ? data.products : (Array.isArray(data) ? data : []));

    all.push(...items);
    if (items.length < limit) break;
    offset += items.length;
  }

  return all;
}

async function getStoreProduct({ supabaseUrl, anonKey, storeId, productId }) {
  const edgeUrl = `${supabaseUrl.replace(/\/+$/, '')}/functions/v1/gelato-proxy`;
  const headers = {
    Authorization: `Bearer ${anonKey}`,
    apikey: anonKey,
    'Content-Type': 'application/json'
  };

  const url = new URL(edgeUrl);
  url.searchParams.set('action', 'store-product');
  if (storeId) url.searchParams.set('storeId', storeId);
  url.searchParams.set('productId', productId);

  return fetchJson(url.toString(), headers);
}

function isTshirtLikeProfile(missing) {
  // for now, skip mugs/tassa because we only have t-shirt placeholders
  const inks = Array.isArray(missing?.inks) ? missing.inks : [];
  if (inks.includes('tassa')) return false;
  return true;
}

function findBestGelatoProduct({ missing, products }) {
  const designSlug = normalizeDesignForMatching(missing.design);
  const designTokens = tokenize(designSlug.replace(/-/g, ' '));
  const needles = designNeedles(designSlug);

  const forceProductId = missing?.forceProductId ? String(missing.forceProductId) : null;
  const forceOptionRaw = (missing?.forceOption || '').toString().trim();
  const forceOptionNeedles = forceOptionRaw ? designNeedles(slugifyComparable(forceOptionRaw)) : [];

  const scored = [];
  for (const p of products) {
    if (forceProductId) {
      if (String(p?.id) !== forceProductId) continue;
      return {
        product: p,
        score: 9999,
        rawScore: 0,
        collectionBonus: 0,
        designBonus: 9999,
        title: p?.title || p?.name || '',
        designHit: { meta: true, handle: false, template: false }
      };
    }

    const title = p?.title || p?.name || '';
    const titleTokens = tokenize(title);
    const s = scoreMatch({ titleTokens, designTokens });

    const metaText = normalizeComparable(getMetadataText(p));
    const metaCompact = metaText.replace(/[\s-]+/g, '');
    const handleText = normalizeComparable(p?.handle || '');
    const handleCompact = handleText.replace(/[\s-]+/g, '');
    const templateText = normalizeComparable(p?.templateName || '');
    const templateCompact = templateText.replace(/[\s-]+/g, '');

    const optionTextRaw = extractChooseYourOption(p);
    const optionText = normalizeComparable(optionTextRaw || '');
    const optionCompact = optionText.replace(/[\s-]+/g, '');

    const optionAliases = missing?.collection === 'cube' && optionTextRaw ? cubeOptionAliases(optionTextRaw) : [];
    const missingDesignNorm = slugifyComparable(missing?.design || '');
    const aliasHit = optionAliases.some((a) => slugifyComparable(a) === missingDesignNorm);

    const designHitInMeta = needles.some((n) => metaText.includes(n) || metaCompact.includes(n));
    const designHitInHandle = needles.some((n) => handleText.includes(n) || handleCompact.includes(n));
    const designHitInTemplate = needles.some((n) => templateText.includes(n) || templateCompact.includes(n));

    const designHitInOption = forceOptionNeedles.length
      ? forceOptionNeedles.some((n) => optionText.includes(n) || optionCompact.includes(n))
      : (needles.some((n) => optionText.includes(n) || optionCompact.includes(n)) || aliasHit);

    const designBonus =
      (designHitInMeta ? 10 : 0) +
      (designHitInHandle ? 6 : 0) +
      (designHitInTemplate ? 6 : 0) +
      (designHitInOption ? 10 : 0);

    const collectionGuess = guessCollectionFromTitle(title);
    const collectionBonus = collectionGuess && collectionGuess === missing.collection ? 2 : 0;

    // Avoid false positives: require explicit design hit in metadata/handle/template/option.
    // Title token overlap alone is not reliable (many products are titled only by collection + color).
    if (designBonus === 0) continue;

    scored.push({
      product: p,
      score: s + collectionBonus + designBonus,
      rawScore: s,
      collectionBonus,
      designBonus,
      title,
      designHit: { meta: designHitInMeta, handle: designHitInHandle, template: designHitInTemplate, option: designHitInOption }
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.length ? scored[0] : null;
}

async function downloadTo(url, outPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);

  const buf = Buffer.from(await res.arrayBuffer());

  // Detect basic image type by signature
  const isPng = buf.length >= 8 && buf.subarray(0, 8).toString('hex') === '89504e470d0a1a0a';
  const isJpeg = buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const isWebp = buf.length >= 12 && buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP';

  if (isPng) {
    fs.writeFileSync(outPath, buf);
    return;
  }

  if (isJpeg || isWebp) {
    await sharp(buf).png().toFile(outPath);
    return;
  }

  // Fallback: try to let sharp decode and re-encode as PNG.
  await sharp(buf).png().toFile(outPath);
}

function runCalibrateSweep({ previewPath, outDir, prefix, scale }) {
  const args = [
    'scripts/calibrate-gelato-bbox.js',
    '--preview',
    previewPath,
    '--sweep',
    '--scale',
    String(scale),
    '--out-dir',
    outDir,
    '--prefix',
    prefix
  ];

  const r = spawnSync('node', args, { stdio: 'inherit' });
  if (r.status !== 0) {
    throw new Error(`calibrate-gelato-bbox sweep failed with exit code ${r.status}`);
  }
}

function pickBestSweepCandidate(outDir, prefix = 'sweep') {
  const files = readDirSafe(outDir);
  const jsons = files
    .filter((f) => f.startsWith(`${prefix}_`) && f.endsWith('.json'))
    .map((f) => path.join(outDir, f));

  const groups = new Map();

  for (const jp of jsons) {
    let data;
    try {
      data = JSON.parse(fs.readFileSync(jp, 'utf-8'));
    } catch {
      continue;
    }

    const b = data?.bboxPaddedScaled || data?.bboxScaled || null;
    if (!b) continue;
    const key = `${b.x},${b.y},${b.w},${b.h}`;
    const entry = groups.get(key) || { count: 0, jsonPath: jp };
    entry.count += 1;
    // keep the first jsonPath as representative
    groups.set(key, entry);
  }

  const best = Array.from(groups.entries()).sort((a, b) => b[1].count - a[1].count)[0];
  if (!best) return null;

  const bestJsonPath = best[1].jsonPath;
  const bestPngPath = bestJsonPath.replace(/\.json$/i, '.png');
  if (!fs.existsSync(bestPngPath)) return { bestJsonPath, bestPngPath: null, count: best[1].count };

  return { bestJsonPath, bestPngPath, count: best[1].count };
}

async function main() {
  const args = process.argv.slice(2);

  const reportPath = getArg(args, '--report', path.join(process.cwd(), '.tmp', 'mockups-batch-report.after-normalize-v2.json'));
  const outRoot = getArg(args, '--out-root', path.join(process.cwd(), '.tmp', 'calibration'));
  const limit = Number(getArg(args, '--limit', '1'));
  const scale = Number(getArg(args, '--scale', '3'));
  const dryRun = hasFlag(args, '--dry-run');
  const openBest = hasFlag(args, '--open');

  const manualCollection = getArg(args, '--collection', null);
  const manualDesign = getArg(args, '--design', null);
  const forceOption = getArg(args, '--force-option', null);
  const forceProductId = getArg(args, '--force-product-id', null);

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const storeId = process.env.VITE_GELATO_STORE_ID;

  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing env vars: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required');
  }

  let missingProfiles = [];
  if (manualCollection && manualDesign) {
    const key = `${manualCollection}/${manualDesign}`;
    missingProfiles = [
      {
        key,
        collection: manualCollection,
        design: manualDesign,
        inks: ['default'],
        forceOption,
        forceProductId
      }
    ];
  } else {
    if (!fs.existsSync(reportPath)) throw new Error(`Report not found: ${reportPath}`);
    const report = readJson(reportPath);
    missingProfiles = Array.isArray(report?.missingProfiles) ? report.missingProfiles : [];
  }

  const products = await listAllStoreProducts({ supabaseUrl, anonKey, storeId });

  const planned = [];
  const skipped = [];
  const unmatched = [];

  for (const m of missingProfiles) {
    if (!isTshirtLikeProfile(m)) {
      skipped.push({ key: m.key, reason: 'non_tshirt_profile (e.g. tassa)' });
      continue;
    }

    const best = findBestGelatoProduct({ missing: m, products });
    if (!best) {
      unmatched.push({ key: m.key, collection: m.collection, design: m.design, reason: 'no_candidate_match' });
      continue;
    }

    planned.push({
      key: m.key,
      collection: m.collection,
      design: m.design,
      inks: m.inks,
      gelato: {
        id: best.product?.id,
        title: best.title,
        score: best.score,
        rawScore: best.rawScore,
        collectionBonus: best.collectionBonus,
        previewUrl: best.product?.previewUrl || null,
        imageUrl: best.product?.imageUrl || null,
        mockupUrl: best.product?.mockupUrl || null
      }
    });

    if (planned.length >= limit) break;
  }

  mkdirp(outRoot);

  const outputs = [];

  for (const item of planned) {
    const keyToken = item.key.replace(/\//g, '__');
    const outDir = path.join(outRoot, keyToken);
    mkdirp(outDir);

    // Ensure we have a preview url: if not, fetch store-product detail
    let previewUrl = item.gelato.previewUrl || item.gelato.mockupUrl || item.gelato.imageUrl;
    let storeProductDetail = null;

    if (!previewUrl && item.gelato.id) {
      storeProductDetail = await getStoreProduct({ supabaseUrl, anonKey, storeId, productId: item.gelato.id });
      const p = storeProductDetail?.data || storeProductDetail?.product || storeProductDetail;
      previewUrl = p?.previewUrl || p?.mockupUrl || p?.imageUrl || null;
    }

    if (!previewUrl) {
      outputs.push({ key: item.key, ok: false, reason: 'no_preview_url', gelato: item.gelato });
      continue;
    }

    const previewPath = path.join(outDir, 'gelato-preview.png');
    const metaPath = path.join(outDir, 'meta.json');

    const meta = {
      key: item.key,
      collection: item.collection,
      design: item.design,
      inks: item.inks,
      gelato: {
        ...item.gelato,
        previewUrl
      }
    };

    writeJson(metaPath, meta);

    if (!dryRun) {
      await downloadTo(previewUrl, previewPath);
      runCalibrateSweep({ previewPath, outDir, prefix: 'sweep', scale });

      const best = pickBestSweepCandidate(outDir, 'sweep');
      if (best?.bestJsonPath) {
        // Resultat Posició: copy of the chosen calibrator (one of the sweep_*.json/png)
        const resultJsonOut = path.join(outDir, 'resultat-posicio.json');
        copyFileSafe(best.bestJsonPath, resultJsonOut);
        const resultPngOut = path.join(outDir, 'resultat-posicio.png');
        if (best.bestPngPath && fs.existsSync(best.bestPngPath)) {
          copyFileSafe(best.bestPngPath, resultPngOut);
        }

        // Backward-compat: keep best.json/best.png for older tooling.
        const bestJsonOut = path.join(outDir, 'best.json');
        copyFileSafe(resultJsonOut, bestJsonOut);
        const bestPngOut = path.join(outDir, 'best.png');
        if (fs.existsSync(resultPngOut)) {
          copyFileSafe(resultPngOut, bestPngOut);
        }

        if (openBest && fs.existsSync(resultPngOut)) {
          spawnSync('open', [resultPngOut], { stdio: 'ignore' });
        }
      }
    }

    outputs.push({ key: item.key, ok: true, outDir, previewPath, metaPath, previewUrl, dryRun });
  }

  const finalReport = {
    reportPath: manualCollection && manualDesign ? null : reportPath,
    outRoot,
    limit,
    dryRun,
    gelatoProductsCount: products.length,
    plannedCount: planned.length,
    skippedCount: skipped.length,
    unmatchedCount: unmatched.length,
    planned,
    skipped,
    unmatched,
    outputs
  };

  const outReportPath = path.join(outRoot, 'calibration-plan-report.json');
  writeJson(outReportPath, finalReport);

  console.log(JSON.stringify({ outReportPath, ...finalReport }, null, 2));
}

main().catch((e) => {
  console.error(e?.message || String(e));
  process.exit(1);
});
