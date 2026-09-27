// TEMPORAL — no es comiteja. El dibuix de la fila de dalt perd pixels de debò?
// Es compara la imatge pintada amb el que es veu (captura) a la seva casella.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 4 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const cont = v2.querySelector('[data-carrusel="1"] > div');
  const rb = cont.getBoundingClientRect();
  const btn = [...v2.querySelectorAll('[data-carrusel="1"] button')][0];
  const ib = btn.getBoundingClientRect();
  const img = btn.querySelector('img');
  // On cau la tinta dins la imatge? Es mira el bounding de la imatge i el de la
  // finestra, i quantes files de pixels queden per sobre.
  return {
    finestra: { top: +rb.top.toFixed(2), h: +rb.height.toFixed(2) },
    imatge: { top: +ib.top.toFixed(2), h: +ib.height.toFixed(2), natural: `${img.naturalWidth}x${img.naturalHeight}` },
    perduts_a_dalt: +(rb.top - ib.top).toFixed(2),
    capa: btn.getAttribute('aria-label'),
  };
});
console.log(JSON.stringify(r, null, 1));
// Captura ampliada de la fila de dalt (primers 4 dibuixos), 4x.
await p.screenshot({ path: '/tmp/hg-captures/fila-dalt-4x.png', clip: { x: 456, y: 70, width: 300, height: 56 } });
console.log('captura feta');
await b.close();
