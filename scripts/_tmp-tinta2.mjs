// TEMPORAL — la TINTA de la franja, amb xifres. El fons de la imatge es BLANC
// (255) i la samarreta tambe es blanca (246): es mesura per LLUMINOSITAT amb un
// llindar ajustat, i es comprova mirant la captura retallada.
import { chromium } from '@playwright/test';
const LLINDAR = Number(process.argv[2] || 253);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 800, height: 600 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'domcontentloaded', timeout: 180000 });
const out = await p.evaluate(async (llindar) => {
  const img = new Image();
  img.src = '/placeholders/t-shirt_buttons/v5/full-color-stripe-5.webp';
  await img.decode();
  const W = img.naturalWidth; const H = img.naturalHeight;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, W, H).data;
  const lum = (x, y) => {
    const i = (y * W + x) * 4;
    return 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
  };
  const esTinta = (x, y) => lum(x, y) < llindar;
  // 1) transicions de tinta a unes quantes alcades
  const transicions = {};
  for (const y of [3, 20, 60, 76, 100, 150, 246, 290, 305]) {
    const t = [];
    let dins = esTinta(0, y);
    if (dins) t.push(0);
    for (let x = 1; x < W; x++) {
      const a = esTinta(x, y);
      if (a !== dins) { t.push(x); dins = a; }
    }
    transicions[`y=${y}`] = t;
  }
  // 2) caixa de la tinta d'una finestra
  const caixaFinestra = (x0, x1) => {
    let minX = 1e9; let maxX = -1; let minY = 1e9; let maxY = -1;
    for (let y = 0; y < H; y++) {
      for (let x = x0; x < x1; x++) {
        if (!esTinta(x, y)) continue;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
    return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
  };
  const finestres = {
    'casa 0 (0..305)': caixaFinestra(0, 306),
    'casa 0 esquerra (0..200)': caixaFinestra(0, 200),
    'casa 1 finestra (196..503)': caixaFinestra(196, 503),
    'casa 3 finestra (590..896)': caixaFinestra(590, 896),
    'tot (0..2866)': caixaFinestra(0, 2866),
  };
  // 3) perfil vertical de la primera columna de tinta (on arrenca la maniga)
  const perfilX = (x) => { for (let y = 0; y < H; y++) if (esTinta(x, y)) return y; return null; };
  const perfil = { 'x=1': perfilX(1), 'x=5': perfilX(5), 'x=20': perfilX(20), 'x=65': perfilX(65), 'x=150': perfilX(150), 'x=300': perfilX(300), 'x=305': perfilX(305), 'x=310': perfilX(310) };
  return { W, H, llindar, transicions, finestres, perfil };
}, LLINDAR);
console.log(JSON.stringify(out, null, 1));
await ctx.close();
await b.close();
