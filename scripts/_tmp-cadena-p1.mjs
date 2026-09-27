// TEMPORAL — no es comiteja. La cadena del selector de la pagina 1, abans i
// despres de clicar CUBE.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(4000);

const cadena = () => p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  let e = v1?.querySelector('button[aria-label="Color"]');
  const out = [];
  for (let i = 0; i < 10 && e; i++) {
    const r = e.getBoundingClientRect();
    const s = getComputedStyle(e);
    out.push({
      n: e.tagName.toLowerCase() + (e.dataset && Object.keys(e.dataset).length ? '[' + Object.keys(e.dataset).join(',') + ']' : ''),
      cls: String(e.className).slice(0, 60),
      top: +r.top.toFixed(2),
      h: +r.height.toFixed(2),
      offsetTop: e.offsetTop,
      mt: s.marginTop,
      position: s.position,
      transform: s.transform === 'none' ? null : s.transform,
      aspect: s.aspectRatio,
      display: s.display,
    });
    e = e.offsetParent;
  }
  return out;
});

console.log('ABANS');
for (const x of await cadena()) console.log(' ', JSON.stringify(x));
const card = await p.evaluateHandle(() => [...document.querySelectorAll('[data-colleccions-targeta]')].find((e) => /CUBE/i.test(e.textContent || '')));
await card.asElement().click();
await p.waitForTimeout(3000);
console.log('DESPRES');
for (const x of await cadena()) console.log(' ', JSON.stringify(x));
await b.close();
