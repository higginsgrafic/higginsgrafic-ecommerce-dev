// TEMPORAL: la geometria del panell de franja que tapa el selector i el cadenat.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const R = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { caixa: `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`, overflow: `${cs.overflowX}/${cs.overflowY}`, z: cs.zIndex, pe: cs.pointerEvents, pos: cs.position }; };
  const cela = document.querySelector('[data-taula-cela="6-9+11-14"]');
  const celaSel = document.querySelector('[data-taula-cela="1"]');
  const arrel = cela ? cela.querySelector('.w-full.shrink-0') : null;
  const fills = arrel ? [...arrel.children].map((c) => ({ q: `${c.tagName}.${(c.className||'').toString().trim().split(/\s+/).slice(0,3).join('.')}`, ...R(c) })) : [];
  const cadenat = document.querySelector('button[aria-label="Bloca el megaslide"], button[aria-label="Desbloca el megaslide"]');
  return {
    celaDibuixos: R(cela), celaSelector: R(celaSel), arrelDelPanel: R(arrel),
    pareDeLArrel: arrel ? R(arrel.parentElement) : null,
    aviDeLArrel: arrel && arrel.parentElement ? R(arrel.parentElement.parentElement) : null,
    fills, cadenat: R(cadenat),
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
