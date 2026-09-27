// TEMPORAL — no es comiteja. L'SVG del vel tal com surt del navegador.
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=miscellania', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const out = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const franja = v2.querySelector('[data-stripe-visual-content="2"]');
  const imgs = [...franja.querySelectorAll('img')];
  const vel = imgs.find((im) => {
    const s = im.getAttribute('src') || '';
    return s.startsWith('data:image/svg+xml') && /fill-opacity="0\.6"/.test(decodeURIComponent(s));
  });
  if (!vel) return { svg: null };
  const svg = decodeURIComponent(vel.getAttribute('src').replace(/^data:image\/svg\+xml,/, ''));
  return { svg, w: vel.getBoundingClientRect().width, h: vel.getBoundingClientRect().height };
});
if (out.svg) {
  writeFileSync('_tmp-vel.svg', out.svg);
  console.log(`_tmp-vel.svg desat (${out.svg.length} bytes), img ${out.w}x${out.h}`);
  const defs = out.svg.match(/<defs>[\s\S]*?<\/defs>/);
  console.log((defs ? defs[0] : '').slice(0, 2500));
} else console.log('sense vel');
await ctx.close();
await b.close();
