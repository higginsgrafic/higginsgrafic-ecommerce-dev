// TEMPORAL — no es comiteja. La geometria declarada de la pagina 2: alçada de
// fila, pas, retall, i el selector, per saber quina es la regla bona.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('svg.lucide-search').catch(() => {});
await p.waitForTimeout(3000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const cont = v2.querySelector('[data-carrusel="1"] > div');
  const bs = [...v2.querySelectorAll('[data-carrusel="1"] button')];
  const a = bs[0].getBoundingClientRect();
  const b1 = bs[1].getBoundingClientRect();
  const c2 = bs[2].getBoundingClientRect();
  const sel = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  const s = sel.getBoundingClientRect();
  const rb = cont.getBoundingClientRect();
  return {
    retall: { top: +rb.top.toFixed(2), h: +rb.height.toFixed(2), bottom: +rb.bottom.toFixed(2) },
    fila1: { top: +a.top.toFixed(2), h: +a.height.toFixed(2), centre: +(a.top + a.height / 2).toFixed(2) },
    fila2: { top: +b1.top.toFixed(2), h: +b1.height.toFixed(2), centre: +(b1.top + b1.height / 2).toFixed(2) },
    stride_files: +(b1.top - a.top).toFixed(2),
    stride_columnes: +(c2.left - a.left).toFixed(2),
    selector: { top: +s.top.toFixed(2), h: +s.height.toFixed(2), cella: +(s.height / 3).toFixed(2) },
    celles: [0, 1, 2].map((i) => +(s.top + (s.height / 3) * (i + 0.5)).toFixed(2)),
  };
});
console.log(JSON.stringify(r, null, 1));
console.log('--- la fila 1 cau a', r.fila1.top, 'i el retall a', r.retall.top, '-> fora:', +(r.retall.top - r.fila1.top).toFixed(2), 'px');
console.log('--- stride de files:', r.stride_files, '| stride de celles del selector:', r.selector.cella);
await b.close();
