// TEMPORAL — no es comiteja. Captura de la franja amb AUSTEN, als marcs.
import { chromium } from '@playwright/test';
import fs from 'node:fs';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 2 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=austen', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const q = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="7"]');
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2) };
});
// Fins que surti un marc a la franja.
for (let i = 1; i <= 30; i++) {
  await p.mouse.move(q.x, q.y); await p.mouse.wheel(0, 120); await p.waitForTimeout(260);
  const te = await p.evaluate(() => [...document.querySelectorAll('[data-stripe-tile] img')].some((i2) => /blue-yellow|fuchsia-yellow/.test(i2.currentSrc || '')));
  if (te) break;
}
fs.mkdirSync('/tmp/hg-captures', { recursive: true });
await p.screenshot({ path: '/tmp/hg-captures/franja-marcs.png', clip: { x: 340, y: 200, width: 1100, height: 160 } });
console.log('captura feta');
await b.close();
