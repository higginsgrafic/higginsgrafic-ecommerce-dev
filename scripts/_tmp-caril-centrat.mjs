// TEMPORAL — no es comiteja. El carril esta centrat a la pantalla?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const ampleDoc = document.documentElement.clientWidth;
  const carrilCss = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w'));
  const caixes = [...document.querySelectorAll('div')].map((d) => d.getBoundingClientRect()).filter((x) => Math.abs(x.width - carrilCss) < 1);
  return {
    finestra: { innerWidth: window.innerWidth, clientWidth: ampleDoc, centre: ampleDoc / 2 },
    carrilCss,
    caixes: caixes.slice(0, 6).map((x) => ({ esq: Math.round(x.left), dreta: Math.round(x.right), ample: Math.round(x.width), centre: +((x.left + x.right) / 2).toFixed(1) })),
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
