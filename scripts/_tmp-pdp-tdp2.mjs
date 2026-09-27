// TEMPORAL — no es comiteja. La TDP de debò: la targeta del mig de les tres
// columnes, i on cau el seu baix.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3500);
const r = await p.evaluate(() => {
  const grid = [...document.querySelectorAll('div')].filter((d) => {
    const s = getComputedStyle(d);
    return s.display === 'grid' && s.gridTemplateColumns.split(' ').length === 3 && d.getBoundingClientRect().width > 300;
  })[0];
  if (!grid) return { error: 'no grid' };
  const cols = [...grid.children].map((c, i) => {
    const bb = c.getBoundingClientRect();
    const imgs = [...c.querySelectorAll('img')].map((x) => { const k = x.getBoundingClientRect(); return { w: Math.round(k.width), h: Math.round(k.height), src: (x.currentSrc || '').split('/').pop() }; });
    return { i, esq: Math.round(bb.left), dreta: Math.round(bb.right), ample: Math.round(bb.width), dalt: Math.round(bb.top), baix: Math.round(bb.bottom), alt: Math.round(bb.height), imgs };
  });
  const gb = grid.getBoundingClientRect();
  return {
    viewport: { alt: window.innerHeight },
    grid: { esq: Math.round(gb.left), dreta: Math.round(gb.right), ample: Math.round(gb.width), dalt: Math.round(gb.top), baix: Math.round(gb.bottom) },
    cols,
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
