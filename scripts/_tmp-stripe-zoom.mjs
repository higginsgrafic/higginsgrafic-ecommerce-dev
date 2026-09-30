import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1960, height: 839 }, deviceScaleFactor: 4 });
await p.goto('http://127.0.0.1:3003/austen/quotes-it-is-a-truth', { waitUntil: 'networkidle' });
await p.waitForTimeout(2000);
await p.locator('button[aria-label="Cercador i catàleg"]').first().click({ force: true });
await p.waitForTimeout(2400);
const el = p.locator('[data-mega-panel-surface="1"]').getByText('QUOTES', { exact: true }).first();
await el.evaluate((n) => { let x = n; while (x && x !== document.body) { if (x.tagName === 'BUTTON' || x.tagName === 'A' || x.onclick) { x.click(); return; } x = x.parentElement; } n.click(); });
await p.waitForTimeout(1600);
const caixa = await p.evaluate(() => {
  for (const im of document.querySelectorAll('[data-mega-panel-surface="1"] img')) {
    const s = im.getAttribute('src') || '';
    if (s.includes('full-') && s.includes('stripe')) {
      const r = im.getBoundingClientRect();
      if (r.left > 0 && r.left < window.innerWidth && r.width > 400) return { x: r.left, y: r.top, w: r.width, h: r.height };
    }
  }
  return null;
});
const cell = caixa.w / 14;
// Les cases 4 a 8 (les cinc cites)
await p.screenshot({ path: '/tmp/_tmp-stripe-zoom.png', clip: { x: caixa.x + 4 * cell, y: caixa.y, width: 5 * cell, height: caixa.h } });
// I el detall de cada casa amb el seu src
const detall = await p.evaluate(({ w }) => {
  const out = [];
  for (const im of document.querySelectorAll('[data-mega-panel-surface="1"] img')) {
    const s = im.getAttribute('src') || '';
    if (!s.includes('austen/quotes')) continue;
    const r = im.getBoundingClientRect();
    if (r.width < 4 || r.left < 0 || r.left > window.innerWidth) continue;
    const parent = im.parentElement.getBoundingClientRect();
    out.push({ src: s.split('/').slice(-2).join('/'), x: Math.round(parent.left), w: Math.round(parent.width), top: Math.round(r.top), h: Math.round(r.height) });
  }
  return out;
}, { w: caixa.w });
for (const d of detall.sort((a, b) => a.x - b.x)) console.log(JSON.stringify(d));
await b.close();
