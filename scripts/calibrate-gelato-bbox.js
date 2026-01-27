import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

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

function parseNumberList(value) {
  const raw = (value || '').toString().trim();
  if (!raw) return null;
  return raw
    .split(',')
    .map((v) => Number(v.trim()))
    .filter((n) => Number.isFinite(n));
}

function parseRegion(value) {
  const nums = parseNumberList(value);
  if (!nums || nums.length !== 4) return null;
  const [x0, x1, y0, y1] = nums;
  if ([x0, x1, y0, y1].some((n) => n < 0 || n > 1)) return null;
  if (x0 >= x1 || y0 >= y1) return null;
  return { x0, x1, y0, y1 };
}

function safeToken(v) {
  return (v || '').toString().replace(/[^a-z0-9._-]+/gi, '_');
}

function mkdirp(p) {
  fs.mkdirSync(p, { recursive: true });
}

function readPng(p) {
  return PNG.sync.read(fs.readFileSync(p));
}

function writePng(p, png) {
  fs.writeFileSync(p, PNG.sync.write(png));
}

function clampInt(v, min, max) {
  return Math.max(min, Math.min(max, Math.trunc(v)));
}

function applyPaddingToBbox(bbox, pad, imgW, imgH) {
  if (!bbox) return null;
  const p = pad || {};
  const x = bbox.x - (p.left || 0);
  const y = bbox.y - (p.top || 0);
  const w = bbox.w + (p.left || 0) + (p.right || 0);
  const h = bbox.h + (p.top || 0) + (p.bottom || 0);

  const x0 = clampInt(x, 0, imgW - 1);
  const y0 = clampInt(y, 0, imgH - 1);
  const x1 = clampInt(x + w - 1, 0, imgW - 1);
  const y1 = clampInt(y + h - 1, 0, imgH - 1);

  const ww = x1 - x0 + 1;
  const hh = y1 - y0 + 1;
  if (ww <= 0 || hh <= 0) return null;
  return { x: x0, y: y0, w: ww, h: hh };
}

function lum(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function avgLum(png) {
  const w = png.width;
  const h = png.height;
  const data = png.data;

  // Sample to keep it fast.
  const step = 8;
  let sum = 0;
  let n = 0;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const idx = (w * y + x) << 2;
      const a = data[idx + 3];
      if (a === 0) continue;
      sum += lum(data[idx], data[idx + 1], data[idx + 2]);
      n++;
    }
  }
  return n ? sum / n : 255;
}

function bboxFromGradient(previewPng, options = {}) {
  const w = previewPng.width;
  const h = previewPng.height;

  const th = typeof options.threshold === 'number' ? options.threshold : 120;
  const region = options.region || { x0: 0.28, x1: 0.72, y0: 0.22, y1: 0.78 };

  const x0 = Math.max(1, Math.floor(w * region.x0));
  const x1 = Math.min(w - 1, Math.floor(w * region.x1));
  const y0 = Math.max(1, Math.floor(h * region.y0));
  const y1 = Math.min(h - 1, Math.floor(h * region.y1));

  const idxAt = (x, y) => (w * y + x) << 2;
  const alphaAt = (x, y) => previewPng.data[idxAt(x, y) + 3];
  const lumAt = (x, y) => {
    const idx = idxAt(x, y);
    const a = previewPng.data[idx + 3];
    if (a === 0) return null;
    return lum(previewPng.data[idx], previewPng.data[idx + 1], previewPng.data[idx + 2]);
  };

  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  let hits = 0;
  let maxG = 0;

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      if (alphaAt(x, y) === 0) continue;
      const tl = lumAt(x - 1, y - 1);
      const tc = lumAt(x, y - 1);
      const tr = lumAt(x + 1, y - 1);
      const ml = lumAt(x - 1, y);
      const mr = lumAt(x + 1, y);
      const bl = lumAt(x - 1, y + 1);
      const bc = lumAt(x, y + 1);
      const br = lumAt(x + 1, y + 1);
      if ([tl, tc, tr, ml, mr, bl, bc, br].some((v) => v === null)) continue;

      const gx = -1 * tl + 1 * tr + -2 * ml + 2 * mr + -1 * bl + 1 * br;
      const gy = 1 * tl + 2 * tc + 1 * tr + -1 * bl + -2 * bc + -1 * br;
      const g = Math.abs(gx) + Math.abs(gy);
      if (g > maxG) maxG = g;

      if (g < th) continue;
      hits++;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (hits === 0) {
    return { hits, threshold: th, region, bbox: null, maxG };
  }

  return {
    hits,
    threshold: th,
    region,
    bbox: { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 },
    maxG
  };
}

function drawRect(png, rect, options = {}) {
  const { r = 255, g = 0, b = 0, a = 255, thickness = 2 } = options;
  const w = png.width;
  const h = png.height;

  const x0 = Math.max(0, rect.x);
  const y0 = Math.max(0, rect.y);
  const x1 = Math.min(w - 1, rect.x + rect.w - 1);
  const y1 = Math.min(h - 1, rect.y + rect.h - 1);

  const set = (x, y) => {
    const idx = (w * y + x) << 2;
    png.data[idx] = r;
    png.data[idx + 1] = g;
    png.data[idx + 2] = b;
    png.data[idx + 3] = a;
  };

  for (let t = 0; t < thickness; t++) {
    const yt0 = Math.min(h - 1, y0 + t);
    const yt1 = Math.max(0, y1 - t);
    const xt0 = Math.min(w - 1, x0 + t);
    const xt1 = Math.max(0, x1 - t);

    for (let x = xt0; x <= xt1; x++) {
      set(x, yt0);
      set(x, yt1);
    }
    for (let y = yt0; y <= yt1; y++) {
      set(xt0, y);
      set(xt1, y);
    }
  }
}

function drawFillRect(png, rect, options = {}) {
  const { r = 0, g = 255, b = 0, a = 80 } = options;
  const w = png.width;
  const h = png.height;

  const t = Math.max(0, Math.min(1, a / 255));

  const x0 = Math.max(0, rect.x);
  const y0 = Math.max(0, rect.y);
  const x1 = Math.min(w - 1, rect.x + rect.w - 1);
  const y1 = Math.min(h - 1, rect.y + rect.h - 1);

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const idx = (w * y + x) << 2;
      // Alpha blend fill color over the existing pixel so the artwork remains visible.
      const dr = png.data[idx];
      const dg = png.data[idx + 1];
      const db = png.data[idx + 2];
      const da = png.data[idx + 3] / 255;

      // Source-over on opaque destination (Gelato previews are typically fully opaque).
      // If destination has alpha, we keep it by blending colors only.
      png.data[idx] = Math.round(dr * (1 - t) + r * t);
      png.data[idx + 1] = Math.round(dg * (1 - t) + g * t);
      png.data[idx + 2] = Math.round(db * (1 - t) + b * t);
      png.data[idx + 3] = Math.round(Math.max(da, 1) * 255);
    }
  }
}

async function downloadTo(url, outPath) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download failed: HTTP ${res.status}`);
  }
  const arr = new Uint8Array(await res.arrayBuffer());
  fs.writeFileSync(outPath, arr);
}

async function main() {
  const args = process.argv.slice(2);

  const previewUrl = getArg(args, '--preview-url', null);
  const previewPath = getArg(args, '--preview', path.join(process.cwd(), '.tmp', 'gelato-preview.png'));
  const outDir = getArg(args, '--out-dir', path.join(process.cwd(), '.tmp'));
  const outOverlay = getArg(args, '--out-overlay', path.join(outDir, 'gelato-preview-bbox.png'));
  const outJson = getArg(args, '--out-json', path.join(outDir, 'gelato-preview-bbox.json'));

  const threshold = Number(getArg(args, '--threshold', '120'));
  const thresholdList = parseNumberList(getArg(args, '--thresholds', ''));
  const region = parseRegion(getArg(args, '--region', ''));
  const regionListRaw = (getArg(args, '--regions', '') || '').toString().trim();
  const regionList = regionListRaw
    ? regionListRaw
        .split(';')
        .map((s) => parseRegion(s))
        .filter(Boolean)
    : null;

  const scale = Number(getArg(args, '--scale', '3'));
  const dryRun = hasFlag(args, '--dry-run');
  const sweep = hasFlag(args, '--sweep');
  const prefix = getArg(args, '--prefix', 'gelato-preview-bbox');

  const padAll = Number(getArg(args, '--pad', '0'));
  const padX = Number(getArg(args, '--pad-x', '0'));
  const padY = Number(getArg(args, '--pad-y', '0'));
  const padTop = Number(getArg(args, '--pad-top', '0'));
  const padRight = Number(getArg(args, '--pad-right', '0'));
  const padBottom = Number(getArg(args, '--pad-bottom', '0'));
  const padLeft = Number(getArg(args, '--pad-left', '0'));

  const pad = {
    top: (Number.isFinite(padAll) ? padAll : 0) + (Number.isFinite(padY) ? padY : 0) + (Number.isFinite(padTop) ? padTop : 0),
    right:
      (Number.isFinite(padAll) ? padAll : 0) + (Number.isFinite(padX) ? padX : 0) + (Number.isFinite(padRight) ? padRight : 0),
    bottom:
      (Number.isFinite(padAll) ? padAll : 0) + (Number.isFinite(padY) ? padY : 0) + (Number.isFinite(padBottom) ? padBottom : 0),
    left:
      (Number.isFinite(padAll) ? padAll : 0) + (Number.isFinite(padX) ? padX : 0) + (Number.isFinite(padLeft) ? padLeft : 0)
  };

  mkdirp(outDir);

  if (previewUrl) {
    await downloadTo(previewUrl, previewPath);
  }

  if (!fs.existsSync(previewPath)) {
    throw new Error(`Preview PNG not found: ${previewPath}`);
  }

  const preview = readPng(previewPath);
  const previewAvgLum = avgLum(preview);

  const runOnce = (th, reg, fileSuffix = '') => {
    const res = bboxFromGradient(preview, { threshold: th, region: reg || undefined });
    const bboxPadded = res.bbox ? applyPaddingToBbox(res.bbox, pad, preview.width, preview.height) : null;
    const payload = {
      previewPath,
      previewSize: { w: preview.width, h: preview.height },
      ...res,
      bboxPadded,
      bboxScaled: res.bbox
        ? { x: res.bbox.x * scale, y: res.bbox.y * scale, w: res.bbox.w * scale, h: res.bbox.h * scale }
        : null,
      bboxPaddedScaled: bboxPadded
        ? { x: bboxPadded.x * scale, y: bboxPadded.y * scale, w: bboxPadded.w * scale, h: bboxPadded.h * scale }
        : null,
      scale
    };

    if (!dryRun) {
      const jsonPath = fileSuffix
        ? path.join(outDir, `${safeToken(prefix)}_${safeToken(fileSuffix)}.json`)
        : outJson;
      const overlayPath = fileSuffix
        ? path.join(outDir, `${safeToken(prefix)}_${safeToken(fileSuffix)}.png`)
        : outOverlay;

      fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8');
      if (bboxPadded) {
        const overlay = readPng(previewPath);
        const isDark = previewAvgLum < 85;
        // Translucent fill (no outline) so it's easy to see if any pixels fall outside.
        const fillStyle = isDark
          ? { r: 210, g: 210, b: 210, a: 35 }
          : { r: 0, g: 255, b: 0, a: 55 };
        drawFillRect(overlay, bboxPadded, fillStyle);
        writePng(overlayPath, overlay);
      }
    }

    return payload;
  };

  if (!sweep) {
    const payload = runOnce(threshold, region, '');
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const thresholds = (thresholdList && thresholdList.length ? thresholdList : [80, 100, 120, 140, 160]).filter(
    (n) => Number.isFinite(n)
  );
  const regions = regionList && regionList.length
    ? regionList
    : [
        { x0: 0.26, x1: 0.74, y0: 0.20, y1: 0.78 },
        { x0: 0.30, x1: 0.70, y0: 0.24, y1: 0.78 },
        { x0: 0.32, x1: 0.68, y0: 0.26, y1: 0.78 },
        { x0: 0.30, x1: 0.70, y0: 0.28, y1: 0.82 }
      ];

  const outputs = [];
  for (const reg of regions) {
    for (const th of thresholds) {
      const suf = `th${th}_r${reg.x0}-${reg.x1}-${reg.y0}-${reg.y1}`;
      outputs.push(runOnce(th, reg, suf));
    }
  }

  console.log(JSON.stringify({ sweep: true, count: outputs.length, outDir, prefix, outputs }, null, 2));
}

main().catch((e) => {
  console.error(e?.message || String(e));
  process.exit(1);
});
