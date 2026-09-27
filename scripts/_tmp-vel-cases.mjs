// TEMPORAL — no es comiteja. El vel de cada casa de la franja (p2) amb cada colleccio activa.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const actives = process.argv.slice(2).length ? process.argv.slice(2) : ['miscellania'];
for (const act of actives) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(5000);
  const r = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const franja = v2.querySelector('[data-stripe-visual-content="2"]');
    // El vel: la imatge amb src data:image/svg+xml dins la franja
    const imgs = [...franja.querySelectorAll('img')].map((im) => ({
      src: (im.getAttribute('src') || '').slice(0, 30),
      big: (im.getAttribute('src') || '').length,
    }));
    const decodeVel = (url) => {
      const svg = decodeURIComponent(url.replace(/^data:image\/svg\+xml,/, ''));
      const re = /<path[^>]*>/g;
      let m;
      const out = [];
      let i = 0;
      while ((m = re.exec(svg))) {
        const tag = m[0];
        const op = (tag.match(/fill-opacity="([^"]*)"/) || [])[1];
        out.push({ i, veiled: op != null, op });
        i += 1;
      }
      return out;
    };
    const vels = [...franja.querySelectorAll('img')]
      .filter((im) => (im.getAttribute('src') || '').startsWith('data:image/svg+xml'))
      .map((im) => {
        const cs = getComputedStyle(im);
        const pairs = decodeVel(im.getAttribute('src')).filter((x) => x.veiled).map((x) => x.i + ':' + x.op);
        return { z: cs.zIndex, op: cs.opacity, n: pairs.length, pairs: pairs.join(' '), len: (im.getAttribute('src') || '').length };
      });
    let vel = null;
    const cases = [...franja.querySelectorAll('[data-stripe-tile]')].map((el) => ({
      idx: Number(el.getAttribute('data-stripe-tile')),
      coll: el.getAttribute('data-stripe-collection'),
      sub: el.getAttribute('data-stripe-subcollection'),
      item: (el.getAttribute('data-stripe-item') || '').slice(0, 24),
      src: (el.getAttribute('data-stripe-src') || '').split('/').pop(),
    })).sort((a, b2) => a.idx - b2.idx);
    const sonde = window.__HG_VEL__ || null;
    return { imgs, vel, vels, cases, sonde };
  });
  console.log(`\n===== active=${act}`);
  const veiled = new Set((r.vel || []).filter((v) => v.veiled).map((v) => v.i));
  for (const c of r.cases) {
    console.log(`  casa ${String(c.idx).padStart(2)} ${(c.coll || '?').padEnd(16)} ${(c.sub || '-').padEnd(12)} ${String(c.src).padEnd(26)} vel=${veiled.has(c.idx) ? 'SI' : 'no'}`);
  }
  console.log(`  VELS trobats: ${JSON.stringify(r.vels)}`);
  if (r.sonde) {
    console.log(`  SONDA: n=${r.sonde.n} offset=${r.sonde.offset} active=${r.sonde.active} idx=[${r.sonde.idx.join(',')}]`);
    console.log(`  SONDA colls: ${r.sonde.colls.map((c, i) => i + ':' + (c || '?')).join(' ')}`);
    console.log(`  SONDA srcs:  ${r.sonde.srcs.map((c, i) => i + ':' + c.slice(0, 18)).join(' ')}`);
  } else {
    console.log('  SONDA: no hi es');
  }
  console.log(`  imatges a la franja: ${r.imgs.length}`);
  await ctx.close();
}
await b.close();
