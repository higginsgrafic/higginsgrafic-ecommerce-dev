// TEMPORAL — no es comiteja. A3: on cau la banda de l'ombra i com queda la costura.
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 3 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const info = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const ombra = v2.querySelector('[data-maniga-ombra="1"]');
  const f = v2.querySelector('[data-stripe-visual-content="2"]').getBoundingClientRect();
  const col = v2.querySelector('[data-colleccions-targeta]').parentElement.getBoundingClientRect();
  const o = ombra ? ombra.getBoundingClientRect() : null;
  return {
    ombra: o ? { x: +o.left.toFixed(1), y: +o.top.toFixed(1), w: +o.width.toFixed(1), h: +o.height.toFixed(1), bg: getComputedStyle(ombra).backgroundImage } : null,
    franjaR: +f.right.toFixed(1),
    colL: +col.left.toFixed(1),
    colT: +col.top.toFixed(1),
    colB: +col.bottom.toFixed(1),
    franjaB: +f.bottom.toFixed(1),
  };
});
console.log(JSON.stringify(info, null, 1));
await p.screenshot({ path: '_tmp-a3-despres3x.png', clip: { x: 1350, y: 240, width: 180, height: 120 } });
console.log('desat _tmp-a3-despres3x.png');
await ctx.close();
await b.close();
