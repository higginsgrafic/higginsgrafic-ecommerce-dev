// TEMPORAL — no es comiteja. El vel, casa per casa: on cau la tinta respecte de la casella.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const act = process.argv[2] || 'miscellania';
const [w, h] = (process.argv[3] || '1920x946').split('x').map(Number);
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(1500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(4500);
const r = await p.evaluate(async () => {
  const taula = document.querySelector('[data-taula-vertical="2"]');
  const franja = (taula || document.querySelector('[data-mega-page-viewport="2"]')).querySelector('[data-stripe-visual-content="2"]');
  const rf = franja.getBoundingClientRect();
  const velImg = [...franja.querySelectorAll('img')].find((im) => {
    const s = im.getAttribute('src') || '';
    return s.startsWith('data:image/svg+xml') && /fill-opacity="0\.6"/.test(decodeURIComponent(s));
  });
  let tinta = null;
  if (velImg) {
    const im = new Image();
    im.src = velImg.getAttribute('src');
    await im.decode();
    const c = document.createElement('canvas');
    c.width = 2866; c.height = 307;
    const g = c.getContext('2d');
    g.clearRect(0, 0, 2866, 307);
    g.drawImage(im, 0, 0, 2866, 307);
    const d = g.getImageData(0, 0, 2866, 307).data;
    tinta = [];
    for (let i = 0; i < 14; i++) {
      const c0 = i * (2866 / 14);
      const c1 = (i + 1) * (2866 / 14);
      let suma = 0; let n = 0; let min = null; let max = null;
      for (let x = 0; x < 2866; x++) {
        for (let y = 0; y < 307; y++) {
          if (d[(y * 2866 + x) * 4 + 3] < 25) continue;
          suma += x; n += 1;
          if (min === null || x < min) min = x;
          if (max === null || x > max) max = x;
        }
      }
      // nome's la tinta DINS la casella (per comparar amb el centre de la casella)
      let sumaDins = 0; let nDins = 0;
      for (let x = Math.floor(c0); x < Math.floor(c1); x++) {
        for (let y = 0; y < 307; y++) {
          if (d[(y * 2866 + x) * 4 + 3] < 25) continue;
          sumaDins += x; nDins += 1;
        }
      }
      tinta.push({ n, centreDins: nDins ? +(sumaDins / nDins).toFixed(1) : null, min, max, nDins });
    }
  }
  const cases = [...franja.querySelectorAll('[data-stripe-tile]')].map((el) => {
    const rr = el.getBoundingClientRect();
    return { i: Number(el.getAttribute('data-stripe-tile')), c: el.getAttribute('data-stripe-collection'), x: rr.left - rf.left, w: rr.width };
  }).sort((a, b2) => a.i - b2.i);
  return { tinta, cases, W: rf.width };
});
console.log(`active=${act} ${w}x${h} franja ${r.W.toFixed(1)}px`);
for (const c of r.cases) {
  const escala = 2866 / r.W;
  const casaCentre = (c.x + c.w / 2) * escala;
  const t = r.tinta ? r.tinta[c.i] : null;
  console.log(`  casa ${String(c.i).padStart(2)} ${String(c.c).padEnd(16)} casella centre ${casaCentre.toFixed(1)} (x${(c.x * escala).toFixed(0)}..${((c.x + c.w) * escala).toFixed(0)}) | tinta dins centre ${t && t.centreDins} (${t && t.min}..${t && t.max}) dif ${t && t.centreDins != null ? (t.centreDins - casaCentre).toFixed(1) : '-'}`);
}
await ctx.close();
await b.close();
