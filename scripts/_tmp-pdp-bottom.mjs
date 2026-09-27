// TEMPORAL — no es comiteja. On cau el BAIX de la TDP respecte del bottom de la
// finestra, i quins elements envolten el bloc?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3500);
const r = await p.evaluate(() => {
  const files = [...document.querySelectorAll('div')].filter((d) => {
    const s = getComputedStyle(d);
    return s.display === 'grid' && s.gridTemplateColumns.split(' ').length === 3 && d.getBoundingClientRect().width > 300;
  });
  const cinta = files[0];
  const cb = cinta?.getBoundingClientRect();
  const imgs = [...document.querySelectorAll('img')].map((i) => ({ i, b: i.getBoundingClientRect() })).filter((x) => x.b.width > 200 && x.b.width < 600);
  const tdp = imgs.sort((a, b2) => b2.b.width - a.b.width)[0];
  const tb = tdp?.b;
  // El bloc de sota de la cinta (la banda).
  const banda = cinta?.closest('section, div');
  const bb = banda?.getBoundingClientRect();
  return {
    viewport: { alt: window.innerHeight, bottom: window.innerHeight },
    scrollY: window.scrollY,
    paginaAlt: document.documentElement.scrollHeight,
    cinta: cb ? { dalt: Math.round(cb.top), baix: Math.round(cb.bottom), alt: Math.round(cb.height) } : null,
    tdp: tb ? { dalt: Math.round(tb.top), baix: Math.round(tb.bottom), alt: Math.round(tb.height), ample: Math.round(tb.width) } : null,
    banda: bb ? { dalt: Math.round(bb.top), baix: Math.round(bb.bottom), alt: Math.round(bb.height) } : null,
    distTdpAlBottom: tb ? Math.round(window.innerHeight - tb.bottom) : null,
    distCintaAlBottom: cb ? Math.round(window.innerHeight - cb.bottom) : null,
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
