// TEMPORAL — el perfil de la casa 1 a la imatge de color: per a cada alcada, on
// es la tinta I de quin color (blanc = casa 0 al davant, blau clar = casa 1,
// fons = res).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 800, height: 600 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'domcontentloaded', timeout: 180000 });
const out = await p.evaluate(async () => {
  const img = new Image();
  img.src = '/placeholders/t-shirt_buttons/v5/full-color-stripe-5.webp';
  await img.decode();
  const W = img.naturalWidth; const H = img.naturalHeight;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, W, H).data;
  const px = (x, y) => { const i = (y * W + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
  const cls = (x, y) => {
    const [r, gg, bb] = px(x, y);
    const l = 0.2126 * r + 0.7152 * gg + 0.0722 * bb;
    if (l > 250) return '.';            // fons
    if (Math.abs(r - gg) < 6 && Math.abs(gg - bb) < 6) return 'W'; // blanc (casa 0)
    if (bb > r + 20) return 'B';        // blau clar (casa 1)
    return '?';
  };
  const linies = [];
  for (let y = 0; y < H; y += 10) {
    let s = '';
    for (let x = 240; x <= 700; x += 5) s += cls(x, y);
    linies.push(`y${String(y).padStart(3)} ${s}`);
  }
  return { W, H, linies, x0: 240, pas: 5, x1: 700 };
});
console.log(`casa 1: x ${out.x0}..${out.x1} pas ${out.pas}`);
console.log('     ' + Array.from({ length: Math.floor((out.x1 - out.x0) / out.pas) + 1 }, (_, i) => (out.x0 + i * out.pas) % 100 === 0 ? '|' : ' ').join(''));
for (const l of out.linies) console.log(l);
await ctx.close();
await b.close();
