// TEMPORAL — no es comiteja. Els desnivells REALS en una carrega neta.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const bs = [...v2.querySelectorAll('[data-carrusel="1"] button')];
  const sel = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  const sb = sel.getBoundingClientRect();
  const cella = sb.height / 3;
  const a = bs[0].getBoundingClientRect();
  const b1 = bs[1].getBoundingClientRect();
  const cont = v2.querySelector('[data-carrusel="1"] > div');
  const rb = cont.getBoundingClientRect();
  // Els "desnivells" nomes es poden deduir de les posicions: quant puja cada fila
  // respecte de la seva posicio natural (0 i alcadaFila).
  return {
    desnivells: window.__desnivells,
    cella: +cella.toFixed(2),
    fila1_top: +a.top.toFixed(2),
    fila2_top: +b1.top.toFixed(2),
    retall_top: +rb.top.toFixed(2),
    separacio_files: +(b1.top - a.top).toFixed(2),
    centre_cella1: +(sb.top + cella / 2).toFixed(2),
    centre_fila1: +(a.top + a.height / 2).toFixed(2),
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
