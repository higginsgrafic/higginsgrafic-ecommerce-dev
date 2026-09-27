// TEMPORAL — no es comiteja. Compara les posicions de les samarretes (imatge base) i de les siluetes (vel).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const act = process.argv[2] || 'miscellania';
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const r = await p.evaluate(async () => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const franja = v2.querySelector('[data-stripe-visual-content="2"]');
  const imgs = [...franja.querySelectorAll('img')];
  const vel = imgs.find((im) => {
    const s = im.getAttribute('src') || '';
    return s.startsWith('data:image/svg+xml') && /fill-opacity="0\.6"/.test(decodeURIComponent(s));
  });
  const base = imgs.find((im) => (im.getAttribute('src') || '').includes('full-white-stripe'));
  const perfils = async (url) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = 2866; c.height = 307;
    const g = c.getContext('2d');
    g.clearRect(0, 0, 2866, 307);
    g.drawImage(img, 0, 0, 2866, 307);
    const d = g.getImageData(0, 0, 2866, 307).data;
    const col = new Array(2866).fill(0);
    for (let x = 0; x < 2866; x++) {
      let n = 0;
      for (let y = 0; y < 307; y++) {
        const a = d[(y * 2866 + x) * 4 + 3];
        if (a > 25) n += 1;
      }
      col[x] = n;
    }
    // trams amb tinta
    const trams = [];
    let inici = null;
    for (let x = 0; x < 2866; x++) {
      if (col[x] > 3) { if (inici === null) inici = x; } else if (inici !== null) { trams.push([inici, x - 1, Math.round((inici + x - 1) / 2)]); inici = null; }
    }
    if (inici !== null) trams.push([inici, 2865, Math.round((inici + 2865) / 2)]);
    return trams;
  };
  const tBase = base ? await perfils(base.getAttribute('src')) : [];
  const tVel = vel ? await perfils(vel.getAttribute('src')) : [];
  return { tBase, tVel };
});
console.log('base (samarretes):', r.tBase.map((t) => `${t[0]}..${t[1]}(c${t[2]})`).join(' '));
console.log('vel  (siluetes)  :', r.tVel.map((t) => `${t[0]}..${t[1]}(c${t[2]})`).join(' '));
await ctx.close();
await b.close();
