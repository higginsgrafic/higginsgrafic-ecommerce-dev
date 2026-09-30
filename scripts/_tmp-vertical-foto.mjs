// TEMPORAL: la vista vertical (768x1024) del megaslide, p1 i p2.
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

const info = await p.evaluate(() => {
  const R = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`; };
  return {
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    esPortrait: true,
    v1: R(document.querySelector('[data-mega-page-viewport="1"]')),
    v2: R(document.querySelector('[data-mega-page-viewport="2"]')),
    taula1: R(document.querySelector('[data-megaslide-taula="1"]')),
    taula2: R(document.querySelector('[data-megaslide-taula="2"]')),
    celaGrid1: R(document.querySelector('[data-taula-vertical="1"] [data-taula-cela="1-5"]')),
    celaStripe1: R(document.querySelector('[data-taula-vertical="1"] [data-taula-cela="7-9+12-14"]')),
    celaSel1: R(document.querySelector('[data-taula-vertical="1"] [data-taula-cela="6"]')),
    celaFlet1: R(document.querySelector('[data-taula-vertical="1"] [data-taula-cela="10"]')),
  };
});
console.log(JSON.stringify(info, null, 1));
writeFileSync('_tmp-vertical-768.png', await p.screenshot());
console.log('captura: _tmp-vertical-768.png');
console.log('errors:', errors.length ? errors.join(' | ') : 'cap');
await ctx.close();
await b.close();
