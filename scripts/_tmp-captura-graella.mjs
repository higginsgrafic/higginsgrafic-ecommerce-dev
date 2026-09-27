// TEMPORAL — no es comiteja. Captura de la graella amb AUSTEN, per veure-hi les
// imatges tallades.
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
// Fins arribar a la zona de LOOKING FOR MY DARCY.
for (let i = 1; i <= 12; i++) { await p.mouse.move(q.x, q.y); await p.mouse.wheel(0, 120); await p.waitForTimeout(300); }
fs.mkdirSync('/tmp/hg-captures', { recursive: true });
const retall = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const cont = v2.querySelector('[data-carrusel="1"] > div');
  const rb = cont.getBoundingClientRect();
  return { x: Math.round(rb.left) - 10, y: Math.round(rb.top) - 10, width: Math.round(rb.width) + 20, height: Math.round(rb.height) + 20 };
});
await p.screenshot({ path: '/tmp/hg-captures/graella-austen.png', clip: retall });
console.log('captura feta', JSON.stringify(retall));
await b.close();
