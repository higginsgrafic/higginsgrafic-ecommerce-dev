import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 45000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(4000);
const estat = async (etiqueta) => {
  const r = await p.evaluate(() => {
    const out = {};
    document.querySelectorAll('[data-mega-page-viewport]').forEach((v) => {
      const b = v.getBoundingClientRect();
      const f = v.querySelector('[data-stripe-visual-content]');
      out[v.getAttribute('data-mega-page-viewport')] = {
        left: +b.left.toFixed(0), ample: +b.width.toFixed(0),
        franja: f ? [+f.getBoundingClientRect().left.toFixed(1), +f.getBoundingClientRect().width.toFixed(1)] : null,
        t: f ? getComputedStyle(f).transform : null,
      };
    });
    return out;
  });
  console.log(etiqueta, JSON.stringify(r));
  return r;
};
await estat('obert');
const el = await p.evaluateHandle(() => [...document.querySelectorAll('header button, header a')]
  .find((e) => /THE HUMAN INSIDE/i.test(e.textContent || '')));
const box = await el.asElement().boundingBox();
await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await p.waitForTimeout(4000);
const r = await estat('hover human inside');
await p.screenshot({ path: '/tmp/p1-activa.png', clip: { x: 300, y: 60, width: 1300, height: 320 } });
await b.close();
