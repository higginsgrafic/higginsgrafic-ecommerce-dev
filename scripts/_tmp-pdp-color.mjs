// TEMPORAL — no es comiteja. La PDP del registre llegeix `?color=` i `?variant=`?
// Es mesura el color triat (aria-pressed) i l'acabat triat (fons blanc).
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();

const estat = () => p.evaluate(() => {
  const color = [...document.querySelectorAll('button[aria-label^="Variant "]')].find((x) => x.getAttribute('aria-pressed') === 'true');
  const acabats = [...document.querySelectorAll('button')].filter((x) => ['BLANC', 'COLOR', 'NEGRE'].includes((x.textContent || '').trim()));
  const actiu = acabats.find((x) => getComputedStyle(x).backgroundColor === 'rgb(255, 255, 255)');
  const principal = [...document.querySelectorAll('img')].map((i) => i.currentSrc || i.src).find((s) => /mockup|tdp|shirt/i.test(s)) || null;
  return {
    color: color ? color.getAttribute('aria-label').replace('Variant ', '') : null,
    acabat: actiu ? (actiu.textContent || '').trim() : null,
    acabats: acabats.map((x) => (x.textContent || '').trim() + (x.disabled ? '(no)' : '')),
    imatge: principal ? principal.split('/').slice(-1)[0] : null,
  };
});

for (const url of [
  '/the-human-inside/afrodita',
  '/the-human-inside/afrodita?color=white&variant=black',
  '/the-human-inside/afrodita?color=red&variant=white',
  '/the-human-inside/afrodita?color=navy&variant=color',
  '/the-human-inside/afrodita?color=black&variant=BLANC',
  '/the-human-inside/afrodita?color=INVENTAT&variant=INVENTAT',
]) {
  await p.goto('http://127.0.0.1:3003' + url, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(2200);
  console.log(url.padEnd(56), JSON.stringify(await estat()));
}
await b.close();
