import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const carril = [...document.querySelectorAll('div')].map((d) => ({ d, b: d.getBoundingClientRect() })).filter((x) => Math.abs(x.b.width - parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w'))) < 1).sort((a, b2) => a.b.top - b2.b.top)[0];
  const visor = document.querySelector('[data-container="carousel-track"]')?.parentElement;
  const vb = visor?.getBoundingClientRect();
  const track = document.querySelector('[data-container="carousel-track"]');
  const cards = [...document.querySelectorAll('[data-component="product-card"]')].map((c) => c.getBoundingClientRect()).filter((x) => x.width > 0).sort((a, b2) => a.left - b2.left);
  const dins = cards.filter((x) => x.right > carril.b.left && x.left < carril.b.right);
  return {
    carril: `${Math.round(carril.b.left)}..${Math.round(carril.b.right)}`,
    visor: vb ? `${Math.round(vb.left)}..${Math.round(vb.right)} (${Math.round(vb.width)})` : null,
    visorMargin: visor ? getComputedStyle(visor).marginLeft : null,
    track: track ? getComputedStyle(track).transform : null,
    cards: cards.slice(0, 8).map((x) => `${Math.round(x.left)}..${Math.round(x.right)}`),
    dinsCarril: dins.map((x) => `${Math.round(x.left)}..${Math.round(x.right)}`),
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
