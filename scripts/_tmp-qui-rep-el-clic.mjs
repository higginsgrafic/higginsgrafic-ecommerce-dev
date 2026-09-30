// TEMPORAL: al centre de cada casella, qui rep el clic? I a quin camí pertany?
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
  const overlay = c.querySelector('.clic-area-overlay');
  const paths = [...overlay.querySelectorAll('path')];
  const out = [];
  for (const t of c.querySelectorAll('[data-stripe-tile]')) {
    const rr = t.getBoundingClientRect();
    const cx = rr.left + rr.width / 2; const cy = rr.top + rr.height / 2;
    const el = document.elementFromPoint(cx, cy);
    const cami = el && el.closest ? el.closest('path') : null;
    out.push({
      idx: Number(t.getAttribute('data-stripe-tile')),
      quiRep: el ? `${el.tagName}${el.getAttribute('class') ? '.' + el.getAttribute('class') : ''}` : 'res',
      esCami: !!cami,
      indexCami: cami ? paths.indexOf(cami) : -1,
      coll: t.getAttribute('data-stripe-collection'),
    });
  }
  return out;
});
console.log('casa | qui rep el clic al centre        | es cami | index del cami | encerta?');
for (const t of r) {
  console.log(`  ${String(t.idx).padStart(2)} | ${String(t.quiRep).slice(0, 32).padEnd(32)} | ${String(t.esCami).padEnd(7)} | ${String(t.indexCami).padStart(14)} | ${t.indexCami === t.idx ? 'si' : 'NO'}`);
}
await b.close();
