// TEMPORAL (28/09/2026): QUINES MIDES han canviat a la vista vertical.
//
// Renderitza la vertical (768x1024) el 23/09 (la referencia bona, `e479d2fa`) i
// ara, i compara les MIDES de cada peça de la taula. Serveix per saber que s'ha
// mogut exactament, en comptes de mirar 3.485 linies de diff.
//
// Canvia `src/` temporalment; al final el restaura de HEAD. La feina sense
// cometre es desa a `.git/` i es torna a posar.
//
// Us: node scripts/_tmp-vertical-mides.mjs
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { writeFileSync, copyFileSync, existsSync } from 'node:fs';

const COMMITS = [['e479d2fa', '23/09 23:48 (referencia)'], ['HEAD', 'ara']];
const git = (...a) => execFileSync('git', a, { stdio: 'pipe' });

// Còpies de la feina sense cometre.
for (const [src, dst] of [['src/components/home/MarcInici.jsx', '.git/dsh-bk-a'], ['public/browser-overlay.html', '.git/dsh-bk-b']]) {
  if (existsSync(src)) copyFileSync(src, dst);
}

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const resultats = {};

const R = (el) => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`;
};

const mesura = () => p.evaluate(() => {
  const R = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
  };
  const out = {};
  for (const pag of [1, 2]) {
    const taula = document.querySelector(`[data-taula-vertical="${pag}"]`);
    out[`p${pag} taula`] = R(taula);
    if (!taula) continue;
    for (const c of taula.querySelectorAll('[data-taula-cela]')) {
      const nom = c.getAttribute('data-taula-cela');
      const fill = c.firstElementChild;
      out[`p${pag} cela ${nom}`] = R(c);
      if (fill) out[`p${pag} cela ${nom} fill`] = R(fill);
    }
  }
  // Les peces de debò, per nom.
  out['p1 graella dibuixos'] = R(document.querySelector('[data-megaslide-taula="1"] [data-cercador-dibuixos], [data-megaslide-taula="1"] .grid-cols-9, [data-megaslide-taula="1"] [data-graella-dibuixos]'));
  out['p1 franja'] = R(document.querySelector('[data-megaslide-taula="1"] [data-stripe-visual-content="1"]'));
  out['p2 franja'] = R(document.querySelector('[data-megaslide-taula="2"] [data-stripe-visual-content], [data-megaslide-taula="2"] [data-stripe-visual-content="2"]'));
  return out;
});

let p;
try {
  for (const [c, quan] of COMMITS) {
    git('checkout', c, '--', 'src');
    p = await ctx.newPage();
    let d = null;
    for (let intent = 0; intent < 2 && !d; intent += 1) {
      await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
      await p.waitForTimeout(5000);
      await p.click('button:has(svg.lucide-search)').catch(() => {});
      await p.waitForTimeout(9000);
      const te = await p.evaluate(() => !!document.querySelector('[data-taula-vertical="1"]'));
      if (!te && intent === 0) { await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(9000); }
      d = await mesura();
      if (!d['p1 taula']) d = null;
    }
    resultats[quan] = d || { error: 'no s\'ha pogut mesurar' };
    await p.close();
  }
} finally {
  git('checkout', 'HEAD', '--', 'src');
  git('reset', '--hard', 'HEAD');
  if (existsSync('.git/dsh-bk-a')) copyFileSync('.git/dsh-bk-a', 'src/components/home/MarcInici.jsx');
  if (existsSync('.git/dsh-bk-b')) copyFileSync('.git/dsh-bk-b', 'public/browser-overlay.html');
  for (const f of ['.git/dsh-bk-a', '.git/dsh-bk-b']) { try { execFileSync('rm', ['-f', f]); } catch { /* ignore */ } }
  await ctx.close();
  await b.close();
}

// Comparacio
const [a, b2] = Object.keys(resultats);
console.log(`\n${'peça'.padEnd(34)} ${'23/09'.padEnd(22)} ${'ara'.padEnd(22)} diferencia`);
const claus = new Set([...Object.keys(resultats[a] || {}), ...Object.keys(resultats[b2] || {})]);
for (const k of claus) {
  const x = resultats[a]?.[k];
  const y = resultats[b2]?.[k];
  const f = (v) => (v && typeof v === 'object' ? `${v.x},${v.y} ${v.w}x${v.h}` : String(v));
  const dif = (x && y && typeof x === 'object' && typeof y === 'object')
    ? [y.x - x.x, y.y - x.y, y.w - x.w, y.h - x.h].join(' / ')
    : '';
  const marca = dif && dif !== '0 / 0 / 0 / 0' ? '  <-- CANVIA' : '';
  console.log(`${k.padEnd(34)} ${f(x).padEnd(22)} ${f(y).padEnd(22)} ${dif}${marca}`);
}
writeFileSync('_tmp-vertical-mides.json', JSON.stringify(resultats, null, 1));
console.log('\ndesat _tmp-vertical-mides.json');
console.log('\n--- arbre ---');
console.log(execFileSync('git', ['status', '--short'], { encoding: 'utf8' }).split('\n').filter((l) => !l.startsWith('??')).join('\n'));
