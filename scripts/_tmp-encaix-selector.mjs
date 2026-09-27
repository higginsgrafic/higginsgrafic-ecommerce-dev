// TEMPORAL — no es comiteja. L'encaix del selector Blanc/Color/Negre amb les dues
// files de dibuixos, i quin mon d'aire hi ha a cada banda.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const cont = v2.querySelector('[data-carrusel="1"] > div');
  const rb = cont.getBoundingClientRect();
  const boto = [...v2.querySelectorAll('[data-carrusel="1"] button')];
  const files = [0, 1].map((i) => {
    const k = boto[i].getBoundingClientRect();
    return { i, top: +k.top.toFixed(2), bottom: +k.bottom.toFixed(2) };
  });
  const sel = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  const sb = sel ? sel.getBoundingClientRect() : null;
  return {
    retall: { top: +rb.top.toFixed(2), bottom: +rb.bottom.toFixed(2), h: +rb.height.toFixed(2) },
    files,
    aire: { dalt: +(files[0].top - rb.top).toFixed(2), baix: +(rb.bottom - files[1].bottom).toFixed(2) },
    selector: sb ? { top: +sb.top.toFixed(2), bottom: +sb.bottom.toFixed(2), cella: +(sb.height / 3).toFixed(2) } : null,
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
