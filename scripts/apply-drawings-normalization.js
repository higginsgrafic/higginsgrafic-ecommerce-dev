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

function removeEmptyDirsUpwards(startDir, stopDir) {
  let dir = startDir;
  const stop = path.resolve(stopDir);
  while (dir && path.resolve(dir).startsWith(stop)) {
    if (!isDir(dir)) break;
    // Consider ALL entries, including hidden files like .DS_Store.
    // Only remove when the directory is truly empty.
    const entries = fs.readdirSync(dir);
    if (entries.length > 0) break;
    try {
      fs.rmdirSync(dir);
    } catch {
      // If the directory isn't empty or can't be removed, stop climbing.
      break;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
}

function safeRel(p, root) {
  const rp = path.relative(root, p);
  return rp.startsWith('..') ? p : rp;
}

async function main() {
  const args = process.argv.slice(2);

  const planPath = getArg(args, '--plan', path.join(process.cwd(), '.tmp', 'drawings-normalization-plan.json'));
  const dryRun = hasFlag(args, '--dry-run');
  const cleanupEmptyDirs = !hasFlag(args, '--no-cleanup');

  if (!fs.existsSync(planPath)) throw new Error(`Plan not found: ${planPath}`);

  const plan = readJson(planPath);
  const drawingsRoot = plan.drawingsRoot || 'public/custom_logos/drawings';

  const deletes = Array.isArray(plan.delete) ? plan.delete : [];
  const renames = Array.isArray(plan.rename) ? plan.rename : [];

  const actions = { deletes: [], renames: [], warnings: [] };

  // Deletes
  for (const d of deletes) {
    const from = d?.from;
    if (!from) continue;
    if (!fs.existsSync(from)) {
      actions.warnings.push({ type: 'delete_missing', from: safeRel(from, drawingsRoot) });
      continue;
    }
    if (dryRun) {
      actions.deletes.push({ from: safeRel(from, drawingsRoot), ok: true, dryRun: true });
      continue;
    }
    const parent = path.dirname(from);
    fs.rmSync(from, { force: true });
    actions.deletes.push({ from: safeRel(from, drawingsRoot), ok: true });
    if (cleanupEmptyDirs) removeEmptyDirsUpwards(parent, drawingsRoot);
  }

  // Renames
  for (const r of renames) {
    const from = r?.from;
    const to = r?.to;
    if (!from || !to) continue;

    if (!fs.existsSync(from)) {
      actions.warnings.push({ type: 'rename_missing', from: safeRel(from, drawingsRoot), to: safeRel(to, drawingsRoot) });
      continue;
    }

    if (fs.existsSync(to)) {
      // If already applied, allow no-op when content exists.
      actions.warnings.push({ type: 'rename_target_exists', from: safeRel(from, drawingsRoot), to: safeRel(to, drawingsRoot) });
      continue;
    }

    if (dryRun) {
      actions.renames.push({ from: safeRel(from, drawingsRoot), to: safeRel(to, drawingsRoot), ok: true, dryRun: true });
      continue;
    }

    mkdirp(path.dirname(to));
    fs.renameSync(from, to);
    actions.renames.push({ from: safeRel(from, drawingsRoot), to: safeRel(to, drawingsRoot), ok: true });

    if (cleanupEmptyDirs) removeEmptyDirsUpwards(path.dirname(from), drawingsRoot);
  }

  const summary = {
    planPath,
    drawingsRoot,
    dryRun,
    cleanupEmptyDirs,
    deleted: actions.deletes.length,
    renamed: actions.renames.length,
    warnings: actions.warnings.length
  };

  console.log(JSON.stringify({ summary, ...actions }, null, 2));
}

main().catch((e) => {
  console.error(e?.message || String(e));
  process.exit(1);
});
