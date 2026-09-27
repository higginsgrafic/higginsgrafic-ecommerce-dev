// TEMPORAL — no es comiteja. Estat final: carril, rail i les tres peces del bloc.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(4500);
const r = await p.evaluate(() => {
  const carrilCss = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w'));
  // El carril: el div que conte el header del lloc (la filera del logo).
  const header = document.querySelector('header');
  const carrils = [...document.querySelectorAll('div')].filter((d) => { const b2 = d.getBoundingClientRect(); return Math.abs(b2.width - carrilCss) < 1 && b2.top < 200; });
  const carril = carrils[0]?.getBoundingClientRect();
  const cards = [...document.querySelectorAll('[data-component="product-card"]')].map((c) => c.getBoundingClientRect()).filter((x) => x.width > 0).sort((a, b2) => a.left - b2.left);
  const visibles = cards.filter((x) => x.left >= 0 && x.right <= window.innerWidth);
  const img = [...document.querySelectorAll('img')].map((i) => ({ i, b: i.getBoundingClientRect() })).filter((x) => x.b.width > 250).sort((a, b2) => b2.b.width - a.b.width)[0];
  let bloc = img?.i; while (bloc && getComputedStyle(bloc).display !== 'grid') bloc = bloc.parentElement;
  const peces = bloc ? [...bloc.children].map((c) => { const x = c.getBoundingClientRect(); return `${Math.round(x.left)}..${Math.round(x.right)}`; }) : [];
  const bb = bloc?.getBoundingClientRect();
  return {
    carril: carril ? { esq: Math.round(carril.left), dreta: Math.round(carril.right), centre: +((carril.left + carril.right) / 2).toFixed(1) } : null,
    rail: visibles.length ? { esq: Math.round(visibles[0].left), dreta: Math.round(visibles[visibles.length - 1].right), centre: Math.round((visibles[0].left + visibles[visibles.length - 1].right) / 2) } : null,
    bloc: bb ? { esq: Math.round(bb.left), dreta: Math.round(bb.right), baix: Math.round(bb.bottom) } : null,
    peces,
    viewport: { ample: window.innerWidth, alt: window.innerHeight, centre: window.innerWidth / 2 },
  };
});
console.log(JSON.stringify(r, null, 1));
if (r.carril && r.rail) console.log('--- rail vs carril: centre', r.rail.centre, 'vs', r.carril.centre, '->', r.rail.centre - r.carril.centre, 'px');
if (r.bloc) console.log('--- bloc baix:', r.bloc.baix, '| viewport', r.viewport.alt, '->', r.viewport.alt - r.bloc.baix, 'px del bottom');
await b.close();
