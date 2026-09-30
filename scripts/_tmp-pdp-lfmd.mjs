// TEMPORAL: troba una PDP de LFMD i mira com s'hi pinta el dibuix.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(9000);
const enllacos = await p.evaluate(() => [...document.querySelectorAll('a[href]')]
  .map((a) => a.getAttribute('href'))
  .filter((h) => h && /darcy|wickham|pemberley|austen/i.test(h))
  .slice(0, 6));
console.log('enllacos austen/LFMD trobats:', JSON.stringify(enllacos, null, 1));
if (!enllacos.length) { console.log('cap enllac'); await b.close(); process.exit(0); }
const desti = enllacos.find((h) => /darcy/i.test(h)) || enllacos[0];
console.log('vaig a', desti);
await p.goto('http://127.0.0.1:3003' + desti, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(8000);
const info = await p.evaluate(() => {
  const imgs = [...document.querySelectorAll('img')].filter((i) => (i.getBoundingClientRect().width > 300));
  return {
    url: location.pathname + location.search,
    dibuixos: imgs.slice(0, 4).map((i) => {
      const cs = getComputedStyle(i);
      const pare = i.parentElement ? getComputedStyle(i.parentElement) : null;
      return {
        src: (i.getAttribute('src') || '').split('/').slice(-1)[0],
        w: Math.round(i.getBoundingClientRect().width),
        filtre: cs.filter, opacitat: cs.opacity, barreja: cs.mixBlendMode,
        pareFiltre: pare ? pare.filter : null, pareOpacitat: pare ? pare.opacity : null, pareBarreja: pare ? pare.mixBlendMode : null,
      };
    }),
  };
});
console.log(JSON.stringify(info, null, 1));
await p.screenshot({ path: '_tmp-pdp-lfmd.png' });
console.log('desat _tmp-pdp-lfmd.png');
await b.close();
