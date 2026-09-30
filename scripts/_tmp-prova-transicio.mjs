// TEMPORAL (28/09/2026): les transicions de la pastilla avancen en aquest
// entorn? Canvia el `top` a ma i mira si el valor computat es mou.
// Us: node scripts/_tmp-prova-transicio.mjs
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

const r = await p.evaluate(async () => {
  const out = [];
  const bars = [...document.querySelectorAll('[data-stripe-buttonbar]')];
  for (let i = 0; i < bars.length; i += 1) {
    const bar = bars[i];
    const pa = [...bar.querySelectorAll('span')].find((s) => getComputedStyle(s).position === 'absolute' && getComputedStyle(s).backgroundColor === 'rgb(255, 255, 255)');
    if (!pa || bar.getBoundingClientRect().height < 5) continue;
    const abans = getComputedStyle(pa).top;
    pa.style.top = 'calc(5% + 5px)';
    const serie = [];
    const t0 = performance.now();
    await new Promise((res) => {
      const pas = () => {
        serie.push(+parseFloat(getComputedStyle(pa).top).toFixed(2));
        if (performance.now() - t0 > 450) res();
        else requestAnimationFrame(pas);
      };
      pas();
    });
    const distints = [...new Set(serie)];
    out.push({ i, abans, objectiu: getComputedStyle(pa).top, distints: distints.length, primera: distints[0], ultima: distints[distints.length - 1], serie: distints.slice(0, 8) });
    pa.style.top = abans;
  }
  return out;
});
console.log(JSON.stringify(r, null, 1));
await b.close();
