// TEMPORAL — la cantonada del rombe, ABANS i DESPRES, amb el MATEIX clip i el
// color de samarreta triat. El "abans" es reprodueix desfent el grup del vel
// (una opacitat a cada cami), que es exactament com estava.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const mode of ['abans', 'despres']) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 4 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(4000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
  await p.waitForTimeout(9000);
  const c = await p.evaluate(() => {
    const v = document.querySelector('[data-mega-page-viewport="2"]');
    const g = v.querySelector('[data-p2-color-grid]');
    const btns = g ? [...g.querySelectorAll('button')] : [];
    if (!btns[3]) return null;
    const r = btns[3].getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });
  if (c) { await p.mouse.click(c.x, c.y); await p.waitForTimeout(1200); }
  if (mode === 'abans') {
    await p.evaluate(() => {
      const v = document.querySelector('[data-mega-page-viewport="2"]');
      const franja = v.querySelector('[data-stripe-visual-content="2"]');
      const img = [...franja.querySelectorAll('img')].find((i) => (i.getAttribute('src') || '').startsWith('data:image/svg+xml'));
      const text = decodeURIComponent(img.getAttribute('src').replace(/^data:image\/svg\+xml,/, ''));
      const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
      const svg = doc.documentElement;
      const grups = [...svg.querySelectorAll('g[opacity]')].filter((g) => g.querySelector('path'));
      for (const g of grups) {
        const op = g.getAttribute('opacity');
        g.removeAttribute('opacity');
        for (const pa of [...g.querySelectorAll('path')]) pa.setAttribute('fill-opacity', op);
      }
      img.setAttribute('src', `data:image/svg+xml,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`);
    });
    await p.waitForTimeout(600);
  }
  const rect = await p.evaluate(() => {
    const v = document.querySelector('[data-mega-page-viewport="2"]');
    const r = v.querySelector('[data-stripe-visual-content="2"]').getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height };
  });
  await p.screenshot({ path: `_tmp-cantonada-${mode}.png`, clip: { x: rect.x, y: rect.y, width: rect.width, height: rect.height } });
  console.log(`_tmp-cantonada-${mode}.png desat`);
  await ctx.close();
}
await b.close();
