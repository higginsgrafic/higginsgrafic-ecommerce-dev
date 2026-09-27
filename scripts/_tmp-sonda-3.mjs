// TEMPORAL — no es comiteja. La caixa que retalla i la pista, amb transform.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const carrusel = v2.querySelector('[data-carrusel="1"]');
  const retall = carrusel.firstElementChild;
  const pista = retall.firstElementChild;
  const item = [...carrusel.querySelectorAll('button')][0];
  const info = (e, nom) => {
    const b2 = e.getBoundingClientRect();
    const s = getComputedStyle(e);
    return { nom, top: +b2.top.toFixed(2), h: +b2.height.toFixed(2), offsetTop: e.offsetTop, offsetParent: e.offsetParent ? e.offsetParent.tagName + '.' + String(e.offsetParent.className).slice(0, 14) : null, pos: s.position, ov: s.overflow, tf: s.transform === 'none' ? '-' : s.transform.slice(0, 30), top_stil: e.style.top || '-' };
  };
  return [info(carrusel, 'carrusel'), info(retall, 'retall'), info(pista, 'pista'), info(item, 'item0')];
});
for (const x of r) console.log(`${x.nom.padEnd(9)} top=${String(x.top).padStart(8)} h=${String(x.h).padStart(7)} offsetTop=${String(x.offsetTop).padStart(5)} pare=${String(x.offsetParent).padEnd(22)} pos=${x.pos.padEnd(9)} ov=${x.ov.padEnd(8)} top-stil=${x.top_stil.padEnd(12)} tf=${x.tf}`);
await b.close();
