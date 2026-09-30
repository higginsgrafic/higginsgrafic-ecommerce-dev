import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('http://127.0.0.1:3003/');
for (const [etq, f] of [['abans (referencia)', '/tmp/_tmp-tokens/abans/mega-cercador.png'], ['ara', '/tmp/_tmp-stripe-ara.png']]) {
  const r = await p.evaluate(async (d) => {
    const img = await new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = `data:image/png;base64,${d}`; });
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const dades = x.getImageData(267, 197, 790, 85).data;
    let suma = 0, noBlanc = 0, n = 0;
    for (let i = 0; i < dades.length; i += 4) {
      const lum = 0.299 * dades[i] + 0.587 * dades[i + 1] + 0.114 * dades[i + 2];
      suma += lum; n += 1; if (lum < 250) noBlanc += 1;
    }
    return { mitjana: Math.round(suma / n * 100) / 100, noBlanc };
  }, readFileSync(f).toString('base64'));
  console.log(`${etq.padEnd(20)} llum=${r.mitjana}  pixels no blancs=${r.noBlanc}`);
}
await b.close();
