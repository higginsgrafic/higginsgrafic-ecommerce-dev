// TEMPORAL — no es comiteja. Mesura a nivell de PIXEL: quina franja de pantalla
// canvia de lloc, respecte del selector, durant l'obertura.
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);

// coordenades de les bandes, mesurades abans d'obrir (el panell encara es tancat):
// les calculem de la pagina 2 un cop oberta, i tornem a comencar.
const geo = await p.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight }));

// Bandes (x0,x1) a vigilar, en px de pantalla:
const bandes = {
  selector: [1319, 1384],   // pastilles B/N/C
  colors: [470, 1290],      // tira de colors (barres)
  dibuixos: [470, 1290],    // files de dibuixos del carrusel
};
// Franges horitzontals (y0,y1) on buscar cada peça:
const franges = {
  selector: [60, 300],
  colors: [150, 230],
  dibuixos: [60, 160],
};

const captura = async () => {
  const buf = await p.screenshot({ type: 'png' });
  const png = PNG.sync.read(buf);
  const res = {};
  for (const [nom, [x0, x1]] of Object.entries(bandes)) {
    const [y0, y1] = franges[nom];
    let trobat = null;
    for (let y = y0; y < y1 && trobat === null; y += 1) {
      for (let x = x0; x < x1; x += 1) {
        const i = (png.width * y + x) << 2;
        const r = png.data[i]; const g = png.data[i + 1]; const bl = png.data[i + 2];
        // "tinta" = qualsevol cosa que no sigui blanc/gairebe blanc
        if (r < 240 || g < 240 || bl < 240) { trobat = y; break; }
      }
    }
    res[nom] = trobat;
  }
  return res;
};

await p.click('button:has(svg.lucide-search)').catch(() => {});
const serie = [];
const t0 = Date.now();
for (let i = 0; i < 40; i += 1) {
  try {
    const r = await captura();
    serie.push({ t: Date.now() - t0, ...r });
  } catch { /* s'ignora */ }
}
console.log(`geo ${geo.w}x${geo.h}`);
for (const s of serie) {
  const rel = (a) => (s.selector != null && s[a] != null ? (s[a] - s.selector) : null);
  console.log(`t=${String(s.t).padStart(5)} sel=${s.selector} colors=${s.colors} (rel ${rel('colors')}) dibuixos=${s.dibuixos} (rel ${rel('dibuixos')})`);
}
await b.close();
