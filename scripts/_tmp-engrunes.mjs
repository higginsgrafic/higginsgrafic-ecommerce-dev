// TEMPORAL — no es comiteja. On cau el logo, l'aire de sota seu, i la filera
// d'enllacos (engrunes) de la PDP.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const header = document.querySelector('header');
  const logo = header?.querySelector('svg, img') || header?.querySelector('a');
  const lb = logo?.getBoundingClientRect();
  // La filera d'enllacos: la que conte "INICI".
  const textos = [...document.querySelectorAll('a, span, nav, div')].filter((e) => /^\s*INICI\s*$/i.test((e.textContent || '').trim()));
  const inici = textos[0];
  let fila = inici;
  for (let i = 0; i < 4 && fila; i++) {
    const b2 = fila.getBoundingClientRect();
    if (b2.width > 200 && b2.height < 60) break;
    fila = fila.parentElement;
  }
  const fb = fila?.getBoundingClientRect();
  const hb = header?.getBoundingClientRect();
  return {
    header: hb ? { dalt: Math.round(hb.top), baix: Math.round(hb.bottom), alt: Math.round(hb.height) } : null,
    logo: lb ? { esq: Math.round(lb.left), dreta: Math.round(lb.right), dalt: Math.round(lb.top), baix: Math.round(lb.bottom) } : null,
    inici: inici ? (() => { const x = inici.getBoundingClientRect(); return { esq: Math.round(x.left), dalt: Math.round(x.top), baix: Math.round(x.bottom) }; })() : null,
    fila: fb ? { esq: Math.round(fb.left), dreta: Math.round(fb.right), dalt: Math.round(fb.top), baix: Math.round(fb.bottom) } : null,
    filaContenidor: fila ? { esq: Math.round(fila.getBoundingClientRect().left), pad: getComputedStyle(fila).paddingLeft, top: getComputedStyle(fila).top } : null,
  };
});
console.log(JSON.stringify(r, null, 1));
if (r.logo && r.fila) {
  console.log('--- distància en X entre el logo i la filera:', r.fila.esq - r.logo.esq, 'px');
  console.log('--- aire de sota el logo (header):', r.header ? r.header.baix - r.logo.baix : '?', 'px');
  console.log('--- distància en Y del logo a la filera:', r.fila.dalt - r.logo.baix, 'px');
}
await b.close();
