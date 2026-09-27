// TEMPORAL — no es comiteja. Captura el que ES PINTA (screencast) i mesura, a
// cada fotograma pintat, on cau la tinta de cada peça respecte del selector.
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import fs from 'node:fs';

const W = 1512; const H = 900;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);

const cdp = await ctx.newCDPSession(p);
const marc = await p.evaluate(() => {
  const g = (s) => { const el = document.querySelector(s); if (!el) return null; const r = el.getBoundingClientRect(); return { x0: Math.round(r.left), x1: Math.round(r.right), y0: Math.round(r.top), y1: Math.round(r.bottom) }; };
  return {
    selector: g('[data-p2-color-selector] [data-stripe-buttonbar="bn"]'),
    colors: g('[data-p2-color-grid]'),
    franja: g('[data-stripe-visual-content="2"]'),
  };
});
// El panell encara es tancat: els marcs no hi son. Els mesurem DESPRES d'obrir
// en una primera passada i tornem a comencar. (Si no hi son, fem servir franges
// generoses.)
const franges = {
  selector: { x0: 1280, x1: 1400, y0: 30, y1: 320 },
  colors: { x0: 380, x1: 1280, y0: 120, y1: 260 },
  dibuixos: { x0: 380, x1: 900, y0: 40, y1: 130 },
  franja: { x0: 380, x1: 1300, y0: 130, y1: 340 },
};

const frames = [];
cdp.on('Page.screencastFrame', async (f) => {
  frames.push({ t: Math.round((f.metadata?.timestamp ?? 0) * 1000), data: f.data });
  try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch { /* ignore */ }
});
await cdp.send('Page.enable');
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 70, everyNthFrame: 1 });
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(2500);
await cdp.send('Page.stopScreencast');
await ctx.close();

const t0 = frames.length ? frames[0].t : 0;
const analisi = [];
for (const [i, f] of frames.entries()) {
  const img = sharp(Buffer.from(f.data, 'base64'));
  const { data, info } = await img.greyscale().raw().toBuffer({ resolveWithObject: true });
  const inkTop = (banda) => {
    for (let y = banda.y0; y < Math.min(banda.y1, info.height); y += 1) {
      for (let x = banda.x0; x < Math.min(banda.x1, info.width); x += 1) {
        if (data[y * info.width + x] < 240) return y;
      }
    }
    return null;
  };
  const r = {};
  for (const [nom, banda] of Object.entries(franges)) r[nom] = inkTop(banda);
  analisi.push({ i, t: f.t - t0, ...r });
}
console.log(`fotogrames pintats: ${frames.length}`);
let previ = '';
for (const a of analisi) {
  if (a.t < -200) continue;
  const rel = (x) => (a.selector != null && a[x] != null ? a[x] - a.selector : null);
  const clau = `${a.selector}|${a.colors}|${a.dibuixos}|${a.franja}`;
  if (clau === previ) continue;
  previ = clau;
  console.log(`t=${String(a.t).padStart(5)} sel=${a.selector} colors=${a.colors}(rel ${rel('colors')}) dibuixos=${a.dibuixos}(rel ${rel('dibuixos')}) franja=${a.franja}(rel ${rel('franja')})`);
}
await b.close();
