// TEMPORAL (28/09/2026): mesura les BARRES de la tira de colors de la vertical
// de la p2, dins de la seva casella, per veure si arriben a l'amplada de la
// casella o no.
// Us: node scripts/_tmp-tira-colors.mjs
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

const r = await p.evaluate(() => {
  const R = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.left * 10) / 10, Math.round(r.top * 10) / 10, Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10]; };
  const cela = document.querySelector('[data-taula-vertical="2"] [data-taula-cela="2-5"]');
  const barres = [...(cela ? cela.querySelectorAll('[data-color-barra]') : [])];
  return {
    cela: R(cela),
    contenidorTira: R(barres[0]?.parentElement),
    barres: barres.length,
    primera: R(barres[0]),
    ultima: R(barres[barres.length - 1]),
    barresBox: barres.length ? [Math.round(barres[0].getBoundingClientRect().left * 10) / 10, Math.round(barres[barres.length - 1].getBoundingClientRect().right * 10) / 10] : null,
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
