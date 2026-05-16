#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Build site-map JSON
 * -------------------
 * Parses src/App.jsx to map each route to its source file, then walks each
 * page's import graph (limited depth, only src/) to find all owned files
 * and extracts cross-page navigation links from them (`to=`, `href=`,
 * `navigate(...)`). Combines this with the pages manifest and the existing
 * snapshot index (if any) to emit `public/site-map.json`.
 *
 * Usage:
 *   node scripts/build-site-map.mjs
 *   node scripts/build-site-map.mjs --out=public/site-map.json --snapshots=public/contact-sheet/index.json
 */

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync, statSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC = resolve(ROOT, 'src');
const APP_FILE = resolve(SRC, 'App.jsx');
const MANIFEST_URL = pathToFileURL(resolve(SRC, 'dev/pagesManifest.js')).href;

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .map((a) => a.replace(/^--/, '').split('='))
    .map(([k, v]) => [k, v ?? true])
);

const OUT_FILE = resolve(ROOT, String(args.out || 'public/site-map.json'));
const SNAPSHOTS_FILE = resolve(ROOT, String(args.snapshots || 'public/contact-sheet/index.json'));
const MAX_DEPTH = Number(args.depth || 4);

// ---------- helpers ------------------------------------------------------

const tryStat = (p) => {
  try {
    return statSync(p);
  } catch {
    return null;
  }
};

const resolveSpec = (spec, fromFile) => {
  let base;
  if (spec.startsWith('@/')) base = resolve(SRC, spec.slice(2));
  else if (spec.startsWith('./') || spec.startsWith('../')) base = resolve(dirname(fromFile), spec);
  else return null; // 3rd-party
  const candidates = [
    base,
    `${base}.jsx`,
    `${base}.js`,
    `${base}.tsx`,
    `${base}.ts`,
    resolve(base, 'index.jsx'),
    resolve(base, 'index.js'),
    resolve(base, 'index.tsx'),
    resolve(base, 'index.ts'),
  ];
  for (const c of candidates) {
    const s = tryStat(c);
    if (s && s.isFile()) return c;
  }
  return null;
};

// Read App.jsx and extract:
//   - lazy import map: ComponentName -> source file
//   - import map: ComponentName -> source file
function buildComponentToFile(appText) {
  const map = {};
  // const X = lazy(() => import('...'))  ← these are the route page components
  for (const m of appText.matchAll(/const\s+(\w+)\s*=\s*lazy\(\s*\(\s*\)\s*=>\s*import\(\s*['"]([^'"]+)['"]\s*\)\s*\)/g)) {
    const f = resolveSpec(m[2], APP_FILE);
    if (f) map[m[1]] = { file: f, lazy: true };
  }
  // import X from '...'  ← any other top-level imports
  for (const m of appText.matchAll(/^import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/gm)) {
    if (!map[m[1]]) {
      const f = resolveSpec(m[2], APP_FILE);
      if (f) map[m[1]] = { file: f, lazy: false };
    }
  }
  return map;
}

// Parse Route declarations with proper nesting handling.
function parseRoutes(text) {
  // Walk through every <Route or </Route> token, building open/close events.
  const tags = [];
  const re = /<\/?Route(?=[\s>])/g;
  let m;
  while ((m = re.exec(text))) {
    const isClose = text[m.index + 1] === '/';
    if (isClose) {
      const end = m.index + '</Route>'.length;
      tags.push({ kind: 'close', start: m.index, end });
      re.lastIndex = end;
      continue;
    }
    // Open tag: scan attributes until matching > or /> at brace depth 0.
    let j = m.index + '<Route'.length;
    let depth = 0;
    let selfClose = false;
    let inStr = null;
    while (j < text.length) {
      const c = text[j];
      if (inStr) {
        if (c === inStr && text[j - 1] !== '\\') inStr = null;
        j += 1;
        continue;
      }
      if (c === '"' || c === "'") {
        inStr = c;
        j += 1;
        continue;
      }
      if (c === '{') {
        depth += 1;
      } else if (c === '}') {
        depth -= 1;
      } else if (depth === 0 && c === '/' && text[j + 1] === '>') {
        selfClose = true;
        j += 2;
        break;
      } else if (depth === 0 && c === '>') {
        j += 1;
        break;
      }
      j += 1;
    }
    const tagText = text.slice(m.index, j);
    const pathMatch = tagText.match(/\bpath\s*=\s*"([^"]*)"/);
    const isIndex = /\bindex(\s|=|\/|>)/.test(tagText);
    const components = [];
    const elemIdx = tagText.indexOf('element=');
    if (elemIdx >= 0) {
      const sub = tagText.slice(elemIdx);
      for (const cm of sub.matchAll(/<([A-Z]\w+)/g)) components.push(cm[1]);
    }
    tags.push({
      kind: 'open',
      start: m.index,
      end: j,
      selfClose,
      path: pathMatch ? pathMatch[1] : null,
      isIndex,
      components,
    });
    re.lastIndex = j;
  }

  // Walk tags with a stack to assemble full paths.
  const stack = [];
  const routes = [];
  for (const t of tags) {
    if (t.kind === 'open') {
      const parentPrefix = stack.length ? stack[stack.length - 1].prefix : '';
      let fullPath = null;
      if (t.isIndex) {
        fullPath = parentPrefix || '/';
      } else if (t.path != null) {
        if (t.path.startsWith('/')) fullPath = t.path;
        else fullPath = (parentPrefix === '/' ? '' : parentPrefix) + '/' + t.path;
      }
      if (fullPath) routes.push({ path: fullPath, components: t.components, hasChildren: !t.selfClose });
      if (!t.selfClose) {
        stack.push({ prefix: fullPath || parentPrefix });
      }
    } else {
      stack.pop();
    }
  }
  return routes;
}

// BFS the import graph from a root file. Returns Set<absoluteFile>.
async function collectOwnedFiles(root) {
  if (!root) return new Set();
  const visited = new Set();
  const queue = [{ file: root, depth: 0 }];
  while (queue.length) {
    const { file, depth } = queue.shift();
    if (visited.has(file)) continue;
    visited.add(file);
    if (depth >= MAX_DEPTH) continue;
    let src;
    try {
      src = await readFile(file, 'utf8');
    } catch {
      continue;
    }
    // import ... from '...'
    for (const m of src.matchAll(/import[^'"`;]*?from\s*['"]([^'"]+)['"]/g)) {
      const r = resolveSpec(m[1], file);
      if (r && r.startsWith(SRC)) queue.push({ file: r, depth: depth + 1 });
    }
    // import('...')
    for (const m of src.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
      const r = resolveSpec(m[1], file);
      if (r && r.startsWith(SRC)) queue.push({ file: r, depth: depth + 1 });
    }
  }
  return visited;
}

// Scan file text for navigation links.
function findLinks(src) {
  const links = new Set();
  // to="/X" or to={'X'}
  for (const m of src.matchAll(/\bto\s*=\s*["'`]([^"'`?#]+)["'`]/g)) links.add(`to:${m[1]}`);
  for (const m of src.matchAll(/\bto\s*=\s*\{\s*["'`]([^"'`?#]+)["'`]\s*\}/g)) links.add(`to:${m[1]}`);
  // href="/X" (only absolute paths starting with /)
  for (const m of src.matchAll(/\bhref\s*=\s*["'`](\/[^"'`?#]*)["'`]/g)) links.add(`href:${m[1]}`);
  // navigate('/X')
  for (const m of src.matchAll(/\bnavigate\s*\(\s*["'`]([^"'`?#]+)["'`]/g)) links.add(`navigate:${m[1]}`);
  // window.location = '/X' / location.href = '/X' / window.location.href = '/X'
  for (const m of src.matchAll(/\blocation(?:\.href)?\s*=\s*["'`](\/[^"'`?#]*)["'`]/g)) links.add(`location:${m[1]}`);
  // Array form (rare): to: '/X' inside config objects
  for (const m of src.matchAll(/(?:path|to|href)\s*:\s*["'`](\/[^"'`?#]*)["'`]/g)) links.add(`field:${m[1]}`);
  return links;
}

function parentOf(p) {
  if (!p || p === '/' || p === '') return null;
  const parts = p.split('/').filter(Boolean);
  if (parts.length === 1) return '/';
  return '/' + parts.slice(0, -1).join('/');
}

// ---------- main ---------------------------------------------------------

async function main() {
  console.log(`▸ Reading manifest`);
  const { PAGES_MANIFEST } = await import(MANIFEST_URL);

  console.log(`▸ Parsing routes from src/App.jsx`);
  const appText = await readFile(APP_FILE, 'utf8');
  const compToFile = buildComponentToFile(appText);
  const routes = parseRoutes(appText);
  const routeToFile = {};       // primary "page" file per route
  const layoutFilesByRoute = {}; // layout/wrapper files per route (for nested children)
  for (const r of routes) {
    // Pick page file: prefer a lazy-imported component.
    let picked = null;
    for (const c of r.components) {
      const info = compToFile[c];
      if (info && info.lazy) {
        picked = c;
        break;
      }
    }
    if (!picked) {
      for (const c of r.components) {
        if (compToFile[c]) {
          picked = c;
          break;
        }
      }
    }
    if (picked && compToFile[picked]) routeToFile[r.path] = compToFile[picked].file;

    // If this route has children, every named component on it counts as a
    // layout wrapper for descendants.
    if (r.hasChildren) {
      const list = layoutFilesByRoute[r.path] || (layoutFilesByRoute[r.path] = []);
      for (const c of r.components) {
        const info = compToFile[c];
        if (info && !list.includes(info.file)) list.push(info.file);
      }
    }
  }

  // Load snapshots index if available.
  let snapshots = {};
  if (existsSync(SNAPSHOTS_FILE)) {
    try {
      const json = JSON.parse(readFileSync(SNAPSHOTS_FILE, 'utf8'));
      snapshots = json.pages || {};
      console.log(`▸ Loaded ${Object.keys(snapshots).length} snapshots from ${SNAPSHOTS_FILE.replace(ROOT + '/', '')}`);
    } catch (err) {
      console.warn(`⚠︎ Could not parse snapshots file: ${err.message}`);
    }
  } else {
    console.log(`▸ No snapshots index at ${SNAPSHOTS_FILE.replace(ROOT + '/', '')} (continuing without)`);
  }

  console.log(`▸ Building nodes (${PAGES_MANIFEST.length})`);
  const manifestPaths = new Set(PAGES_MANIFEST.map((p) => p.path));
  const nodes = [];
  const sourceFiles = new Map(); // path -> file
  for (const p of PAGES_MANIFEST) {
    const sourceFile = routeToFile[p.path] || null;
    sourceFiles.set(p.path, sourceFile);
    nodes.push({
      path: p.path,
      label: p.label,
      group: p.group,
      tag: p.tag,
      parent: parentOf(p.path),
      snapshot: snapshots[p.path] || null,
      sourceFile: sourceFile ? sourceFile.replace(ROOT + '/', '') : null,
    });
  }

  console.log(`▸ Walking import graphs (max depth ${MAX_DEPTH}) and extracting links`);
  const edges = [];
  const seen = new Set(); // "from→to:kind" to avoid duplicates
  let countLinks = 0;
  for (const p of PAGES_MANIFEST) {
    // Roots: the page's own source file PLUS any ancestor route's source file
    // (so nested admin pages inherit links from the shared AdminStudioLayout).
    const roots = [];
    const ownFile = sourceFiles.get(p.path);
    if (ownFile) roots.push(ownFile);
    let parent = parentOf(p.path);
    while (parent) {
      const layouts = layoutFilesByRoute[parent] || [];
      for (const f of layouts) {
        if (!roots.includes(f)) roots.push(f);
      }
      const pf = routeToFile[parent];
      if (pf && !roots.includes(pf)) roots.push(pf);
      parent = parentOf(parent);
    }
    if (roots.length === 0) continue;
    const owned = new Set();
    for (const r of roots) {
      const part = await collectOwnedFiles(r);
      for (const f of part) owned.add(f);
    }
    const aggregated = new Set();
    for (const f of owned) {
      let src;
      try {
        src = await readFile(f, 'utf8');
      } catch {
        continue;
      }
      for (const link of findLinks(src)) aggregated.add(link);
    }
    countLinks += aggregated.size;
    for (const entry of aggregated) {
      const [kind, target] = entry.split(':');
      if (!target.startsWith('/')) continue;
      // Match exact manifest path or first-segment redirect
      if (target === p.path) continue;
      if (manifestPaths.has(target)) {
        const key = `${p.path}→${target}:${kind}`;
        if (seen.has(key)) continue;
        seen.add(key);
        edges.push({ from: p.path, to: target, kind });
      }
    }
  }

  console.log(`▸ ${edges.length} edges from ${countLinks} raw link occurrences`);

  const payload = {
    generatedAt: new Date().toISOString(),
    snapshotsFrom: existsSync(SNAPSHOTS_FILE) ? SNAPSHOTS_FILE.replace(ROOT + '/', '') : null,
    nodes,
    edges,
  };

  await writeFile(OUT_FILE, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`✓ Wrote ${OUT_FILE.replace(ROOT + '/', '')} (${nodes.length} nodes, ${edges.length} edges)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
