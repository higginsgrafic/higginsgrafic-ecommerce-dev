// TEMPORAL (28/09/2026): LES IMPRESSIONS DE LA STRIPE HORITZONTAL.
//
// En Marc: «Compte que mous els dibuixos de la stripe horitzontal». Aquest guio
// mesura cada impressio de la franja horitzontal (p1 i p2) a 1920x946, amb els
// canvis d'ara i sense (`git stash`), per veure si s'han mogut i quant.
//
// Us: node scripts/_tmp-horitzontal-dibuixos.mjs
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', stdio: 'pipe' });
const abans = git('status', '--porcelain').split('\n').filter((l) => l && !l.startsWith('??'));

const MESURA = () => {
  const out = {};
  for (const [etq, sel] of [['p1', '[data-stripe-visual-content="1"]'], ['p2', '[data-stripe-visual-content="2"]']]) {
    const arrel = document.querySelector(sel);
    if (!arrel) { out[etq] = null; continue; }
    const llista = [];
    for (const img of arrel.querySelectorAll('img')) {
      const src = (img.getAttribute('src') || '').split('/').pop();
      if (!src) continue;
      const r = img.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      const t = getComputedStyle(img).transform;
      const m = t.match(/matrix\(([^)]+)\)/);
      const esc = m ? Number(m[1].split(',')[0]).toFixed(3) : 'none';
      llista.push({ q: src, x: Math.round(r.left * 10) / 10, y: Math.round(r.top * 10) / 10, w: Math.round(r.width), h: Math.round(r.height), esc });
    }
    llista.sort((a, b) => a.q.localeCompare(b.q));
    out[etq] = llista;
  }
  return out;
};

const b = await chromium.launch();
const [W, H] = (process.argv[2] || '1920x946').split('x').map(Number);
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const resultats = {};
async function mesura(etq) {
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact&stripeVariant=color', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(6000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(11000);
  resultats[etq] = await p.evaluate(MESURA);
  await p.close();
  const n = (resultats[etq].p1 || []).length + (resultats[etq].p2 || []).length;
  console.log(`  ${etq}: ${n} impressions`);
}
try {
  await mesura('amb els meus canvis');
  if (abans.length) { git('stash', 'push', '-m', 'dsh-horitzontal'); console.log(`  (desats ${abans.length} fitxers)`); }
  await mesura('sense els meus canvis');
} finally {
  if (abans.length) { git('stash', 'pop'); console.log('  (feina tornada a posar)'); }
  await ctx.close();
  await b.close();
}

const A = resultats['amb els meus canvis']; const B = resultats['sense els meus canvis'];
for (const q of ['p1', 'p2']) {
  const ma = Object.fromEntries((A[q] || []).map((v) => [v.q, v]));
  const mb = Object.fromEntries((B[q] || []).map((v) => [v.q, v]));
  const noms = [...new Set([...Object.keys(ma), ...Object.keys(mb)])].sort();
  let moguts = 0;
  const files = [];
  for (const n of noms) {
    const a = ma[n]; const c = mb[n];
    if (!a || !c) { files.push(`  ${n.padEnd(38)} ${a ? 'nomes amb canvis' : 'nomes sense canvis'}`); moguts += 1; continue; }
    const d = [c.x - a.x, c.y - a.y, c.w - a.w, c.h - a.h];
    const igual = d.every((v) => Math.abs(v) < 0.6);
    if (!igual) moguts += 1;
    files.push(`  ${n.padEnd(38)} ${`${a.w}x${a.h} @${a.x},${a.y} esc ${a.esc}`.padEnd(34)} ${`${c.w}x${c.h} @${c.x},${c.y} esc ${c.esc}`.padEnd(34)} ${igual ? 'igual' : 'MOGUT ' + JSON.stringify(d)}`);
  }
  console.log(`\n===== ${q} (${moguts} de ${noms.length} moguts) =====`);
  console.log(files.join('\n'));
}
console.log('\n-- arbre --');
console.log(git('status', '--short').split('\n').filter((l) => l && !l.startsWith('??')).join('\n'));
