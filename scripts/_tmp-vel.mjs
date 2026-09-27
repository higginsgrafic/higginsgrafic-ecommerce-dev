// TEMPORAL — no es comiteja. El vel de les samarretes inactives: hi es? Amb
// quina opacitat i quina caixa?
import { chromium } from '@playwright/test';
import fs from 'node:fs';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(4500);

const vel = () => p.evaluate(() => {
  const imgs = [...document.querySelectorAll('img')].filter((i) => (i.src || '').startsWith('data:image/svg+xml'));
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const tiles = [...(v2?.querySelectorAll('[data-stripe-tile]') || [])];
  const t0 = tiles[0]?.getBoundingClientRect();
  const t13 = tiles[13]?.getBoundingClientRect();
  return {
    velImgs: imgs.map((i) => {
      const bb = i.getBoundingClientRect();
      return { x: Math.round(bb.left), y: Math.round(bb.top), w: Math.round(bb.width), h: Math.round(bb.height), z: getComputedStyle(i).zIndex, dinsV2: v2 ? v2.contains(i) : null };
    }),
    franja: t0 ? { x: Math.round(t0.left), y: Math.round(t0.top), w: Math.round(t13.right - t0.left), h: Math.round(t0.height) } : null,
    cases: tiles.map((t) => `${t.getAttribute('data-stripe-tile')}:${getComputedStyle(t).opacity}`).join(' '),
  };
});

console.log('FIRST CONTACT:', JSON.stringify(await vel(), null, 1));
fs.mkdirSync('/tmp/hg-captures', { recursive: true });
await p.screenshot({ path: '/tmp/hg-captures/franja-vel-fc.png', clip: { x: 340, y: 200, width: 1100, height: 160 } });

const card = await p.evaluateHandle(() => [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-colleccions-targeta]')].find((x) => (x.textContent || '').trim().toUpperCase() === 'THE HUMAN INSIDE') || null);
const bb = await card.asElement().boundingBox();
await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
await p.waitForTimeout(1500);
console.log('THE HUMAN INSIDE:', JSON.stringify(await vel(), null, 1));
await p.screenshot({ path: '/tmp/hg-captures/franja-vel-thi.png', clip: { x: 340, y: 200, width: 1100, height: 160 } });
console.log('errors:', errs.length, errs.slice(0, 2));
await b.close();
