import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="1"]', { timeout: 30000 });
await p.waitForTimeout(10000);
await p.evaluate(() => { const v = document.querySelector('[data-mega-page-viewport="1"]'); let t = v.parentElement; while (t && !(t.style && t.style.width === '400%')) t = t.parentElement; if (t) { t.style.transition = 'none'; t.style.transform = 'translateX(0%)'; } });
await p.waitForTimeout(500);
const r = await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="1"]');
  const f = v.querySelector('[data-stripe-visual-content="1"]');
  const img = [...f.querySelectorAll('img')].find((i) => (i.getAttribute('src') || '').includes('full-color-stripe') || (i.getAttribute('src') || '').includes('full-white-stripe'));
  const cs = getComputedStyle(img);
  const cami = [];
  let e = img;
  while (e && e !== document.body) {
    const c = getComputedStyle(e);
    cami.push(`${e.tagName}.${String(e.className || '').slice(0, 16)} op=${c.opacity} filt=${c.filter} blend=${c.mixBlendMode} bg=${c.backgroundColor} mask=${(c.maskImage || 'none') !== 'none' ? 'SI' : 'no'}`);
    e = e.parentElement;
  }
  return {
    src: (img.getAttribute('src') || '').slice(0, 60),
    natural: [img.naturalWidth, img.naturalHeight],
    rect: (() => { const q = img.getBoundingClientRect(); return [Math.round(q.width), Math.round(q.height)]; })(),
    img: { op: cs.opacity, filt: cs.filter, blend: cs.mixBlendMode, of: cs.objectFit, ir: cs.imageRendering, w: cs.width, h: cs.height },
    cami,
  };
});
console.log(JSON.stringify(r, null, 1));
await ctx.close(); await b.close();
