/**
 * Extreu fotogrames d'un video, per poder-los mirar com a imatges.
 *
 * PER QUE AIXÒ I NO FFMPEG
 *
 * L'ffmpeg d'aquesta maquina esta trencat (li falta la llibreria
 * libx265.209.dylib). El navegador, en canvi, sap llegir el video, i amb
 * Playwright en podem capturar els fotogrames que vulguem.
 *
 * COM ES FA SERVIR
 *
 *   node scripts/extrau-fotogrames.mjs <video> [quants]
 *
 * El `<video>` es una ruta dins de `public/`, per exemple
 * `/video/ec-preview-video.mp4`. Els fotogrames es desen a `/tmp/fotograma-N.png`.
 *
 * Cal que el servidor estigui engegat (npm run proves) i que el video sigui a
 * `public/`, perque el navegador el carrega per HTTP.
 */

import { chromium } from '@playwright/test';
import fs from 'node:fs';

const ruta = process.argv[2];
const quants = Number(process.argv[3] || 6);

if (!ruta) {
  console.error('Cal dir el video: node scripts/extrau-fotogrames.mjs /video/x.mp4 [quants]');
  process.exit(1);
}

const local = `public${ruta}`;
if (!fs.existsSync(local)) {
  console.error('No trobo el fitxer:', local);
  process.exit(1);
}

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 800 } });
// Cal ser a la pagina per poder demanar el video per HTTP (si no, l'origen
// de la pagina es buit i el navegador no el pot carregar).
await p.goto('http://127.0.0.1:3003/', { waitUntil: 'domcontentloaded', timeout: 60000 });

const dades = await p.evaluate(async (src) => {
  const v = document.createElement('video');
  v.src = src;
  v.muted = true;
  v.playsInline = true;
  v.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;object-fit:contain;background:#fff';
  document.body.innerHTML = '';
  document.body.appendChild(v);

  await new Promise((res, rej) => {
    v.onloadeddata = res;
    v.onerror = () => rej(new Error('el video no carrega'));
    setTimeout(() => rej(new Error('triga massa')), 15000);
  });

  // Buidem la resta de la pagina perque les captures nomes tinguin el video.
  document.body.style.margin = '0';
  return { durada: v.duration, ample: v.videoWidth, alt: v.videoHeight };
});

console.log(`  durada: ${dades.durada.toFixed(2)}s   ${dades.ample}x${dades.alt}`);

for (let i = 0; i < quants; i += 1) {
  const t = (dades.durada * (i + 0.5)) / quants;
  await p.evaluate(async (segon) => {
    const v = document.querySelector('video');
    await new Promise((res) => {
      v.onseeked = res;
      v.currentTime = segon;
      setTimeout(res, 4000);
    });
  }, t);
  await p.waitForTimeout(220);
  const desti = `/tmp/fotograma-${String(i + 1).padStart(2, '0')}.png`;
  await p.screenshot({ path: desti });
  console.log(`  ${desti}  (al segon ${t.toFixed(2)})`);
}

await b.close();
console.log('  fets!');
