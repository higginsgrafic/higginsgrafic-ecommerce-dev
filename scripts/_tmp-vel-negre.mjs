// TEMPORAL — el VEL, pintat sobre NEGRE, per veure exactament quina forma cobreix.
// Tambe dona la caixa de cada silueta de la casa i la compara amb la tinta.
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const out = await p.evaluate(async () => {
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  const franja = v.querySelector('[data-stripe-visual-content="2"]');
  const vel = [...franja.querySelectorAll('img')].find((i) => (i.getAttribute('src') || '').startsWith('data:image/svg+xml'));
  const url = vel.getAttribute('src');
  const img = new Image();
  img.src = url;
  await img.decode();
  const W = img.naturalWidth; const H = img.naturalHeight;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#000000';
  g.fillRect(0, 0, W, H);
  g.drawImage(img, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H).data;
  const lum = (x, y) => { const i = (y * W + x) * 4; return 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; };
  // caixa de cobertura de cada casa, en finestres de 306
  const caixes = [];
  for (let k = 0; k < 14; k++) {
    const x0 = Math.round(k * 196.9) - 60; const x1 = Math.round(k * 196.9) + 366;
    let minX = 1e9; let maxX = -1; let minY = 1e9; let maxY = -1;
    for (let y = 0; y < H; y++) {
      for (let x = Math.max(0, x0); x < Math.min(W, x1); x++) {
        if (lum(x, y) <= 2) continue;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
    caixes.push({ casa: k, x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 });
  }
  return { W, H, svgCap: url.slice(0, 40), caixes };
});
console.log(JSON.stringify(out, null, 1));
// desa el vel sobre negre en PNG
const png = await p.evaluate(async () => {
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  const franja = v.querySelector('[data-stripe-visual-content="2"]');
  const vel = [...franja.querySelectorAll('img')].find((i) => (i.getAttribute('src') || '').startsWith('data:image/svg+xml'));
  const img = new Image();
  img.src = vel.getAttribute('src');
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const g = c.getContext('2d');
  g.fillStyle = '#000000'; g.fillRect(0, 0, c.width, c.height);
  g.drawImage(img, 0, 0);
  return c.toDataURL('image/png');
});
writeFileSync('_tmp-vel-negre.png', Buffer.from(png.split(',')[1], 'base64'));
console.log('desat _tmp-vel-negre.png');
await ctx.close();
await b.close();
