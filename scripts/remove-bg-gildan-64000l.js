import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

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

function hasNoFlag(args, name) {
  const neg = `--no-${name.replace(/^--/, '')}`;
  return args.includes(neg);
}

function clampByte(v) {
  if (v < 0) return 0;
  if (v > 255) return 255;
  return v;
}

function isBgLike(r, g, b, { lumaMin, maxChroma, minChannel } = {}) {
  const minC = Math.min(r, g, b);
  const maxC = Math.max(r, g, b);
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma >= (lumaMin ?? 245) && (maxC - minC) <= (maxChroma ?? 18) && minC >= (minChannel ?? 235);
}

function idx(x, y, w) {
  return y * w + x;
}

function neighbors4(x, y, w, h) {
  const out = [];
  if (x > 0) out.push([x - 1, y]);
  if (x + 1 < w) out.push([x + 1, y]);
  if (y > 0) out.push([x, y - 1]);
  if (y + 1 < h) out.push([x, y + 1]);
  return out;
}

function computeBgMaskFromEdges({ data, width, height, threshold }) {
  const w = width;
  const h = height;
  const visited = new Uint8Array(w * h);
  const isBg = new Uint8Array(w * h);

  const qx = new Int32Array(w * h);
  const qy = new Int32Array(w * h);
  let qh = 0;
  let qt = 0;

  function push(x, y) {
    const i = idx(x, y, w);
    if (visited[i]) return;
    const p = i * 4;
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    if (!isBgLike(r, g, b, threshold)) return;
    visited[i] = 1;
    isBg[i] = 1;
    qx[qt] = x;
    qy[qt] = y;
    qt++;
  }

  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }

  while (qh < qt) {
    const x = qx[qh];
    const y = qy[qh];
    qh++;
    for (const [nx, ny] of neighbors4(x, y, w, h)) {
      const ni = idx(nx, ny, w);
      if (visited[ni]) continue;
      const p = ni * 4;
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];
      if (!isBgLike(r, g, b, threshold)) {
        visited[ni] = 1;
        continue;
      }
      visited[ni] = 1;
      isBg[ni] = 1;
      qx[qt] = nx;
      qy[qt] = ny;
      qt++;
    }
  }

  return isBg;
}

function applyAlpha({ data, width, height, isBgMask, featherAlpha = 200 }) {
  const w = width;
  const h = height;
  const out = Buffer.from(data);

  for (let i = 0; i < w * h; i++) {
    if (isBgMask[i]) {
      out[i * 4 + 3] = 0;
    } else {
      out[i * 4 + 3] = 255;
    }
  }

  if (featherAlpha != null) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = idx(x, y, w);
        if (isBgMask[i]) continue;
        let nearBg = false;
        for (const [nx, ny] of neighbors4(x, y, w, h)) {
          if (isBgMask[idx(nx, ny, w)]) {
            nearBg = true;
            break;
          }
        }
        if (!nearBg) continue;
        out[i * 4 + 3] = clampByte(featherAlpha);
      }
    }
  }

  return out;
}

async function processOne({ inPath, outPath, threshold, featherAlpha, dryRun }) {
  if (!fs.existsSync(inPath)) throw new Error(`Input not found: ${inPath}`);

  const img = sharp(inPath).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

  const isBgMask = computeBgMaskFromEdges({
    data,
    width: info.width,
    height: info.height,
    threshold
  });

  const outRaw = applyAlpha({
    data,
    width: info.width,
    height: info.height,
    isBgMask,
    featherAlpha
  });

  if (dryRun) {
    return {
      inPath,
      outPath,
      width: info.width,
      height: info.height,
      dryRun: true
    };
  }

  await sharp(outRaw, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(outPath);

  return {
    inPath,
    outPath,
    width: info.width,
    height: info.height,
    dryRun: false
  };
}

async function computeMaskForPath({ inPath, threshold }) {
  if (!fs.existsSync(inPath)) throw new Error(`Input not found: ${inPath}`);
  const img = sharp(inPath).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const isBgMask = computeBgMaskFromEdges({
    data,
    width: info.width,
    height: info.height,
    threshold
  });
  return { isBgMask, width: info.width, height: info.height };
}

async function processOneWithMask({ inPath, outPath, isBgMask, maskWidth, maskHeight, featherAlpha, dryRun }) {
  if (!fs.existsSync(inPath)) throw new Error(`Input not found: ${inPath}`);

  const img = sharp(inPath).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

  let effectiveMask = isBgMask;
  if (maskWidth !== info.width || maskHeight !== info.height) {
    const maskRaw = Buffer.alloc(maskWidth * maskHeight);
    for (let i = 0; i < maskWidth * maskHeight; i++) maskRaw[i] = isBgMask[i] ? 255 : 0;

    const resized = await sharp(maskRaw, { raw: { width: maskWidth, height: maskHeight, channels: 1 } })
      .resize(info.width, info.height, { fit: 'fill' })
      .raw()
      .toBuffer();

    effectiveMask = new Uint8Array(info.width * info.height);
    for (let i = 0; i < info.width * info.height; i++) effectiveMask[i] = resized[i] >= 128 ? 1 : 0;
  }

  const outRaw = applyAlpha({
    data,
    width: info.width,
    height: info.height,
    isBgMask: effectiveMask,
    featherAlpha
  });

  if (dryRun) {
    return {
      inPath,
      outPath,
      width: info.width,
      height: info.height,
      dryRun: true
    };
  }

  await sharp(outRaw, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(outPath);

  return {
    inPath,
    outPath,
    width: info.width,
    height: info.height,
    dryRun: false
  };
}

async function main() {
  const args = process.argv.slice(2);

  const baseDir = getArg(
    args,
    '--dir',
    path.join(process.cwd(), 'public', 'placeholders', 'apparel', 't-shirt', 'gildan_64000l')
  );

  const inWhite = getArg(args, '--white', path.join(baseDir, 'Gildan 64000L WHITE.jpeg'));
  const inBlack = getArg(args, '--black', path.join(baseDir, 'Gildan 64000L BLACK.jpeg'));

  const outWhite = getArg(args, '--out-white', path.join(baseDir, 'white.png'));
  const outBlack = getArg(args, '--out-black', path.join(baseDir, 'black.png'));

  const lumaMin = Number(getArg(args, '--luma-min', '245'));
  const maxChroma = Number(getArg(args, '--max-chroma', '18'));
  const minChannel = Number(getArg(args, '--min-channel', '235'));
  const featherAlpha = Number(getArg(args, '--feather-alpha', '200'));

  const dryRun = hasFlag(args, '--dry-run');

  const whiteMaskFromBlack = !hasNoFlag(args, '--white-mask-from-black');

  const threshold = { lumaMin, maxChroma, minChannel };

  const results = [];

  if (whiteMaskFromBlack) {
    const { isBgMask, width: maskWidth, height: maskHeight } = await computeMaskForPath({ inPath: inBlack, threshold });

    results.push(
      await processOneWithMask({
        inPath: inWhite,
        outPath: outWhite,
        isBgMask,
        maskWidth,
        maskHeight,
        featherAlpha,
        dryRun
      })
    );

    results.push(
      await processOneWithMask({
        inPath: inBlack,
        outPath: outBlack,
        isBgMask,
        maskWidth,
        maskHeight,
        featherAlpha,
        dryRun
      })
    );
  } else {
    results.push(
      await processOne({
        inPath: inWhite,
        outPath: outWhite,
        threshold,
        featherAlpha,
        dryRun
      })
    );

    results.push(
      await processOne({
        inPath: inBlack,
        outPath: outBlack,
        threshold,
        featherAlpha,
        dryRun
      })
    );
  }

  console.log(JSON.stringify({ baseDir, threshold, featherAlpha, dryRun, results }, null, 2));
}

main().catch((e) => {
  console.error(e?.message || String(e));
  process.exit(1);
});
