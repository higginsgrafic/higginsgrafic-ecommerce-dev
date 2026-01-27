#!/usr/bin/env node

import { spawnSync } from 'child_process';

function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: 'pipe', encoding: 'utf-8', ...opts });
  const out = (r.stdout || '').trimEnd();
  const err = (r.stderr || '').trimEnd();
  if (opts.allowFail) return { ...r, out, err };
  if (r.status !== 0) {
    const msg = [
      `Command failed: ${cmd} ${args.join(' ')}`,
      out ? `stdout:\n${out}` : '',
      err ? `stderr:\n${err}` : ''
    ]
      .filter(Boolean)
      .join('\n');
    throw new Error(msg);
  }
  return { ...r, out, err };
}

function nowToken() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

function slugify(s) {
  return (s || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-');
}

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

function usage(exitCode = 1) {
  const txt = [
    'Usage:',
    '  node scripts/task.js start --cat <categoria> --name <unitat> [--base main]',
    '  node scripts/task.js status',
    '  node scripts/task.js finish --msg <missatge> [--push]',
    '',
    'Notes:',
    '  - start: exigeix working tree net (sense canvis).',
    '  - finish: exigeix canvis staged (git add ...) i crea un commit.',
    '  - Categories suggerides: git, calibratge, mockups, ui, api, infra, assets'
  ].join('\n');
  process.stdout.write(`${txt}\n`);
  process.exit(exitCode);
}

function getStatus() {
  const porcelain = sh('git', ['status', '--porcelain=v1'], { allowFail: true }).out || '';
  const lines = porcelain
    .split('\n')
    .map((l) => l.trimEnd())
    .filter(Boolean);
  const staged = lines.filter((l) => /^[AMDRC]/.test(l)).length;
  const unstaged = lines.filter((l) => /^ [AMDRC]/.test(l)).length;
  const untracked = lines.filter((l) => /^\?\? /.test(l)).length;
  return { porcelain, lines, staged, unstaged, untracked };
}

function currentBranch() {
  return sh('git', ['rev-parse', '--abbrev-ref', 'HEAD']).out;
}

function classify(paths) {
  const buckets = {
    app: 0,
    scripts: 0,
    supabase: 0,
    public_assets: 0,
    config: 0,
    tests: 0,
    other: 0
  };

  for (const p of paths) {
    const s = String(p || '');
    if (s.startsWith('src/')) buckets.app++;
    else if (s.startsWith('scripts/')) buckets.scripts++;
    else if (s.startsWith('supabase/')) buckets.supabase++;
    else if (s.startsWith('public/')) buckets.public_assets++;
    else if (s.startsWith('.') || s.endsWith('.json') || s.endsWith('.md') || s.includes('config')) buckets.config++;
    else if (s.startsWith('tests/')) buckets.tests++;
    else buckets.other++;
  }

  return buckets;
}

function parsePathsFromPorcelain(porcelainLines) {
  const paths = [];
  for (const l of porcelainLines) {
    const m = l.match(/^(?:\?\? |.. )(.+)$/);
    if (!m) continue;
    paths.push(m[1]);
  }
  return paths;
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  if (!cmd) usage(1);

  if (cmd === 'status') {
    const branch = currentBranch();
    const st = getStatus();
    const paths = parsePathsFromPorcelain(st.lines);
    const buckets = classify(paths);

    const multiBucket = Object.entries(buckets).filter(([, n]) => n > 0).map(([k]) => k);

    const out = {
      branch,
      counts: { staged: st.staged, unstaged: st.unstaged, untracked: st.untracked, total: st.lines.length },
      buckets,
      warning: multiBucket.length > 2 ? `Mixed changes detected across: ${multiBucket.join(', ')}` : null
    };

    process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
    return;
  }

  if (cmd === 'start') {
    const cat = slugify(getArg(args, '--cat', ''));
    const name = slugify(getArg(args, '--name', ''));
    const base = getArg(args, '--base', 'main');
    if (!cat || !name) usage(1);

    const st = getStatus();
    if (st.lines.length) {
      throw new Error('Working tree not clean. Commit/stash/discard before starting a new unit. Run: node scripts/task.js status');
    }

    sh('git', ['fetch', '--all'], { allowFail: true });
    sh('git', ['checkout', base]);
    sh('git', ['pull', '--ff-only'], { allowFail: true });

    const branch = `task/${cat}/${name}-${nowToken()}`;
    sh('git', ['checkout', '-b', branch]);
    process.stdout.write(`${branch}\n`);
    return;
  }

  if (cmd === 'finish') {
    const msgRaw = (getArg(args, '--msg', '') || '').toString().trim();
    if (!msgRaw) usage(1);

    const branch = currentBranch();
    if (!branch.startsWith('task/')) {
      throw new Error(`Not on a task branch (expected task/*). Current: ${branch}`);
    }

    const st = getStatus();
    if (st.unstaged || st.untracked) {
      throw new Error('There are unstaged/untracked changes. Stage exactly what belongs to this unit, then retry.');
    }

    const cached = sh('git', ['diff', '--cached', '--name-only'], { allowFail: true }).out;
    const stagedPaths = cached.split('\n').map((s) => s.trim()).filter(Boolean);
    if (!stagedPaths.length) {
      throw new Error('No staged changes. Run git add <files> then retry.');
    }

    const cat = branch.split('/')[1] || 'task';
    const commitMsg = `${cat}: ${msgRaw}`;
    sh('git', ['commit', '-m', commitMsg]);

    if (hasFlag(args, '--push')) {
      sh('git', ['push', '-u', 'origin', branch], { allowFail: true });
    }

    process.stdout.write(`${commitMsg}\n`);
    return;
  }

  usage(1);
}

main().catch((e) => {
  process.stderr.write(`${e?.message || String(e)}\n`);
  process.exit(1);
});
