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
  const m = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return { x: +x.left.toFixed(1), fi: +x.right.toFixed(1), w: +x.width.toFixed(1), y: +x.top.toFixed(1), b: +(x.top + x.height).toFixed(1), h: +x.height.toFixed(1) }; };
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  return { graella: m(v1.querySelector('[data-graella-files-p1]')), franja: m(v1.querySelector('[data-stripe-visual-content="1"]')), bloc: m(v1.querySelector('[data-bloc-dreta-p1]')) };
});
console.log(`${w}x${h}`, JSON.stringify(r));
await b.close();
