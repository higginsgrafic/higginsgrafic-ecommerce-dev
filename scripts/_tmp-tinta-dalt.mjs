// TEMPORAL — no es comiteja. A la fila de dalt, quina es la primera fila de
// pixels AMB TINTA? Si cau per sota del retall, no es perd res.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const r = await p.evaluate(async () => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  // Es mira la mateixa imatge que pinta el dibuix: quant marge buit te a dalt?
  const img = [...v2.querySelectorAll('[data-carrusel="1"] button img')][0];
  const src = img.currentSrc || img.src;
  const natural = await new Promise((res) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => {
      const c = document.createElement('canvas');
      c.width = i.naturalWidth; c.height = i.naturalHeight;
      const x = c.getContext('2d');
      x.drawImage(i, 0, 0);
      const d = x.getImageData(0, 0, c.width, c.height).data;
      let primera = -1;
      for (let y = 0; y < c.height && primera < 0; y++) {
        for (let xx = 0; xx < c.width; xx++) {
          const k = (y * c.width + xx) * 4;
          const A = d[k + 3];
          const R = d[k], G = d[k + 1], B = d[k + 2];
          if (A > 40 && (R < 240 || G < 240 || B < 240)) { primera = y; break; }
        }
      }
      res({ ample: c.width, alt: c.height, primeraFilaAmbTinta: primera });
    };
    i.onerror = () => res({ error: true });
    i.src = src;
  });
  const btn = [...v2.querySelectorAll('[data-carrusel="1"] button')][0];
  const ib = btn.getBoundingClientRect();
  const cont = v2.querySelector('[data-carrusel="1"] > div');
  const rb = cont.getBoundingClientRect();
  // Escala: la imatge es pinta a ib.width px d'amplada.
  const escala = ib.width / natural.ample;
  const tintaY = ib.top + natural.primeraFilaAmbTinta * escala;
  return { natural, escala: +escala.toFixed(4), imatgeTop: +ib.top.toFixed(2), retallTop: +rb.top.toFixed(2), primeraTintaY: +tintaY.toFixed(2), tintaTallada: tintaY < rb.top };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
