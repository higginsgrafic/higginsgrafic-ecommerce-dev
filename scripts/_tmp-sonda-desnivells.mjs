// TEMPORAL — no es comiteja. Quant pugen les dues files de dibuixos?
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
  const pista = cont.firstElementChild;
  const rb = cont.getBoundingClientRect();
  const pb = pista.getBoundingClientRect();
  const bs = [...v2.querySelectorAll('[data-carrusel="1"] button')].slice(0, 12);
  return {
    desnivells: window.__desnivells,
    retall: { y: +rb.top.toFixed(2), h: +rb.height.toFixed(2) },
    pista: { y: +pb.top.toFixed(2), h: +pb.height.toFixed(2) },
    linies: [0, 1, 2, 3].map((i) => {
      const k = bs[i]?.getBoundingClientRect();
      return k ? { i, y: +k.top.toFixed(2), h: +k.height.toFixed(2), fora: +(rb.top - k.top).toFixed(2) } : null;
    }),
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
