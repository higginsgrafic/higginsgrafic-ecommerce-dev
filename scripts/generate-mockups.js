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

function mkdirp(p) {
  fs.mkdirSync(p, { recursive: true });
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function must(v, label) {
  if (!v) throw new Error(`Missing required arg: ${label}`);
  return v;
}

function isDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function normalizeToken(s) {
  return (s || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-');
}

function listSubdirs(dir) {
  return fs
    .readdirSync(dir)
    .map((name) => ({ name, full: path.join(dir, name) }))
    .filter((it) => isDir(it.full));
}

function listImageFiles(dir) {
  const exts = new Set(['.png', '.webp', '.jpg', '.jpeg']);
  return fs
    .readdirSync(dir)
    .map((name) => ({ name, full: path.join(dir, name) }))
    .filter((it) => isFile(it.full) && exts.has(path.extname(it.name).toLowerCase()));
}

function findDrawingForInkFolder(inkFolderPath, designToken) {
  const token = normalizeToken(designToken);
  const files = listImageFiles(inkFolderPath);
  if (!files.length) return null;

  const exact = files.find((f) => normalizeToken(path.basename(f.name, path.extname(f.name))).includes(token));
  if (exact) return exact.full;

  // fallback: any file that contains token anywhere (including with numbers/prefix)
  const loose = files.find((f) => normalizeToken(f.name).includes(token));
  if (loose) return loose.full;

  return null;
}

function findPlaceholderFilenameByColor(manifest, color) {
  const item = (manifest?.items || []).find((it) => (it?.color || '').toString() === color);
  return item?.filename || null;
}

async function main() {
  const args = process.argv.slice(2);

  const collection = getArg(args, '--collection', null);
  const design = getArg(args, '--design', null);
  const ink = getArg(args, '--ink', null);
  const allInks = hasFlag(args, '--all-inks');

  const drawingPath = must(
    getArg(args, '--drawing', null),
    '--drawing <path-to-webp-or-png OR folder> (e.g. public/custom_logos/drawings/first_contact/blanc/7-the-phoenix-w.webp OR public/custom_logos/drawings/first_contact)'
  );

  const bboxJsonPath = must(
    getArg(args, '--bbox-json', null),
    '--bbox-json <path-to-json-with-bboxPaddedScaled> (e.g. .tmp/phoenix_best_padded.json)'
  );

  const placeholdersDir = getArg(
    args,
    '--placeholders-dir',
    path.join(process.cwd(), 'public', 'placeholders', 'apparel', 't-shirt', 'gildan_5000')
  );
  const colorsJsonPath = getArg(args, '--colors-json', path.join(placeholdersDir, 'colors.json'));
  const manifestJsonPath = getArg(args, '--manifest-json', path.join(placeholdersDir, 'manifest.json'));

  const outDir = getArg(args, '--out-dir', path.join(process.cwd(), '.tmp', 'generated-mockups'));
  const format = getArg(args, '--format', 'webp');
  const quality = Number(getArg(args, '--quality', '92'));
  const dryRun = hasFlag(args, '--dry-run');

  const colorsJson = readJson(colorsJsonPath);
  const manifest = readJson(manifestJsonPath);
  const selectedColors = (colorsJson?.selected || []).map((c) => c.toString());

  const bboxJson = readJson(bboxJsonPath);
  const bbox = bboxJson?.bboxPaddedScaled || bboxJson?.bboxScaled || null;
  if (!bbox) throw new Error('bbox not found in bbox json (expected bboxPaddedScaled or bboxScaled)');

  const meta = {
    collection,
    design,
    ink,
    drawingPath,
    bboxJsonPath,
    bbox,
    placeholdersDir,
    count: selectedColors.length,
    outDir,
    format,
    quality
  };

  const generateForDrawing = async ({ drawingFile, inkLabel }) => {
    const outBase = [outDir, collection, design, inkLabel].filter(Boolean).join(path.sep);
    mkdirp(outBase);

    const outputs = [];

    const drawingBuffer = dryRun
      ? null
      : await sharp(drawingFile)
          .resize(bbox.w, bbox.h, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .toBuffer();

    for (const color of selectedColors) {
      const filename = findPlaceholderFilenameByColor(manifest, color);
      if (!filename) {
        outputs.push({ color, ok: false, error: 'placeholder not found in manifest' });
        continue;
      }

      const placeholderPath = path.join(placeholdersDir, filename);
      if (!fs.existsSync(placeholderPath)) {
        outputs.push({ color, ok: false, error: `missing placeholder file: ${placeholderPath}` });
        continue;
      }

      const outPath = path.join(outBase, `${color}.${format}`);

      if (dryRun) {
        outputs.push({ color, ok: true, outPath, placeholderPath, drawingFile });
        continue;
      }

      let img = sharp(placeholderPath).composite([{ input: drawingBuffer, left: bbox.x, top: bbox.y }]);

      if (format === 'webp') img = img.webp({ quality: Number.isFinite(quality) ? quality : 92 });
      else img = img.png();

      await img.toFile(outPath);
      outputs.push({ color, ok: true, outPath, placeholderPath, drawingFile });
    }

    return { ink: inkLabel, drawingFile, outputs };
  };

  if (!allInks) {
    if (!ink) throw new Error('Missing --ink (or pass --all-inks to scan drawing folder)');
    if (!isFile(drawingPath)) throw new Error(`--drawing must be a file unless --all-inks is used: ${drawingPath}`);
    const r = await generateForDrawing({ drawingFile: drawingPath, inkLabel: ink });
    console.log(JSON.stringify({ ...meta, mode: 'single-ink', result: r }, null, 2));
    return;
  }

  if (!design) throw new Error('Missing --design (required for --all-inks matching)');
  if (!isDir(drawingPath)) throw new Error(`--drawing must be a directory when using --all-inks: ${drawingPath}`);

  const inkFolders = listSubdirs(drawingPath);
  if (!inkFolders.length) throw new Error(`No ink subfolders found in: ${drawingPath}`);

  const results = [];
  for (const f of inkFolders) {
    const drawingFile = findDrawingForInkFolder(f.full, design);
    if (!drawingFile) {
      results.push({ ink: f.name, ok: false, error: `No drawing found matching design '${design}'` });
      continue;
    }
    const r = await generateForDrawing({ drawingFile, inkLabel: f.name });
    results.push({ ink: f.name, ok: true, ...r });
  }

  console.log(JSON.stringify({ ...meta, mode: 'all-inks', drawingDir: drawingPath, results }, null, 2));
}

main().catch((e) => {
  console.error(e?.message || String(e));
  process.exit(1);
});
