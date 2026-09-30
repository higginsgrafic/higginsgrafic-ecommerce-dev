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
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const q = (s, base) => { const el = typeof s === 'string' ? document.querySelector(s) : s; if (!el) return null; const x = el.getBoundingClientRect(); const b0 = base ? base.getBoundingClientRect() : { left: 0 }; return { x: Math.round(x.left - b0.left), b: Math.round(x.right - b0.left), w: Math.round(x.width), y: Math.round(x.top) }; };
  const panel1 = document.querySelector('[data-mega-panel-surface="1"]');
  const fila = v1.querySelector('[data-filera-p1="1"]');
  const graella = v1.querySelector('[data-graella-files-p1]');
  const franja = v1.querySelector('[data-stripe-visual-content="1"]');
  const bcn = v1.querySelector('[data-stripe-buttonbar="bn-p1"]');
  return {
    panel1: q(panel1),
    v1: q(v1),
    fila: q(fila, v1),
    graella: q(graella, v1),
    franja: q(franja, v1),
    bcn: q(bcn, v1),
    megaW: getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w'),
    megaX: getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-x'),
  };
});
console.log(`${w}x${h}`, JSON.stringify(r, null, 1));
await b.close();
