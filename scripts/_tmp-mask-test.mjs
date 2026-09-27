// TEMPORAL — no es comiteja. Les mascares SVG funcionen dins d'un <img>?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
const r = await p.evaluate(async () => {
  const prova = async (etiqueta, maskAttrs, pathFill) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">`
      + `<defs><mask id="m" ${maskAttrs}><rect x="0" y="0" width="100" height="100" fill="#FFFFFF"/>`
      + `<circle cx="50" cy="50" r="25" fill="#000000"/></mask></defs>`
      + `<rect x="0" y="0" width="100" height="100" fill="${pathFill}" mask="url(#m)"/></svg>`;
    const img = new Image();
    img.src = 'data:image/svg+xml,' + encodeURIComponent(svg);
    await img.decode();
    const c = document.createElement('canvas');
    c.width = 100; c.height = 100;
    const g = c.getContext('2d');
    g.clearRect(0, 0, 100, 100);
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, 100, 100).data;
    const centre = d[(50 * 100 + 50) * 4 + 3];
    const forat = d[(5 * 100 + 5) * 4 + 3];
    return { etiqueta, centre, forat };
  };
  return [
    await prova('per defecte', 'maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"', '#FF0000'),
    await prova('style luminance', 'maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100" style="mask-type:luminance"', '#FF0000'),
    await prova('style alpha', 'maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100" style="mask-type:alpha"', '#FF0000'),
  ];
});
console.log(JSON.stringify(r, null, 1));
await b.close();
