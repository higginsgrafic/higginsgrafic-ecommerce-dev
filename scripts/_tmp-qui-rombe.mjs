// TEMPORAL — el pixel del ROMBE (250,60) i (250,100) de la captura 3x, amb
// totes les combinacions de capes, per saber qui el pinta.
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
const b = await chromium.launch();
const combos = ['tot', 'sense-tinta', 'sense-vel', 'sense-dibuix', 'nomes-tinta', 'nomes-vel', 'nomes-dibuix'];
for (const c of combos) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 3 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(4000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
  await p.waitForTimeout(9000);
  const info = await p.evaluate((que) => {
    const v = document.querySelector('[data-mega-page-viewport="2"]');
    const franja = v.querySelector('[data-stripe-visual-content="2"]');
    const imgs = [...franja.querySelectorAll('img')];
    const tinta = imgs.find((i) => /stripe\.webp/.test(i.getAttribute('src') || ''));
    const vel = imgs.find((i) => (i.getAttribute('src') || '').startsWith('data:image/svg+xml'));
    const capa = v.querySelector('[data-stripe-drawing-layer]');
    const amaga = (el) => { if (el) el.style.visibility = 'hidden'; };
    if (que === 'sense-tinta') amaga(tinta);
    if (que === 'sense-vel') amaga(vel);
    if (que === 'sense-dibuix') amaga(capa);
    if (que === 'nomes-tinta') { amaga(vel); amaga(capa); }
    if (que === 'nomes-vel') { amaga(tinta); amaga(capa); }
    if (que === 'nomes-dibuix') { amaga(tinta); amaga(vel); }
    const r = franja.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height };
  }, c);
  await p.waitForTimeout(300);
  const buf = await p.screenshot({ clip: { x: info.x, y: info.y, width: info.width, height: info.height } });
  const png = PNG.sync.read(buf);
  const px = (x, y) => { const i = (y * png.width + x) * 4; return png.data[i]; };
  console.log(c.padEnd(14), 'rombe(250,60)', px(250, 60), 'rombe(250,100)', px(250, 100), 'maqueta(200,20)', px(200, 20), 'fons(300,150)', px(300, 150));
  await ctx.close();
}
await b.close();
