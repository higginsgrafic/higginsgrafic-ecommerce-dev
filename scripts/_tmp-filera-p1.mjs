import { chromium } from '@playwright/test';
const w = Number(process.argv[2]), h = Number(process.argv[3]);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: w, height: h } });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const m = (el, base) => { if (!el) return null; const x = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { x: +(x.left - base).toFixed(1), w: +x.width.toFixed(1), y: +x.top.toFixed(1), h: +x.height.toFixed(1), css: `${cs.width}/${cs.height}`, tf: cs.transform.slice(0, 30), left: cs.left }; };
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const b1 = v1.getBoundingClientRect().left;
  const b2 = v2.getBoundingClientRect().left;
  return {
    carrilP2: m(v2.querySelector('[data-colleccions-franja="1"]'), b2),
    filera: m(v1.querySelector('#stripe-guide-stripe-row-p1'), b1),
    franja1: m(v1.querySelector('[data-stripe-visual-content="1"]'), b1),
    imatge: m(v1.querySelector('[data-stripe-visual-content="1"] img'), b1),
  };
});
console.log(`${w}x${h}`, JSON.stringify(r, null, 1));
await b.close();
