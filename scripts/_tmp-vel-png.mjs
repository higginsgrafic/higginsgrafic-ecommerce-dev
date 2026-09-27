// TEMPORAL — no es comiteja. Desa la imatge del vel de la p2 com a PNG (sobre fons fosc).
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const b = await chromium.launch();
const act = process.argv[2] || 'miscellania';
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const out = await p.evaluate(async () => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const franja = v2.querySelector('[data-stripe-visual-content="2"]');
  const imgs = [...franja.querySelectorAll('img')];
  const vel = imgs.find((im) => {
    const s = im.getAttribute('src') || '';
    return s.startsWith('data:image/svg+xml') && /fill-opacity="0\.6"/.test(decodeURIComponent(s));
  });
  const base = imgs.find((im) => (im.getAttribute('src') || '').includes('full-white-stripe'));
  const pinta = async (url, fons) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = 2866; c.height = 307;
    const g = c.getContext('2d');
    if (fons !== 'transparent') { g.fillStyle = fons; g.fillRect(0, 0, c.width, c.height); }
    g.drawImage(img, 0, 0, 2866, 307);
    return c.toDataURL('image/png');
  };
  const velPng = vel ? await pinta(vel.getAttribute('src'), 'transparent') : null;
  const basePng = base ? await pinta(base.getAttribute('src'), '#333333') : null;
  return { velPng, basePng };
});
if (out.velPng) { writeFileSync(`_tmp-vel-img-${act}.png`, Buffer.from(out.velPng.split(',')[1], 'base64')); console.log(`_tmp-vel-img-${act}.png desat`); } else console.log('sense vel');
if (out.basePng) { writeFileSync(`_tmp-base-img-${act}.png`, Buffer.from(out.basePng.split(',')[1], 'base64')); console.log(`_tmp-base-img-${act}.png desat`); }
await ctx.close();
await b.close();
