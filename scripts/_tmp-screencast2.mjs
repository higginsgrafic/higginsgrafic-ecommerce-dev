// TEMPORAL — no es comiteja. Desplacament vertical de cada peça entre fotogrames
// PINTATS (screencast), relatiu al selector.
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1512, height: 900 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);

const bandes = {
  selector: { x0: 300, x1: 350, y0: 55, y1: 240 },
  colors: { x0: 400, x1: 1000, y0: 148, y1: 186 },
  dibuixos: { x0: 400, x1: 1000, y0: 66, y1: 148 },
  franja: { x0: 400, x1: 1000, y0: 186, y1: 300 },
};
const RANG = 30; // desplaçament maxim a buscar

const cdp = await ctx.newCDPSession(p);
const frames = [];
cdp.on('Page.screencastFrame', async (f) => {
  frames.push({ t: Math.round((f.metadata?.timestamp ?? 0) * 1000), data: f.data });
  try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch { /* ignore */ }
});
await cdp.send('Page.enable');
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 80, everyNthFrame: 1 });
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(2200);
await cdp.send('Page.stopScreencast');
const geo = await p.evaluate(() => {
  const g = (s) => { const el = document.querySelector(s); if (!el) return null; const r = el.getBoundingClientRect(); return `y ${Math.round(r.top)}..${Math.round(r.bottom)} x ${Math.round(r.left)}..${Math.round(r.right)}`; };
  return { sel: g('[data-p2-color-selector] [data-stripe-buttonbar="bn"]'), colors: g('[data-p2-color-grid]'), franja: g('[data-stripe-visual-content="2"]') };
});
await ctx.close();
console.log('geometria final:', JSON.stringify(geo));

// decodifiquem tots els fotogrames
const imgs = [];
for (const f of frames) {
  const { data, info } = await sharp(Buffer.from(f.data, 'base64')).greyscale().raw().toBuffer({ resolveWithObject: true });
  imgs.push({ t: f.t, data, w: info.width, h: info.height });
}
const t0 = imgs.length ? imgs[0].t : 0;
const despl = (A, B, banda) => {
  let millor = null; let millorCost = Infinity;
  for (let d = -RANG; d <= RANG; d += 1) {
    let cost = 0; let n = 0;
    for (let y = banda.y0; y < banda.y1; y += 2) {
      const yy = y + d;
      if (yy < 0 || yy >= A.h) continue;
      for (let x = banda.x0; x < banda.x1; x += 4) {
        cost += Math.abs(A.data[y * A.w + x] - B.data[yy * B.w + x]);
        n += 1;
      }
    }
    if (n > 0) { const c = cost / n; if (c < millorCost) { millorCost = c; millor = d; } }
  }
  return millor;
};
console.log('t(ms)  sel  colors dibuixos franja   (relatius al selector)');
for (let i = 1; i < imgs.length; i += 1) {
  const A = imgs[i - 1]; const B = imgs[i];
  const d = {};
  for (const [nom, banda] of Object.entries(bandes)) d[nom] = despl(A, B, banda);
  console.log(`${String(B.t - t0).padStart(5)}  ${String(d.selector).padStart(3)}  ${String(d.colors).padStart(5)} ${String(d.dibuixos).padStart(7)} ${String(d.franja).padStart(6)}     colors-sel=${d.colors - d.selector} dibuixos-sel=${d.dibuixos - d.selector} franja-sel=${d.franja - d.selector}`);
}
await b.close();
