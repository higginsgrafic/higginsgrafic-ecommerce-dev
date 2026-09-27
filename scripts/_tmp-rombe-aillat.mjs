// TEMPORAL — el vel, al FIREFOX, sense el servidor de desenvolupament: es
// capturen el vel (el data URL) i la imatge de la franja amb el Chromium, es
// munta una pagina autonoma i es mesura el MATEIX pixel al Firefox i al
// Chromium. Aixi se sap si el rombe depen del navegador.
import { chromium, firefox } from '@playwright/test';
import { PNG } from 'pngjs';
import { writeFileSync } from 'node:fs';
const ACT = process.argv[2] || 'cube';
const COLOR = Number(process.argv[3] ?? 6);

// 1) amb el Chromium: el vel i la imatge
const cb = await chromium.launch();
const cctx = await cb.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const cp = await cctx.newPage();
await cp.goto(`http://127.0.0.1:3003/nova/inici?active=${ACT}`, { waitUntil: 'load', timeout: 180000 });
await cp.waitForTimeout(4000);
await cp.click('button:has(svg.lucide-search)').catch(() => {});
await cp.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await cp.waitForTimeout(9000);
if (COLOR >= 0) {
  const c = await cp.evaluate((i) => {
    const v = document.querySelector('[data-mega-page-viewport="2"]');
    const g = v.querySelector('[data-p2-color-grid]');
    const btns = g ? [...g.querySelectorAll('button')] : [];
    if (!btns[i]) return null;
    const r = btns[i].getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  }, COLOR);
  if (c) { await cp.mouse.click(c.x, c.y); await cp.waitForTimeout(1500); }
}
const dades = await cp.evaluate(async () => {
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  const franja = v.querySelector('[data-stripe-visual-content="2"]');
  const tinta = [...franja.querySelectorAll('img')].find((i) => /stripe\.webp/.test(i.getAttribute('src') || ''));
  const vel = [...franja.querySelectorAll('img')].find((i) => (i.getAttribute('src') || '').startsWith('data:image/svg+xml'));
  // la tinta, en data URL (per no dependre del servidor al Firefox)
  const im = new Image();
  im.src = tinta.getAttribute('src');
  await im.decode();
  const c = document.createElement('canvas');
  c.width = im.naturalWidth; c.height = im.naturalHeight;
  const g = c.getContext('2d');
  g.drawImage(im, 0, 0);
  return { tinta: c.toDataURL('image/webp'), vel: vel ? vel.getAttribute('src') : null, ample: im.naturalWidth, alt: im.naturalHeight };
});
await cb.close();
console.log('chromium: tinta', dades.ample + 'x' + dades.alt, 'vel', dades.vel ? (dades.vel.length + ' caracters') : 'CAP');
if (!dades.vel) process.exit(1);

// 2) la pagina autonoma, amb la MATEIXA composicio que el panell
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  body { margin: 0; background: #ffffff; }
  #c { position: relative; width: 1055.104248046875px; height: 113.02217102050781px; }
  #c img { display: block; position: absolute; top: 0; left: 0; height: 100%; width: auto; max-width: none; }
</style></head><body>
  <div id="c"><img id="t" src="${dades.tinta}"><img id="v" src="${dades.vel}"></div>
</body></html>`;

for (const [nom, nav] of [['firefox', firefox], ['chromium', chromium]]) {
  const b = await nav.launch();
  const ctx = await b.newContext({ viewport: { width: 1200, height: 300 }, deviceScaleFactor: 3 });
  const p = await ctx.newPage();
  await p.setContent(html, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(1200);
  const box = await p.evaluate(() => {
    const r = document.getElementById('c').getBoundingClientRect();
    const v = document.getElementById('v').getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height, vel: [Math.round(v.width), Math.round(v.height)] };
  });
  const buf = await p.screenshot({ clip: { x: box.x, y: box.y, width: box.width, height: box.height } });
  writeFileSync(`_tmp-rombe-aillat-${nom}.png`, buf);
  const png = PNG.sync.read(buf);
  const px = (x, y) => { const i = (y * png.width + x) * 4; return [png.data[i], png.data[i + 1], png.data[i + 2]]; };
  const esc = png.width / 1055.104248046875;
  const punt = (x, y) => px(Math.round(x * esc), Math.round(y * esc));
  console.log(`${nom.padEnd(9)} imatgeVel=${JSON.stringify(box.vel)} captura=${png.width}x${png.height} escala=${esc.toFixed(2)}x`);
  console.log(`          rombe(250,60)=${JSON.stringify(punt(250, 60))} rombe(250,100)=${JSON.stringify(punt(250, 100))} espatlla(200,20)=${JSON.stringify(punt(200, 20))} cos(150,150)=${JSON.stringify(punt(150, 150))} actiu(600,150)=${JSON.stringify(punt(600, 150))}`);
  await ctx.close();
  await b.close();
}
