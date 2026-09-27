// TEMPORAL — no es comiteja. El pas entre samarretes del dibuix de la franja, i
// si la catorzena cau on cauria despres d'onze passos. Alimenta el bucle.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(4500);

const r = await p.evaluate(async () => {
  const carrega = async (src) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    return g.getImageData(0, 0, c.width, c.height);
  };
  const perfils = {};
  for (const [nom, src] of [
    ['white', '/placeholders/cercador/full-white-stripe.webp'],
    ['color', '/placeholders/t-shirt_buttons/v5/full-color-stripe-5.webp'],
  ]) {
    const im = await carrega(src);
    // Fila a 3/4 de l'alcada (cos de la samarreta, sense manigues): les
    // samarretes hi surten com a grups opacs separats per transparent.
    const y = Math.floor(im.height * 0.8);
    const grups = [];
    let dins = false; let inici = 0;
    for (let x = 0; x < im.width; x++) {
      const a = im.data[(y * im.width + x) * 4 + 3];
      if (a > 8 && !dins) { dins = true; inici = x; }
      else if (a <= 8 && dins) { dins = false; grups.push([inici, x - 1]); }
    }
    if (dins) grups.push([inici, im.width - 1]);
    const amples = grups.map(([a, z]) => z - a + 1);
    const passos = grups.slice(1).map(([a], i) => a - grups[i][0]);
    perfils[nom] = { n: grups.length, amples: amples.slice(0, 20), passos: passos.slice(0, 20) };
  }
  // Les finestres de dibuix, en % del contenidor
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const cont = v2.querySelector('[data-stripe-visual-content="2"]');
  const ple = cont.getBoundingClientRect();
  const caselles = [...cont.querySelectorAll('div')].filter((d) => d.style.position === 'absolute' && d.style.overflow === 'hidden' && d.querySelector(':scope > img'));
  const finestres = caselles.map((d) => +((d.getBoundingClientRect().left - ple.left) / ple.width * 100).toFixed(4));
  const passosFinestres = finestres.slice(1).map((x, i) => +(x - finestres[i]).toFixed(4));
  return { perfils, finestresPct: finestres, passosFinestresPct: passosFinestres };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
