// TEMPORAL — el mateix rombe, mesurat al FIREFOX (que es el navegador de
// treball), no nome's al Chromium de Playwright.
import { chromium, firefox } from '@playwright/test';
import { PNG } from 'pngjs';
const ACT = process.argv[2] || 'cube';
const COLOR = Number(process.argv[3] ?? 6);
for (const [nom, navegador] of [['firefox', firefox], ['chromium', chromium]]) {
  const b = await navegador.launch();
  const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 3 });
  const p = await ctx.newPage();
  try {
    await p.goto(`http://127.0.0.1:3003/nova/inici?active=${ACT}`, { waitUntil: 'load', timeout: 180000 });
    await p.waitForTimeout(5000);
    await p.click('button:has(svg.lucide-search)').catch(() => {});
    await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
    await p.waitForTimeout(10000);
    if (COLOR >= 0) {
      const c = await p.evaluate((i) => {
        const v = document.querySelector('[data-mega-page-viewport="2"]');
        const g = v.querySelector('[data-p2-color-grid]');
        const btns = g ? [...g.querySelectorAll('button')] : [];
        if (!btns[i]) return null;
        const r = btns[i].getBoundingClientRect();
        return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
      }, COLOR);
      if (c) { await p.mouse.click(c.x, c.y); await p.waitForTimeout(1500); }
    }
    const info = await p.evaluate(() => {
      const v = document.querySelector('[data-mega-page-viewport="2"]');
      const franja = v.querySelector('[data-stripe-visual-content="2"]');
      const vel = [...franja.querySelectorAll('img')].find((i) => (i.getAttribute('src') || '').startsWith('data:image/svg+xml'));
      const r = franja.getBoundingClientRect();
      return {
        x: r.left, y: r.top, width: r.width, height: r.height,
        vel: !!vel, velRect: vel ? (() => { const q = vel.getBoundingClientRect(); return [Math.round(q.width), Math.round(q.height)]; })() : null,
      };
    });
    const buf = await p.screenshot({ clip: { x: info.x, y: info.y, width: info.width, height: info.height } });
    const png = PNG.sync.read(buf);
    const px = (x, y) => { const i = (y * png.width + x) * 4; return [png.data[i], png.data[i + 1], png.data[i + 2]]; };
    console.log(`${nom.padEnd(9)} vel=${info.vel} midaVel=${JSON.stringify(info.velRect)} captura=${png.width}x${png.height}`);
    console.log(`          (escala ${(png.width / 1055.1).toFixed(2)}x) rombe(250,60)=${JSON.stringify(px(250, 60))} rombe(250,100)=${JSON.stringify(px(250, 100))} espatlla(200,20)=${JSON.stringify(px(200, 20))} cos(150,150)=${JSON.stringify(px(150, 150))}`);
    await p.screenshot({ path: `_tmp-rombe-${ACT}-${COLOR}-${nom}.png`, clip: { x: info.x, y: info.y, width: info.width, height: info.height } });
  } catch (e) {
    console.log(`${nom}: ERROR ${String(e).slice(0, 160)}`);
  }
  await ctx.close();
  await b.close();
}
