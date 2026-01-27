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

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function writeJson(p, obj) {
  fs.writeFileSync(p, `${JSON.stringify(obj, null, 2)}\n`, 'utf-8');
}

function mkdirp(p) {
  fs.mkdirSync(p, { recursive: true });
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

function listDirs(dir) {
  return fs
    .readdirSync(dir)
    .map((name) => ({ name, full: path.join(dir, name) }))
    .filter((it) => isDir(it.full) && !it.name.startsWith('.'));
}

function listImageFiles(dir) {
  const exts = new Set(['.png', '.webp', '.jpg', '.jpeg']);
  return fs
    .readdirSync(dir)
    .map((name) => ({ name, full: path.join(dir, name) }))
    .filter((it) => isFile(it.full) && exts.has(path.extname(it.name).toLowerCase()));
}

function normalizeToken(s) {
  return (s || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function slugFromFilename(filename) {
  const base = path.basename(filename, path.extname(filename));
  let s = base;
  // strip trailing -w / -b (white/black ink naming)
  s = s.replace(/-(w|b)$/i, '');
  // strip leading numbering like "7-the-phoenix"
  s = s.replace(/^\d+[-_ ]+/, '');
  return normalizeToken(s);
}

function findPlaceholderFilenameByColor(manifest, color) {
  const item = (manifest?.items || []).find((it) => (it?.color || '').toString() === color);
  return item?.filename || null;
}

async function generateOne({ drawingFile, bbox, placeholdersDir, manifest, colors, outDir, format, quality, dryRun }) {
  const outputs = [];

  const drawingBuffer = dryRun
    ? null
    : await sharp(drawingFile)
        .resize(bbox.w, bbox.h, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();

  for (const color of colors) {
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

    const outPath = path.join(outDir, `${color}.${format}`);

    if (dryRun) {
      outputs.push({ color, ok: true, outPath, placeholderPath });
      continue;
    }

    let img = sharp(placeholderPath).composite([{ input: drawingBuffer, left: bbox.x, top: bbox.y }]);
    if (format === 'webp') img = img.webp({ quality: Number.isFinite(quality) ? quality : 92 });
    else img = img.png();

    await img.toFile(outPath);
    outputs.push({ color, ok: true, outPath, placeholderPath });
  }

  return outputs;
}

async function main() {
  const args = process.argv.slice(2);

  const drawingsRoot = getArg(
    args,
    '--drawings-root',
    path.join(process.cwd(), 'public', 'custom_logos', 'drawings')
  );

  const profilesPath = getArg(
    args,
    '--profiles',
    path.join(process.cwd(), 'src', 'config', 'placement-profiles.json')
  );

  const placeholdersDir = getArg(
    args,
    '--placeholders-dir',
    path.join(process.cwd(), 'public', 'placeholders', 'apparel', 't-shirt', 'gildan_5000')
  );

  const colorsJsonPath = getArg(args, '--colors-json', path.join(placeholdersDir, 'colors.json'));
  const manifestJsonPath = getArg(args, '--manifest-json', path.join(placeholdersDir, 'manifest.json'));

  const outRoot = getArg(args, '--out-dir', path.join(process.cwd(), '.tmp', 'generated-mockups-batch'));
  const format = getArg(args, '--format', 'webp');
  const quality = Number(getArg(args, '--quality', '92'));

  const reportPath = getArg(args, '--report', null);
  const quiet = hasFlag(args, '--quiet');

  const onlyCollection = getArg(args, '--collection', null);
  const onlyDesign = getArg(args, '--design', null);
  const limit = Number(getArg(args, '--limit', '0'));
  const dryRun = hasFlag(args, '--dry-run');

  if (!fs.existsSync(drawingsRoot)) throw new Error(`Drawings root not found: ${drawingsRoot}`);
  if (!fs.existsSync(profilesPath)) throw new Error(`Profiles not found: ${profilesPath}`);

  const profilesDb = readJson(profilesPath);
  const profiles = profilesDb?.profiles || {};

  const colorsJson = readJson(colorsJsonPath);
  const manifest = readJson(manifestJsonPath);
  const selectedColors = (colorsJson?.selected || []).map((c) => c.toString());

  // Index drawings: collection -> design -> ink -> drawingFile
  const index = {};

  const collections = listDirs(drawingsRoot);
  for (const c of collections) {
    const collection = c.name;
    if (onlyCollection && collection !== onlyCollection) continue;

    // If this collection has ink subfolders (common: blanc/negre), use them. Otherwise, treat as a flat folder.
    const subdirs = listDirs(c.full);
    const imagesHere = listImageFiles(c.full);

    const inkFolders = subdirs.length ? subdirs : [{ name: null, full: c.full }];

    for (const inkFolder of inkFolders) {
      const ink = inkFolder.name; // can be null

      // only scan direct image files in ink folder (no recursion) to avoid mixing product types
      const files = listImageFiles(inkFolder.full);
      for (const f of files) {
        const designSlug = slugFromFilename(f.name);
        if (!designSlug) continue;
        if (onlyDesign && designSlug !== normalizeToken(onlyDesign)) continue;

        index[collection] ||= {};
        index[collection][designSlug] ||= {};

        const inkKey = ink || 'default';
        // keep first if duplicates
        if (!index[collection][designSlug][inkKey]) {
          index[collection][designSlug][inkKey] = f.full;
        }
      }

      // If collection root itself has images and also has subdirs, we ignore root images by default.
      // This prevents mixing top-level assets with ink folders.
      if (subdirs.length && imagesHere.length) {
        // no-op
      }
    }
  }

  const jobs = [];
  const missingProfiles = [];

  for (const [collection, designs] of Object.entries(index)) {
    for (const [designSlug, inks] of Object.entries(designs)) {
      const key = `${collection}/${designSlug}`;
      const profile = profiles[key];
      if (!profile?.bbox) {
        missingProfiles.push({ key, collection, design: designSlug, inks: Object.keys(inks) });
        continue;
      }

      for (const [ink, drawingFile] of Object.entries(inks)) {
        jobs.push({ collection, design: designSlug, ink, drawingFile, bbox: profile.bbox });
      }
    }
  }

  const limitedJobs = limit && Number.isFinite(limit) && limit > 0 ? jobs.slice(0, limit) : jobs;

  const results = [];
  for (const job of limitedJobs) {
    const outDir = path.join(outRoot, job.collection, job.design, job.ink);
    mkdirp(outDir);

    const outputs = await generateOne({
      drawingFile: job.drawingFile,
      bbox: job.bbox,
      placeholdersDir,
      manifest,
      colors: selectedColors,
      outDir,
      format,
      quality,
      dryRun
    });

    results.push({ ...job, outDir, outputs });
  }

  const payload = {
    drawingsRoot,
    profilesPath,
    outRoot,
    dryRun,
    format,
    quality,
    colorsCount: selectedColors.length,
    collectionsCount: Object.keys(index).length,
    designsCount: Object.values(index).reduce((a, d) => a + Object.keys(d).length, 0),
    jobsTotal: jobs.length,
    jobsRun: limitedJobs.length,
    missingProfilesCount: missingProfiles.length,
    missingProfiles,
    results
  };

  if (reportPath) {
    writeJson(reportPath, payload);
  }

  if (quiet && reportPath) {
    console.log(
      JSON.stringify(
        {
          reportPath,
          dryRun,
          jobsTotal: payload.jobsTotal,
          jobsRun: payload.jobsRun,
          missingProfilesCount: payload.missingProfilesCount
        },
        null,
        2
      )
    );
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

main().catch((e) => {
  console.error(e?.message || String(e));
  process.exit(1);
});
