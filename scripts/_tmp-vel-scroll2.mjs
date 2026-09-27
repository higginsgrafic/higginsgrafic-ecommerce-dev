// TEMPORAL — no es comiteja. Captura de la franja DESPRES de fer scroll, per
// veure que el vel hi es on toca.
import { chromium } from '@playwright/test';
import fs from 'node:fs';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const q = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="7"]');
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2) };
});
fs.mkdirSync('/tmp/hg-captures', { recursive: true });
await p.screenshot({ path: '/tmp/hg-captures/franja-scroll-0.png', clip: { x: 340, y: 200, width: 1100, height: 160 } });
for (let i = 1; i <= 3; i++) {
  await p.mouse.move(q.x, q.y);
  await p.mouse.wheel(0, 120);
  await p.waitForTimeout(600);
}
await p.screenshot({ path: '/tmp/hg-captures/franja-scroll-3.png', clip: { x: 340, y: 200, width: 1100, height: 160 } });
console.log('captures fetes');
await b.close();
