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
  const m = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return { y: +x.top.toFixed(1), b: +(x.top + x.height).toFixed(1), h: +x.height.toFixed(1) }; };
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const panell = document.querySelector('[data-mega-panel-surface]');
  const bcn = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  const franja = v2.querySelector('[data-stripe-visual-content="2"]');
  const banda = v2.querySelector('[data-colleccions-franja="1"]');
  return {
    header: m(document.querySelector('header')),
    panell: m(panell),
    bcn: m(bcn),
    banda: m(banda),
    franja: m(franja),
    surface2: m(document.querySelector('[data-mega-panel-surface="1"]')),
  };
});
console.log(`${w}x${h}`, JSON.stringify(r));
await b.close();
