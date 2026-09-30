// TEMPORAL: el mapa del clic (coordenades normalitzades -> casa) encaixa amb les
// caselles de debò? Us: node scripts/_tmp-mapa-clic.mjs
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

const r = await p.evaluate(() => {
  const c = document.querySelector('[data-taula-vertical="2"] [data-taula-cela="6-9+11-14"]');
  // L'overlay D'AQUEST panell: el que viu dins la casella de la franja.
  const overlay = c.querySelector('.clic-area-overlay') || [...document.querySelectorAll('.clic-area-overlay')].find((el) => el.getBoundingClientRect().width > 5);
  const ro = overlay.getBoundingClientRect();
  const tiles = [...c.querySelectorAll('[data-stripe-tile]')].map((t) => {
    const rr = t.getBoundingClientRect();
    const cx = rr.left + rr.width / 2; const cy = rr.top + rr.height / 2;
    const x = (cx - ro.left) / ro.width; const y = (cy - ro.top) / ro.height;
    const idxFormula = Math.min(13, Math.max(0, (y < 0.5 ? 0 : 7) + Math.min(6, Math.max(0, Math.floor(x * 7)))));
    return { idx: Number(t.getAttribute('data-stripe-tile')), coll: t.getAttribute('data-stripe-collection'), x: +x.toFixed(3), y: +y.toFixed(3), idxFormula };
  });
  return { overlay: { x: +ro.left.toFixed(1), y: +ro.top.toFixed(1), w: +ro.width.toFixed(1), h: +ro.height.toFixed(1) }, tiles };
});
console.log('overlay:', JSON.stringify(r.overlay));
console.log('casa | colleccio           | x,y normalitzats | casa que en surt | encerta?');
for (const t of r.tiles) {
  console.log(`  ${String(t.idx).padStart(2)} | ${String(t.coll).padEnd(18)} | ${String(t.x).padStart(6)},${String(t.y).padStart(6)} | ${String(t.idxFormula).padStart(16)} | ${t.idx === t.idxFormula ? 'si' : 'NO'}`);
}
await b.close();
