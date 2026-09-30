import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
// Portem la pagina 1 a la pantalla (nomes per a la captura).
await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const carril = v1?.parentElement?.parentElement;
  if (carril) carril.style.transform = 'translateX(0)';
});
await p.waitForTimeout(2500);
const info = await p.evaluate(() => {
  const R = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`; };
  return {
    taula1: R(document.querySelector('[data-megaslide-taula="1"]')),
    celaGrid: R(document.querySelector('[data-taula-vertical="1"] [data-taula-cela="1-5"]')),
    celaSel: R(document.querySelector('[data-taula-vertical="1"] [data-taula-cela="6"]')),
    celaStripe: R(document.querySelector('[data-taula-vertical="1"] [data-taula-cela="7-9+12-14"]')),
    celaFletxes: R(document.querySelector('[data-taula-vertical="1"] [data-taula-cela="10"]')),
    blocDreta: R(document.querySelector('[data-bloc-dreta-p1="1"]')),
    franja: R(document.querySelector('[data-stripe-visual-content="1"]')),
  };
});
console.log(JSON.stringify(info, null, 1));
writeFileSync('_tmp-vertical-p1.png', await p.screenshot());
console.log('captura: _tmp-vertical-p1.png');
await ctx.close();
await b.close();
