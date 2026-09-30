// TEMPORAL — l'overlay de l'area de clic de la p1 es veu o no?
import { chromium } from '@playwright/test';
const w = Number(process.argv[2] || 1366), h = Number(process.argv[3] || 768);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: w, height: h } });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(8000);
const r = await p.evaluate(() => {
  const ov = document.querySelector('.clic-area-overlay-p1');
  if (!ov) return { cap: true };
  const svg = ov.querySelector('svg');
  const paths = [...ov.querySelectorAll('path')];
  const cs = getComputedStyle(paths[0]);
  const s = svg ? svg.getBoundingClientRect() : null;
  return {
    cls: ov.className,
    svg: s ? { w: +s.width.toFixed(1), h: +s.height.toFixed(1), x: +s.left.toFixed(1), y: +s.top.toFixed(1), par: svg.getAttribute('preserveAspectRatio'), vb: svg.getAttribute('viewBox') } : null,
    nPaths: paths.length,
    primeraCls: paths[0] ? paths[0].getAttribute('class') : null,
    opacity: cs.opacity, fill: cs.fill, style: paths[0] ? (paths[0].getAttribute('style') || '') : '',
    opacitats: paths.slice(0, 3).map((q) => getComputedStyle(q).opacity),
  };
});
console.log(`${w}x${h}`, JSON.stringify(r));
await b.close();
