// TEMPORAL — no es comiteja. El bloc de les tres columnes: centre i baix.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3500);
const r = await p.evaluate(() => {
  // El bloc: el grid que conte les tres columnes de la fitxa (especificacions,
  // tdp, detalls). Es reconeix pel seu ample i perque conte la imatge gran.
  const img = [...document.querySelectorAll('img')].map((i) => ({ i, b: i.getBoundingClientRect() })).filter((x) => x.b.width > 250).sort((a, b2) => b2.b.width - a.b.width)[0];
  let el = img?.i;
  let bloc = null;
  while (el && el !== document.body) {
    const s = getComputedStyle(el);
    const b2 = el.getBoundingClientRect();
    if (s.display === 'grid' && b2.width > 400 && b2.height > 200) { bloc = el; break; }
    el = el.parentElement;
  }
  const bb = bloc?.getBoundingClientRect();
  const cs = bloc ? getComputedStyle(bloc) : null;
  return {
    viewport: { ample: window.innerWidth, alt: window.innerHeight, centre: window.innerWidth / 2, bottom: window.innerHeight },
    bloc: bb ? { esq: Math.round(bb.left), dreta: Math.round(bb.right), ample: Math.round(bb.width), dalt: Math.round(bb.top), baix: Math.round(bb.bottom), centre: Math.round(bb.left + bb.width / 2) } : null,
    estil: cs ? { marginTop: cs.marginTop, marginBottom: cs.marginBottom, columns: cs.gridTemplateColumns, width: cs.width, gap: cs.gap } : null,
    tdpImg: img ? { ample: Math.round(img.b.width), baix: Math.round(img.b.bottom), centre: Math.round(img.b.left + img.b.width / 2) } : null,
  };
});
console.log(JSON.stringify(r, null, 1));
if (r.bloc) {
  console.log('--- desviament del centre:', r.bloc.centre - r.viewport.centre, 'px');
  console.log('--- baix del bloc al bottom del viewport:', r.viewport.bottom - r.bloc.baix, 'px');
}
await b.close();
