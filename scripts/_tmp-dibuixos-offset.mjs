// 03/10/2026 — En Marc: «Es dibuixos no estan ben posats a la stripe». Es compara
// el centre de cada dibuix (DOM) amb el centre de la seva samarreta (llegit de la
// imatge de la franja per la transparencia).
import { chromium } from '@playwright/test';

const BASE = 'http://127.0.0.1:3003';
for (const [w, h] of [[1920, 1080], [1366, 946], [1024, 690]]) {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 1500 });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/nova/inici`, { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(8000);
  const r = await p.evaluate(async () => {
    const cont = document.querySelector('[data-stripe-visual-content="2"]');
    const img = [...cont.querySelectorAll('img')].find((e) => /stripe|franja/i.test(e.src) && e.getBoundingClientRect().width > 300);
    const dibuixos = [...cont.querySelectorAll('img')].filter((e) => e.getBoundingClientRect().width > 2 && e !== img);
    // Les caselles (el contenidor de cada dibuix) i el propi dibuix.
    const files = dibuixos.map((e) => {
      const t = e.closest('div[style*="position: absolute"]') || e.parentElement;
      const rt = t.getBoundingClientRect(), rd = e.getBoundingClientRect();
      return { casella: +(rt.left + rt.width / 2).toFixed(1), dibuix: +(rd.left + rd.width / 2).toFixed(1), ample: +rt.width.toFixed(1) };
    }).sort((a, c) => a.casella - c.casella);
    // Les samarretes, de la imatge: columnes amb alfa.
    let samarretes = null;
    if (img) {
      const im = new Image();
      im.crossOrigin = 'anonymous';
      im.src = img.src;
      await im.decode();
      const c = document.createElement('canvas');
      c.width = im.naturalWidth; c.height = im.naturalHeight;
      const g = c.getContext('2d');
      g.drawImage(im, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height).data;
      const cols = [];
      for (let x = 0; x < c.width; x++) {
        let n = 0;
        for (let y = 0; y < Math.round(c.height * 0.5); y++) if (d[(y * c.width + x) * 4 + 3] > 24) n++;
        cols.push(n);
      }
      const rangs = []; let ini = null;
      cols.forEach((n, i) => { if (n > 2) { if (ini === null) ini = i; } else if (ini !== null) { rangs.push([ini, i - 1]); ini = null; } });
      if (ini !== null) rangs.push([ini, c.width - 1]);
      const ri = img.getBoundingClientRect();
      samarretes = rangs.filter((x) => x[1] - x[0] > 10).map((x) => +(ri.left + ((x[0] + x[1]) / 2 / c.width) * ri.width).toFixed(1));
    }
    return { files: files.slice(0, 14), samarretes, nCaselles: files.length };
  });
  console.log(`--- ${w}x${h}`);
  console.log('  caselles ', JSON.stringify(r.files.map((f) => f.casella)));
  console.log('  dibuixos ', JSON.stringify(r.files.map((f) => f.dibuix)));
  console.log('  samarretes', JSON.stringify(r.samarretes));
  const off = (r.samarretes || []).map((s, i) => (r.files[i] ? +(r.files[i].dibuix - s).toFixed(1) : null));
  console.log('  desplacament dibuix-samarreta', JSON.stringify(off));
  await b.close();
}
