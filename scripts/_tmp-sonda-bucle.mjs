// TEMPORAL — no es comiteja. Que mesura el bucle d'alineacio i a quin objectiu
// compara les dues fileres?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const sel = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  const sb = sel.getBoundingClientRect();
  const cella = sb.height / 3;
  const bs = [...v2.querySelectorAll('[data-carrusel="1"] button')];
  const f = [0, 1].map((i) => { const k = bs[i].getBoundingClientRect(); return +(k.top + k.height / 2).toFixed(2); });
  return {
    selector: { top: +sb.top.toFixed(2), h: +sb.height.toFixed(2) },
    cella: +cella.toFixed(2),
    objectius: [+(sb.top + cella / 2).toFixed(2), +(sb.top + cella * 1.5).toFixed(2)],
    centresFiles: f,
    desviament: [+(f[0] - (sb.top + cella / 2)).toFixed(2), +(f[1] - (sb.top + cella * 1.5)).toFixed(2)],
    desnivells: window.__desnivells,
    selectorVisible: !!sel,
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
