// TEMPORAL: on cauen els camins de clic, contra les caselles de debò.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const c = document.querySelector('[data-taula-vertical="2"] [data-taula-cela="6-9+11-14"]');
  const overlay = c.querySelector('.clic-area-overlay');
  const ro = overlay.getBoundingClientRect();
  const svg = overlay.querySelector('svg');
  const svgBox = svg ? svg.getBoundingClientRect() : null;
  const paths = [...overlay.querySelectorAll('path')].map((el) => {
    const bb = el.getBoundingClientRect();
    return { x: Math.round(bb.left), y: Math.round(bb.top), w: Math.round(bb.width), h: Math.round(bb.height) };
  });
  const tiles = [...c.querySelectorAll('[data-stripe-tile]')].map((t) => {
    const bb = t.getBoundingClientRect();
    return { idx: Number(t.getAttribute('data-stripe-tile')), x: Math.round(bb.left), y: Math.round(bb.top), w: Math.round(bb.width), h: Math.round(bb.height) };
  });
  return {
    overlay: { x: Math.round(ro.left), y: Math.round(ro.top), w: Math.round(ro.width), h: Math.round(ro.height), pare: overlay.parentElement.id || overlay.parentElement.getAttribute('data-stripe-visual-content') || overlay.parentElement.className },
    svg: svgBox ? { x: Math.round(svgBox.left), y: Math.round(svgBox.top), w: Math.round(svgBox.width), h: Math.round(svgBox.height), viewBox: svg.getAttribute('viewBox'), par: svg.getAttribute('preserveAspectRatio') } : null,
    paths: paths.slice(0, 4), nPaths: paths.length,
    tiles: tiles.slice(0, 4),
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
