// TEMPORAL — el vel, al FIREFOX (el navegador de treball). Amb passos i temps
// per saber on es queda si no arriba.
import { firefox } from '@playwright/test';
import { PNG } from 'pngjs';
import { writeFileSync } from 'node:fs';
const ACT = process.argv[2] || 'cube';
const COLOR = Number(process.argv[3] ?? 6);
const di = (s) => { console.log(`[${new Date().toISOString().slice(11, 19)}] ${s}`); };
di('engego el Firefox');
const b = await firefox.launch();
di('navegador engegat');
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
p.on('console', (m) => { if (m.type() === 'error') di('ERROR CONSOLA: ' + m.text().slice(0, 120)); });
p.on('pageerror', (e) => di('ERROR PAGINA: ' + String(e).slice(0, 120)));
di('goto');
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${ACT}`, { waitUntil: 'domcontentloaded', timeout: 180000 });
di('goto fet');
await p.waitForTimeout(6000);
di('clic al cercador');
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 60000 }).catch(() => di('sense viewport 2'));
di('espero el megaslide');
await p.waitForTimeout(12000);
if (COLOR >= 0) {
  const c = await p.evaluate((i) => {
    const v = document.querySelector('[data-mega-page-viewport="2"]');
    const g = v ? v.querySelector('[data-p2-color-grid]') : null;
    const btns = g ? [...g.querySelectorAll('button')] : [];
    if (!btns[i]) return null;
    const r = btns[i].getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  }, COLOR);
  if (c) { await p.mouse.click(c.x, c.y); await p.waitForTimeout(1500); di('color triat'); } else di('sense graella de colors');
}
const info = await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  const franja = v ? v.querySelector('[data-stripe-visual-content="2"]') : null;
  if (!franja) return null;
  const vel = [...franja.querySelectorAll('img')].find((i) => (i.getAttribute('src') || '').startsWith('data:image/svg+xml'));
  const r = franja.getBoundingClientRect();
  return {
    x: r.left, y: r.top, width: r.width, height: r.height,
    vel: !!vel,
    velRect: vel ? (() => { const q = vel.getBoundingClientRect(); return [Math.round(q.width), Math.round(q.height)]; })() : null,
  };
});
if (!info) { di('sense franja'); } else {
  di(`franja ${JSON.stringify(info)}`);
  const buf = await p.screenshot({ clip: { x: info.x, y: info.y, width: info.width, height: info.height } });
  writeFileSync(`_tmp-rombe-${ACT}-${COLOR}-firefox.png`, buf);
  const png = PNG.sync.read(buf);
  const px = (x, y) => { const i = (y * png.width + x) * 4; return [png.data[i], png.data[i + 1], png.data[i + 2]]; };
  const esc = png.width / 1055.1;
  const punt = (x, y) => px(Math.round(x * esc), Math.round(y * esc));
  di(`captura ${png.width}x${png.height} (escala ${esc.toFixed(2)}x)`);
  di(`rombe(250,60)=${JSON.stringify(punt(250, 60))} rombe(250,100)=${JSON.stringify(punt(250, 100))} espatlla(200,20)=${JSON.stringify(punt(200, 20))} cos(150,150)=${JSON.stringify(punt(150, 150))} fons(300,150)=${JSON.stringify(punt(300, 150))}`);
}
await ctx.close();
await b.close();
di('fi');
