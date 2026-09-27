// TEMPORAL — mesura la TINTA de la franja (full-color-stripe-5.webp).
// El canal alfa es pla: s'ha de mesurar per LLUMINOSITAT.
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 800, height: 600 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'domcontentloaded', timeout: 180000 });
const out = await p.evaluate(async () => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = '/placeholders/t-shirt_buttons/v5/full-color-stripe-5.webp';
  await img.decode();
  const W = img.naturalWidth; const H = img.naturalHeight;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, W, H).data;
  const lum = (i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
  let alfaMin = 255; let alfaMax = 0;
  for (let i = 3; i < d.length; i += 4) { if (d[i] < alfaMin) alfaMin = d[i]; if (d[i] > alfaMax) alfaMax = d[i]; }
  // Mostres: cantonada (5,5), mig de la primera samarreta, fons entre cossos
  const sample = (x, y) => { const i = (y * W + x) * 4; return [d[i], d[i + 1], d[i + 2], Math.round(lum(i))]; };
  // Luminositat: minim i maxim
  let lMin = 255; let lMax = 0;
  for (let i = 0; i < d.length; i += 4) { const l = lum(i); if (l < lMin) lMin = l; if (l > lMax) lMax = l; }
  return {
    W, H, alfaMin, alfaMax, lMin: Math.round(lMin), lMax: Math.round(lMax),
    cantonada: sample(5, 5),
    'mig cos 0 (150,150)': sample(150, 150),
    'mig cos 0 (150,250)': sample(150, 250),
    'entre cossos (200,300)': sample(200, 300),
    'fora marge (2860,150)': sample(2860, 150),
    'dalt (150,3)': sample(150, 3),
    'baix (150,305)': sample(150, 305),
  };
});
console.log(JSON.stringify(out, null, 2));
// Guarda la imatge en PNG per poder-la mirar
const png = await p.evaluate(async () => {
  const img = new Image();
  img.src = '/placeholders/t-shirt_buttons/v5/full-color-stripe-5.webp';
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const g = c.getContext('2d');
  g.fillStyle = '#ff00ff'; g.fillRect(0, 0, c.width, c.height);
  g.drawImage(img, 0, 0);
  return c.toDataURL('image/png');
});
writeFileSync('_tmp-tinta-franja.png', Buffer.from(png.split(',')[1], 'base64'));
console.log('desat _tmp-tinta-franja.png');
await ctx.close();
await b.close();
