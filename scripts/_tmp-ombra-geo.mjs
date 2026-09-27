// TEMPORAL — la geometria de les dues mascares (contenidor i ombra).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const visual = document.querySelector('[data-stripe-visual-content="2"]');
  const ombra = document.querySelector('[data-maniga-ombra="1"]');
  const intern = ombra ? ombra.firstElementChild : null;
  const d = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const q = el.getBoundingClientRect();
    return {
      rect: [+q.left.toFixed(2), +q.top.toFixed(2), +q.width.toFixed(2), +q.height.toFixed(2)],
      offset: [el.offsetWidth, el.offsetHeight],
      mask: (cs.maskImage || cs.webkitMaskImage || 'none').slice(0, 60),
      size: cs.maskSize || cs.webkitMaskSize,
      pos: cs.maskPosition,
      rep: cs.maskRepeat,
      transform: cs.transform,
      origin: cs.transformOrigin,
    };
  };
  return { visual: d(visual), ombra: d(ombra), intern: d(intern) };
});
console.log(JSON.stringify(r, null, 1));
await ctx.close(); await b.close();
