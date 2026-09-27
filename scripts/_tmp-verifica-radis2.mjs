// TEMPORAL — no es comiteja. VERIFICACIO: la cantonada REAL del selector (a 8x)
// al costat de tres referencies amb radi 3, 5 i 5.3 px, pintades amb la MATEIXA
// mascara i el mateix fons, per poder comparar-les.
import { chromium } from '@playwright/test';
const ESC = 8;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: ESC });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(10000);
const info = await p.evaluate((ESC) => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const sel = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  const slider = [...sel.children].find((c) => c.tagName === 'SPAN');
  // Una capa de prova amb les referencies, a sota del tot
  const capa = document.createElement('div');
  capa.id = 'hg-radis';
  capa.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483647;background:#fff;pointer-events:none';
  const W = 60;
  const H = 60;
  const fila = (i, radi, etiqueta, color) => {
    const y = 20 + i * (H + 24);
    const r = radi * ESC;
    return `
      <svg width="${W * ESC}" height="${H * ESC}" style="position:absolute;left:20px;top:${y}px">
        <defs><mask id="m${i}">
          <rect x="0" y="0" width="${W * ESC}" height="${H * ESC}" fill="white"/>
          <circle cx="${r}" cy="${r}" r="${r}" fill="black"/>
        </mask></defs>
        <rect x="0" y="0" width="${W * ESC}" height="${H * ESC}" fill="magenta" mask="url(#m${i})"/>
      </svg>
      <div style="position:absolute;left:${20 + W * ESC + 16}px;top:${y + 8}px;font:${12 * ESC}px monospace;color:#000">${etiqueta}</div>`;
  };
  capa.innerHTML = [
    fila(0, 3, 'radi 3 px (la pastilla)', '#f0f'),
    fila(1, 5, 'radi 5 px', '#f0f'),
    fila(2, 5.3, 'radi 5,3 px (el selector)', '#f0f'),
    fila(3, 5.5, 'radi 5,5 px', '#f0f'),
  ].join('');
  document.body.appendChild(capa);
  const q = (e, marge = 2) => { const r = e.getBoundingClientRect(); return { x: r.left - marge, y: r.top - marge, w: r.width + 2 * marge, h: r.height + 2 * marge }; };
  return { sel: q(sel), slider: q(slider), css: { sel: getComputedStyle(sel).borderRadius, slider: getComputedStyle(slider).borderRadius }, dpr: window.devicePixelRatio };
}, ESC);
console.log(JSON.stringify({ dpr: info.dpr, css: info.css }));
// Retalla la cantonada del selector i la de la pastilla a 8x, i les referencies.
await p.screenshot({ path: '_tmp-radis-referencies.png', clip: { x: 0, y: 0, width: 560, height: 460 } });
await p.screenshot({ path: '_tmp-radis-selector.png', clip: { x: info.sel.x, y: info.sel.y, width: 34, height: 34 } });
await p.screenshot({ path: '_tmp-radis-pastilla.png', clip: { x: info.slider.x, y: info.slider.y, width: 34, height: 34 } });
console.log('desats els retalls (a 8x)');
await ctx.close();
await b.close();
