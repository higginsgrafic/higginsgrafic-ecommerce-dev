// TEMPORAL — no es comiteja. La franja a la vista vertical (768x1024): com esta
// feta (paths, caselles) i on cau cada samarreta. Serveix per no trencar-la amb
// el vel de les inactives.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);

const r = await p.evaluate(() => {
  const tiles = [...document.querySelectorAll('[data-stripe-tile]')];
  const svgs = [...document.querySelectorAll('svg')].filter((s) => s.querySelector('clipPath'));
  const imgs = [...document.querySelectorAll('img')].filter((i) => /clic-area|stripe/i.test(i.src));
  const franja = document.querySelector('[data-stripe-drawing-layer]');
  return {
    files: window.innerWidth + 'x' + window.innerHeight,
    tiles: tiles.length,
    caselles: tiles.slice(0, 20).map((t) => { const b = t.getBoundingClientRect(); return `${t.getAttribute('data-stripe-tile')}:${Math.round(b.left)},${Math.round(b.top)},${Math.round(b.width)}x${Math.round(b.height)}:op${getComputedStyle(t).opacity}`; }),
    svgAmbClip: svgs.length,
    imatgesVelo: imgs.map((i) => ({ src: i.src.split('/').pop(), w: Math.round(i.getBoundingClientRect().width), h: Math.round(i.getBoundingClientRect().height) })),
    capaDibuix: franja ? (() => { const b = franja.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }; })() : null,
    mascaraContenidor: (() => {
      const el = document.querySelector('[data-stripe-drawing-layer]')?.closest('div[style*="mask"]');
      if (!el) return null;
      const s = getComputedStyle(el);
      return { mask: (s.maskImage || s.webkitMaskImage || '').slice(0, 90), size: s.maskSize };
    })(),
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
