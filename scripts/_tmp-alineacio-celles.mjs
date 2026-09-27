// TEMPORAL — no es comiteja. On cau cada cel·la del selector i on cau cada fila
// de dibuixos. Si ja coincideixen, el decalatge de 14,5 px sobra.
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
  const cells = ['BLANC', 'COLOR', 'NEGRE'].map((n, i) => ({ n, centre: +(sb.top + cella * (i + 0.5)).toFixed(2) }));
  const bs = [...v2.querySelectorAll('[data-carrusel="1"] button')];
  const files = [0, 1].map((i) => {
    const k = bs[i].getBoundingClientRect();
    return { i, top: +k.top.toFixed(2), centre: +(k.top + k.height / 2).toFixed(2), h: +k.height.toFixed(2) };
  });
  const cont = v2.querySelector('[data-carrusel="1"] > div');
  const rb = cont.getBoundingClientRect();
  return {
    selector: { top: +sb.top.toFixed(2), h: +sb.height.toFixed(2), cella: +cella.toFixed(2) },
    cells, files,
    desviament: cells.map((c, i) => +(files[i].centre - c.centre).toFixed(2)),
    retall: { top: +rb.top.toFixed(2), h: +rb.height.toFixed(2) },
    sobra: +(files[0].top - rb.top).toFixed(2),
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
