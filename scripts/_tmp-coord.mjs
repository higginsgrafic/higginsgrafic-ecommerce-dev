// TEMPORAL — no es comiteja. El rectangle del gestor del clic (ClicAreaOverlay)
// contra el de la franja: son el mateix?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('svg.lucide-search').catch(() => {});
await p.waitForTimeout(3000);
const r = await p.evaluate(() => {
  // L'overlay del clic: el svg amb la classe tshirt-outline.
  const svg = [...document.querySelectorAll('svg')].find((s) => s.querySelector('.tshirt-outline'));
  const capa = document.querySelector('[data-stripe-drawing-layer]');
  const tiles = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile]');
  const b2 = (el) => { if (!el) return null; const k = el.getBoundingClientRect(); return { esq: +k.left.toFixed(1), dreta: +k.right.toFixed(1), ample: +k.width.toFixed(1) }; };
  return { overlay: b2(svg), capa: b2(capa), primeraCasa: b2(tiles) };
});
console.log(JSON.stringify(r, null, 1));
if (r.overlay && r.capa) {
  console.log('--- overlay ample', r.overlay.ample, '| capa ample', r.capa.ample, '| diferencia', (r.capa.ample - r.overlay.ample).toFixed(1));
  console.log('--- overlay esq', r.overlay.esq, '| capa esq', r.capa.esq, '| desplacament', (r.capa.esq - r.overlay.esq).toFixed(1));
}
await b.close();
