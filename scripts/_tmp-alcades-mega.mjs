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
  const m = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { y: +x.top.toFixed(1), b: +(x.top + x.height).toFixed(1), h: +x.height.toFixed(1), css: cs.height, min: cs.minHeight, pos: cs.position }; };
  const panell = document.querySelector('[data-mega-panel-surface="1"]');
  return {
    panell: m(panell),
    parePanell: m(panell?.parentElement),
    pagines: [...document.querySelectorAll('[data-mega-page-viewport]')].map((e) => `${e.getAttribute('data-mega-page-viewport')}: ${JSON.stringify(m(e))}`),
  };
});
console.log(`${w}x${h}`, JSON.stringify(r, null, 1));
await b.close();
