// TEMPORAL — LA PROVA DEL VEL, casa per casa: amb el full de siluetes (que es
// la tinta que es veu de cada casa) es comprova que el vel pintat cobreix
// EXACTAMENT les cases velades i gens les actives.
//   node scripts/_tmp-vel-check.mjs [active...]
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const FULL = readFileSync('public/placeholders/cercador/full-clic-area-5.svg', 'utf8');
const ACTS = process.argv.slice(2).length ? process.argv.slice(2) : ['first_contact', 'cube', 'miscellania', 'the_human_inside', 'austen'];
const b = await chromium.launch();
for (const act of ACTS) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(3500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
  await p.waitForTimeout(8000);
  const out = await p.evaluate(async (svgTxt) => {
    const W = 2866; const H = 307;
    const v = document.querySelector('[data-mega-page-viewport="2"]');
    const franja = v.querySelector('[data-stripe-visual-content="2"]');
    // 1) l'estat de cada casa (la colleccio del dibuix que porta)
    const tiles = [...franja.querySelectorAll('[data-stripe-tile]')].map((t) => ({
      i: Number(t.getAttribute('data-stripe-tile')),
      col: t.getAttribute('data-stripe-collection'),
    }));
    // 2) el full de siluetes, casa per casa
    const doc = new DOMParser().parseFromString(svgTxt, 'image/svg+xml');
    let paths = [...doc.querySelectorAll('.tshirt-outline')];
    if (paths.length < 14) paths = [...doc.querySelectorAll('path')].filter((x) => x.getAttribute('d')).slice(0, 14);
    if (paths.length !== 14) return [{ casa: -1, col: `full amb ${paths.length} camins`, n: 0, ambVel: 0, pct: 0 }];
    const im2 = new Image();
    im2.src = `data:image/svg+xml,${encodeURIComponent(svgTxt)}`;
    await im2.decode();
    const c2 = document.createElement('canvas'); c2.width = W; c2.height = H;
    const g2 = c2.getContext('2d', { willReadFrequently: true });
    g2.drawImage(im2, 0, 0, W, H);
    const ds = g2.getImageData(0, 0, W, H).data;
    const silueta = (x, y) => ds[(y * W + x) * 4 + 3] > 128;
    // 3) el vel pintat (el data URL), sobre negre
    const velImg = [...franja.querySelectorAll('img')].find((i) => (i.getAttribute('src') || '').startsWith('data:image/svg+xml'));
    let vel = null;
    if (velImg) {
      const im = new Image();
      im.src = velImg.getAttribute('src');
      await im.decode();
      const c3 = document.createElement('canvas'); c3.width = W; c3.height = H;
      const g3 = c3.getContext('2d', { willReadFrequently: true });
      g3.fillStyle = '#000'; g3.fillRect(0, 0, W, H);
      g3.drawImage(im, 0, 0, W, H);
      vel = g3.getImageData(0, 0, W, H).data;
    }
    const teVel = (x, y) => !!vel && vel[(y * W + x) * 4] > 8;
    // 4) recompte per casa
    // 4) recompte per casa, amb la SEVA silueta aillada (cada path del full,
    //    sol): aixi les caixes que es trepitgen no em compten dues cases.
    const res = [];
    for (let k = 0; k < 14; k++) {
      const col = tiles.find((t) => t.i === k)?.col || null;
      const d = paths[k].getAttribute('d');
      const tr = paths[k].getAttribute('transform') || '';
      const un = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><path d="${d}" ${tr ? `transform="${tr}"` : ''}/></svg>`;
      const imk = new Image();
      imk.src = `data:image/svg+xml,${encodeURIComponent(un)}`;
      await imk.decode();
      const ck = document.createElement('canvas'); ck.width = W; ck.height = H;
      const gk = ck.getContext('2d', { willReadFrequently: true });
      gk.drawImage(imk, 0, 0, W, H);
      const dk = gk.getImageData(0, 0, W, H).data;
      let n = 0; let ambVel = 0;
      for (let i = 0; i < dk.length; i += 4) {
        if (dk[i + 3] <= 128) continue;
        const x = (i / 4) % W; const y = Math.floor((i / 4) / W);
        n++;
        if (teVel(x, y)) ambVel++;
      }
      res.push({ casa: k, col, n, ambVel, pct: +(ambVel / (n || 1) * 100).toFixed(1) });
    }
    return res;
  }, FULL);
  if (out[0] && out[0].casa === -1) { console.log(`--- active=${act}: ${out[0].col}`); await ctx.close(); continue; }
  const velegudes = out.filter((r) => r.col && r.col !== act);
  const actives = out.filter((r) => r.col === act);
  const malV = velegudes.filter((r) => r.pct < 95);
  const malA = actives.filter((r) => r.pct > 5);
  console.log(`--- active=${act}`);
  console.log('  ' + out.map((r) => `${r.casa}:${(r.col || '?').slice(0, 6)}=${r.pct}%`).join(' '));
  console.log(`  velades mal cobertes: ${malV.length ? JSON.stringify(malV.map((r) => [r.casa, r.pct])) : 'cap'}` +
    ` | actives tacades: ${malA.length ? JSON.stringify(malA.map((r) => [r.casa, r.pct])) : 'cap'}`);
  await ctx.close();
}
await b.close();
