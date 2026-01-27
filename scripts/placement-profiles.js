import fs from 'fs';
import path from 'path';

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

function must(v, label) {
  if (!v) throw new Error(`Missing required arg: ${label}`);
  return v;
}

function normKey(collection, design) {
  return `${(collection || '').toString().trim()}/${(design || '').toString().trim()}`;
}

function pickBbox(calibJson) {
  return calibJson?.bboxPaddedScaled || calibJson?.bboxScaled || calibJson?.bbox || null;
}

function validateBbox(b) {
  if (!b) return false;
  const keys = ['x', 'y', 'w', 'h'];
  for (const k of keys) {
    if (!Number.isFinite(Number(b[k]))) return false;
  }
  if (b.w <= 0 || b.h <= 0) return false;
  return true;
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = (args[0] || '').toString().trim();

  const profilesPath = getArg(
    args,
    '--profiles',
    path.join(process.cwd(), 'src', 'config', 'placement-profiles.json')
  );

  if (!fs.existsSync(profilesPath)) throw new Error(`Profiles file not found: ${profilesPath}`);
  const db = readJson(profilesPath);
  if (!db || typeof db !== 'object') throw new Error('Invalid profiles json');
  if (!db.profiles || typeof db.profiles !== 'object') db.profiles = {};

  if (cmd === 'list') {
    const keys = Object.keys(db.profiles).sort();
    console.log(JSON.stringify({ profilesPath, count: keys.length, keys }, null, 2));
    return;
  }

  if (cmd === 'get') {
    const key = must(getArg(args, '--key', null), '--key <collection/design>');
    const profile = db.profiles[key] || null;
    console.log(JSON.stringify({ profilesPath, key, profile }, null, 2));
    return;
  }

  if (cmd === 'upsert') {
    const collection = must(getArg(args, '--collection', null), '--collection <collection_slug>');
    const design = must(getArg(args, '--design', null), '--design <design_slug>');
    const key = normKey(collection, design);

    const fromJson = getArg(args, '--from-json', null);
    const bboxInlineRaw = getArg(args, '--bbox', null);

    let bbox = null;
    if (fromJson) {
      if (!fs.existsSync(fromJson)) throw new Error(`Calibration json not found: ${fromJson}`);
      const calib = readJson(fromJson);
      bbox = pickBbox(calib);
    } else if (bboxInlineRaw) {
      const parts = bboxInlineRaw.split(',').map((v) => Number(v.trim()));
      if (parts.length !== 4) throw new Error('--bbox must be "x,y,w,h"');
      bbox = { x: parts[0], y: parts[1], w: parts[2], h: parts[3] };
    } else {
      throw new Error('Provide either --from-json <calibration.json> or --bbox "x,y,w,h"');
    }

    if (!validateBbox(bbox)) throw new Error('Invalid bbox');

    db.profiles[key] = {
      ...(db.profiles[key] || {}),
      bbox: { x: Number(bbox.x), y: Number(bbox.y), w: Number(bbox.w), h: Number(bbox.h) }
    };

    const dryRun = hasFlag(args, '--dry-run');
    if (!dryRun) writeJson(profilesPath, db);

    console.log(JSON.stringify({ profilesPath, dryRun, action: 'upsert', key, profile: db.profiles[key] }, null, 2));
    return;
  }

  if (cmd === 'delete') {
    const key = must(getArg(args, '--key', null), '--key <collection/design>');
    const existed = Boolean(db.profiles[key]);
    const dryRun = hasFlag(args, '--dry-run');
    if (existed) delete db.profiles[key];
    if (!dryRun) writeJson(profilesPath, db);
    console.log(JSON.stringify({ profilesPath, dryRun, action: 'delete', key, existed }, null, 2));
    return;
  }

  throw new Error(
    [
      'Usage:',
      '  node scripts/placement-profiles.js list',
      '  node scripts/placement-profiles.js get --key <collection/design>',
      '  node scripts/placement-profiles.js upsert --collection <c> --design <d> --from-json <calib.json>',
      '  node scripts/placement-profiles.js upsert --collection <c> --design <d> --bbox "x,y,w,h"',
      '  node scripts/placement-profiles.js delete --key <collection/design>',
      '',
      'Optional:',
      '  --profiles <path>   (default: src/config/placement-profiles.json)',
      '  --dry-run'
    ].join('\n')
  );
}

main().catch((e) => {
  console.error(e?.message || String(e));
  process.exit(1);
});
