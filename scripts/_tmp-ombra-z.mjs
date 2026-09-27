// TEMPORAL — la cadena d'apilament entre l'ombra i la imatge de la franja.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const visual = document.querySelector('[data-stripe-visual-content="2"]');
  const ombra = document.querySelector('[data-maniga-ombra="1"]');
  const capa = visual.closest('div[style*="z-index: 4"]') || visual.parentElement?.parentElement?.parentElement;
  const cami = (el, fins) => {
    const out = [];
    let e = el;
    while (e && e !== fins) {
      const cs = getComputedStyle(e);
      out.push(`${e.tagName}.${String(e.className || '').slice(0, 14)} pos=${cs.position} z=${cs.zIndex} iso=${cs.isolation} fil=${cs.filter !== 'none' ? 'si' : 'no'} tr=${cs.transform !== 'none' ? 'si' : 'no'}`);
      e = e.parentElement;
    }
    return out;
  };
  return {
    ombraAPare: ombra ? ombra.parentElement === (visual.parentElement?.parentElement?.parentElement || null) : null,
    camiVisual: cami(visual, null).slice(0, 8),
    camiOmbra: cami(ombra, null).slice(0, 8),
  };
});
console.log(JSON.stringify(r, null, 1));
await ctx.close(); await b.close();
