// LA STRIPE DE LA P2 I EL SEGON CARRIL (02/10/2026).
// Mesura, amb la pagina 2 al davant, la stripe de la p2 i les dues guies.
import { chromium } from '@playwright/test';
const w = Number(process.argv[2] || 1024), h = Number(process.argv[3] || 768);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact&carril=1', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const q = (el) => {
    if (!el) return null;
    const x = el.getBoundingClientRect();
    return { x: +x.left.toFixed(2), d: +x.right.toFixed(2), w: +x.width.toFixed(2) };
  };
  const g = (s) => {
    const el = document.querySelector(s);
    return el ? +el.getBoundingClientRect().left.toFixed(2) : null;
  };
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  return {
    guiaPaginaEsq: g('[data-guia-carril-pagina="esq"]'),
    guiaPaginaDret: g('[data-guia-carril-pagina="dret"]'),
    guiaMegaEsq: g('[data-guia-carril="esq"]'),
    guiaMegaDret: g('[data-guia-carril="dret"]'),
    stripeP2: q(v2.querySelector('[data-stripe-visual-content="2"]')),
    franjaP2: q(v2.querySelector('[data-colleccions-franja="1"]')),
    colorBar: q(v2.querySelector('[data-p2-color-selector]')),
  };
});
console.log(`${w}x${h}`);
console.log(JSON.stringify(r, null, 1));
const c = r.guiaPaginaEsq, d = r.guiaPaginaDret;
if (c != null && d != null) {
  for (const [k, v] of [['stripeP2', r.stripeP2], ['franjaP2', r.franjaP2], ['colorBar', r.colorBar]]) {
    if (!v) continue;
    console.log(`${k}: esq ${(v.x - c).toFixed(2)}  dreta ${(v.d - d).toFixed(2)}  ample ${(v.w - (d - c)).toFixed(2)}`);
  }
}
await ctx.close();
await b.close();
