// TEMPORAL — no es comiteja. Atrapa el fotograma exacte en que el boto Color de
// la pagina 1 canvia d'alcada en clicar CUBE.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(6000);

await p.evaluate(() => {
  window.__m = [];
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const primer = v1.querySelector('button[aria-label="Color"]');
  const t0 = performance.now();
  let vist = null;
  const id = setInterval(() => {
    const boto = v1.querySelector('button[aria-label="Color"]');
    const rb = boto.getBoundingClientRect();
    const s = getComputedStyle(boto);
    const clau = `${rb.height.toFixed(2)}|${boto.style.cssText}|${boto.className}`;
    if (clau === vist) return;
    vist = clau;
    window.__m.push({
      t: Math.round(performance.now() - t0),
      mateix: boto === primer,
      h: +rb.height.toFixed(2),
      top: +rb.top.toFixed(2),
      inlineStyle: boto.getAttribute('style'),
      cls: boto.className,
      pareCls: boto.parentElement.className,
      pareH: +boto.parentElement.getBoundingClientRect().height.toFixed(2),
      pareInline: boto.parentElement.getAttribute('style'),
      parePareH: +boto.parentElement.parentElement.getBoundingClientRect().height.toFixed(2),
    });
  }, 16);
  setTimeout(() => clearInterval(id), 4000);
});

const card = await p.evaluateHandle(() => [...document.querySelectorAll('[data-colleccions-targeta]')].find((e) => /CUBE/i.test(e.textContent || '')));
await card.asElement().click();
await p.waitForTimeout(4200);
for (const x of await p.evaluate(() => window.__m)) console.log(JSON.stringify(x));
await b.close();
