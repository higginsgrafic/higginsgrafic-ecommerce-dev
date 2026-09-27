// TEMPORAL — amago fills de la franja de la p1, un a un, fins a trobar qui aclareix.
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 3 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="1"]', { timeout: 30000 });
await p.waitForTimeout(10000);
await p.evaluate(() => { const v = document.querySelector('[data-mega-page-viewport="1"]'); let t = v.parentElement; while (t && (t.style && t.style.width !== '400%')) t = t.parentElement; if (t) { t.style.transition = 'none'; t.style.transform = 'translateX(0%)'; } });
await p.waitForTimeout(600);
const rect = await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="1"]');
  const f = v.querySelector('[data-stripe-visual-content="1"]').getBoundingClientRect();
  return { x: f.left, y: f.top, width: f.width, height: f.height };
});
const mostra = async () => {
  const buf = await p.screenshot({ clip: rect });
  const png = PNG.sync.read(buf);
  const i = (Math.round(50 * 3) * png.width + Math.round(106 * 3)) * 4;
  return png.data[i];
};
console.log('base:', await mostra());
const quants = await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="1"]');
  const f = v.querySelector('[data-stripe-visual-content="1"]');
  window.__fills = [...f.children[0].children];
  return window.__fills.map((e) => `${e.tagName}.${String(e.className || '').slice(0, 18)}[z=${getComputedStyle(e).zIndex} op=${getComputedStyle(e).opacity} bg=${getComputedStyle(e).backgroundColor}]`);
});
console.log(JSON.stringify(quants, null, 1));
for (let i = 0; i < quants.length; i++) {
  await p.evaluate((k) => { window.__fills[k].style.visibility = 'hidden'; }, i);
  await p.waitForTimeout(200);
  const v = await mostra();
  await p.evaluate((k) => { window.__fills[k].style.visibility = ''; }, i);
  console.log(`fill ${i}: ${quants[i]}  -> ${v}`);
}
await ctx.close(); await b.close();
