// TEMPORAL (28/09/2026): ENREGISTRA les impressions de la franja, a les mides
// que importen, per poder comprovar que una refactoritzacio no en mou cap.
//
// Us: node scripts/_tmp-franja-enregistra.mjs abans
//     node scripts/_tmp-franja-enregistra.mjs despres
// Desa `_tmp-franja-<nom>.json`.
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';

const nom = process.argv[2] || 'estat';
const MIDES = [[1920, 946, 'escriptori'], [1024, 768, 'tauleta-apaissada'], [768, 1024, 'tauleta-vertical']];

const MESURA = () => {
  const extreu = (el) => {
    const fons = getComputedStyle(el).backgroundImage;
    const u = fons && fons !== 'none' ? (fons.match(/url\(["']?([^"')]+)["']?\)/) || [])[1] : '';
    return el.getAttribute('src') || el.getAttribute('href') || u || '';
  };
  const escalaDe = (t) => {
    const m = t && t.match(/matrix\(([^)]+)\)/);
    if (m) return Number(m[1].split(',')[0]).toFixed(4);
    const m3 = t && t.match(/matrix3d\(([^)]+)\)/);
    if (m3) return Number(m3[1].split(',')[0]).toFixed(4);
    return 'none';
  };
  const out = {};
  for (const [etq, sel] of [['p1', '[data-stripe-visual-content="1"]'], ['p2', '[data-stripe-visual-content="2"]']]) {
    const arrel = document.querySelector(sel);
    const llista = {};
    if (arrel) {
      [...arrel.querySelectorAll('*')].forEach((el, i) => {
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;
        const src = extreu(el).split('/').pop();
        if (!src) return;
        const clau = `${el.tagName.toLowerCase()}|${src.slice(0, 40)}|${i}`;
        llista[clau] = {
          x: Math.round(r.left * 10) / 10, y: Math.round(r.top * 10) / 10,
          w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10,
          esc: escalaDe(getComputedStyle(el).transform),
        };
      });
    }
    out[etq] = llista;
  }
  // Tambe les peces de la taula vertical, si hi son.
  for (const pag of [1, 2]) {
    const taula = document.querySelector(`[data-taula-vertical="${pag}"]`);
    if (!taula) continue;
    const llista = {};
    [...taula.querySelectorAll('*')].forEach((el, i) => {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      const cel = el.getAttribute('data-taula-cela') || '';
      const src = extreu(el).split('/').pop().slice(0, 30);
      const clau = `T${pag}|${el.tagName.toLowerCase()}|${cel}|${src}|${i}`;
      llista[clau] = { x: Math.round(r.left * 10) / 10, y: Math.round(r.top * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 };
    });
    out[`taula${pag}`] = llista;
  }
  return out;
};

const b = await chromium.launch();
const resultat = {};
for (const [W, H, etq] of MIDES) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact&stripeVariant=color', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(6000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(11000);
  resultat[etq] = await p.evaluate(MESURA);
  resultat[etq].errors = errors;
  const n = Object.keys(resultat[etq].p1 || {}).length + Object.keys(resultat[etq].p2 || {}).length;
  console.log(`  ${etq.padEnd(18)} ${W}x${H}  ${n} elements   errors: ${errors.length ? errors.join(' | ') : 'cap'}`);
  await ctx.close();
}
writeFileSync(`_tmp-franja-${nom}.json`, JSON.stringify(resultat, null, 1));
console.log(`desat _tmp-franja-${nom}.json`);
await b.close();
