import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'node:fs';
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('http://127.0.0.1:3003/');
for (const etq of ['abans', 'vores', 'fons', 'text', 'classes', 'final']) {
  const f = `/tmp/_tmp-tokens/${etq}/mega-cercador.png`;
  if (!existsSync(f)) { console.log(`${etq.padEnd(8)} (sense captura)`); continue; }
  const r = await p.evaluate(async (d) => {
    const img = await new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = `data:image/png;base64,${d}`; });
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    // Banda de la franja a 1440x900: x 267..1057, y 197..282
    const dades = x.getImageData(267, 197, 790, 85).data;
    let suma = 0, noBlanc = 0, n = 0;
    for (let i = 0; i < dades.length; i += 4) {
      const lum = 0.299 * dades[i] + 0.587 * dades[i + 1] + 0.114 * dades[i + 2];
      suma += lum; n += 1;
      if (lum < 250) noBlanc += 1;
    }
    return { mitjana: suma / n, noBlanc };
  }, readFileSync(f).toString('base64'));
  console.log(`${etq.padEnd(8)} llum mitjana=${r.mitjana.toFixed(2)}  pixels no blancs=${r.noBlanc}`);
}
await b.close();
