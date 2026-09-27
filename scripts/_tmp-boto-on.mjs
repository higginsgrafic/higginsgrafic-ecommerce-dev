// TEMPORAL — no es comiteja. El boto Color de la pagina 1 mostrejat cada 50 ms:
// qui es el seu bloc contenidor i per que canvia d'alcada.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(4000);

await p.evaluate(() => {
  window.__m = [];
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const boto = v1.querySelector('button[aria-label="Color"]');
  const barra = boto.closest('[data-stripe-buttonbar="bn"]');
  const t0 = performance.now();
  const id = setInterval(() => {
    const bb = barra.getBoundingClientRect();
    const rb = boto.getBoundingClientRect();
    window.__m.push({
      t: Math.round(performance.now() - t0),
      barraTop: +bb.top.toFixed(2), barraH: +bb.height.toFixed(2),
      botoTop: +rb.top.toFixed(2), botoH: +rb.height.toFixed(2),
      botoOffsetParent: boto.offsetParent ? boto.offsetParent.className.slice(0, 30) : null,
      pareH: +boto.parentElement.getBoundingClientRect().height.toFixed(2),
      pareCls: boto.parentElement.className.slice(0, 30),
    });
  }, 50);
  setTimeout(() => clearInterval(id), 3500);
});

const card = await p.evaluateHandle(() => [...document.querySelectorAll('[data-colleccions-targeta]')].find((e) => /CUBE/i.test(e.textContent || '')));
await card.asElement().click();
await p.waitForTimeout(3800);
const m = await p.evaluate(() => window.__m);
let previ = null;
for (const x of m) {
  if (!previ || x.botoH !== previ.botoH || x.barraH !== previ.barraH || x.pareCls !== previ.pareCls) console.log(JSON.stringify(x));
  previ = x;
}
await b.close();
