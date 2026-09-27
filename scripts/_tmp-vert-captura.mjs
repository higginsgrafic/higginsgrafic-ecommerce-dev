// TEMPORAL — captura la franja de la vista VERTICAL (taula) amb el color triat.
import { chromium } from '@playwright/test';
const [mida, colorIdx, nom] = process.argv.slice(2);
const [w, h] = (mida || '768x1024').split('x').map(Number);
const cIdx = colorIdx === undefined ? -1 : Number(colorIdx);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 3, hasTouch: true });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
if (cIdx >= 0) {
  const c = await p.evaluate((i) => {
    const g = document.querySelector('[data-p2-color-grid]');
    const btns = g ? [...g.querySelectorAll('button')] : [];
    if (!btns[i]) return null;
    const r = btns[i].getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  }, cIdx);
  if (c) { await p.mouse.click(c.x, c.y); await p.waitForTimeout(1200); }
}
const rect = await p.evaluate(() => {
  const taula = document.querySelector('[data-taula-vertical="2"]');
  const el = taula ? taula.querySelector('[data-stripe-visual-content="2"]') : null;
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
});
if (!rect) { console.log('no hi ha taula vertical'); await ctx.close(); await b.close(); process.exit(1); }
console.log('franja vertical', JSON.stringify(rect));
await p.waitForTimeout(300);
const fitxer = `_tmp-vert-${nom || 'ple'}${cIdx >= 0 ? '-color' + cIdx : ''}.png`;
await p.screenshot({ path: fitxer, clip: rect });
console.log('desat', fitxer);
await ctx.close();
await b.close();
