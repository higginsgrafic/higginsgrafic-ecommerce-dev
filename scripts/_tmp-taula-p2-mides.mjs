// TEMPORAL (28/09/2026): les mides de la TAULA VERTICAL de la p2 (i de la p1
// per referencia): les caselles i el contingut de cadascuna, per poder alinear
// la franja amb la graella.
// Us: node scripts/_tmp-taula-p2-mides.mjs <etiqueta>
import { chromium } from '@playwright/test';

const etiqueta = process.argv[2] || 'ara';

const MESURA = () => {
  const R = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return [Math.round(r.left * 10) / 10, Math.round(r.top * 10) / 10, Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10];
  };
  const out = {};
  for (const pag of [1, 2]) {
    const taula = document.querySelector(`[data-taula-vertical="${pag}"]`);
    if (!taula) { out[`p${pag}`] = '(sense taula)'; continue; }
    const d = { taula: R(taula), celles: {}, contingut: {} };
    taula.querySelectorAll('[data-taula-cela]').forEach((c) => {
      d.celles[c.getAttribute('data-taula-cela')] = R(c);
    });
    const franja = taula.querySelector(`[data-stripe-visual-content="${pag}"]`);
    d.contingut.franja = R(franja);
    d.contingut.franjaTransform = franja ? getComputedStyle(franja).transform.slice(0, 60) : null;
    // El primer fill de cada casella (el contingut de debò).
    taula.querySelectorAll('[data-taula-cela]').forEach((c) => {
      const f = c.firstElementChild;
      if (f) d.contingut[`filla de ${c.getAttribute('data-taula-cela')}`] = R(f);
    });
    out[`p${pag}`] = d;
  }
  return out;
};

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(10000);

const r = await p.evaluate(MESURA);
console.log(`\n===== ${etiqueta} (768x1024)   [esquerra, dalt, ample, alt]`);
for (const pag of ['p1', 'p2']) {
  const d = r[pag];
  console.log(`\n## ${pag}`);
  if (typeof d === 'string') { console.log('  ' + d); continue; }
  console.log(`  taula          ${JSON.stringify(d.taula)}`);
  for (const [k, v] of Object.entries(d.celles)) console.log(`  cela ${k.padEnd(14)} ${JSON.stringify(v)}`);
  for (const [k, v] of Object.entries(d.contingut)) console.log(`  ${k.padEnd(22)} ${JSON.stringify(v)}`);
}
console.log('\nerrors:', errors.length ? errors.join(' | ') : 'cap');
await b.close();
