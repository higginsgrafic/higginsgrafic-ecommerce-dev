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
  const btns = [...document.querySelectorAll('button')].filter((b) => (b.getAttribute('aria-label') || b.title || '').toLowerCase().includes('bloca'));
  const info = btns.map((b) => {
    const q = b.getBoundingClientRect();
    const sobre = document.elementsFromPoint(q.left + q.width / 2, q.top + q.height / 2).slice(0, 5).map((e) => `${e.tagName.toLowerCase()}.${(e.className || '').toString().slice(0, 28)}${e.getAttribute && e.getAttribute('data-mega-panel-surface') != null ? '[panel]' : ''} z=${getComputedStyle(e).zIndex} pe=${getComputedStyle(e).pointerEvents}`);
    const cs = getComputedStyle(b);
    return { label: b.getAttribute('aria-label') || b.title, rect: { x: +q.left.toFixed(1), y: +q.top.toFixed(1), w: +q.width.toFixed(1), h: +q.height.toFixed(1) }, z: cs.zIndex, pe: cs.pointerEvents, sobre };
  });
  const panell = document.querySelector('[data-mega-panel-surface="1"]');
  const pq = panell ? panell.getBoundingClientRect() : null;
  return { info, panell: pq ? { x: +pq.left.toFixed(1), y: +pq.top.toFixed(1), w: +pq.width.toFixed(1), b: +(pq.top + pq.height).toFixed(1), z: getComputedStyle(panell).zIndex } : null };
});
console.log(`${w}x${h}`, JSON.stringify(r, null, 1));
await b.close();
