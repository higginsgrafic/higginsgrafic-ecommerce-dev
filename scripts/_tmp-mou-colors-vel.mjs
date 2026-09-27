// TEMPORAL — no es comiteja. Que es mou de la TIRA DE COLORS (14x1) i del VEL?
// Mostreig DESPRES de pintar, des del primer fotograma amb pagina 2.
import { chromium } from '@playwright/test';
const b = await chromium.launch();

const mostra = async (run, url, clica) => {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await ctx.addInitScript(() => {
    window.__m = [];
    const foto = () => {
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      const panell = document.querySelector('[data-mega-panel-surface="1"]');
      if (v2 && panell) {
        const v = v2.getBoundingClientRect().top;
        const col = v2.querySelector('[data-p2-color-grid]');
        const cont = v2.querySelector('[data-stripe-visual-content="2"]');
        const vel = cont ? cont.querySelector('img[src^="data:image/svg+xml"]') : null;
        const rel = (el) => (el ? { t: +(el.getBoundingClientRect().top - v).toFixed(2), l: +el.getBoundingClientRect().left.toFixed(2), w: +el.getBoundingClientRect().width.toFixed(2), h: +el.getBoundingClientRect().height.toFixed(2) } : null);
        window.__m.push({
          t: Math.round(performance.now()),
          op: +Number.parseFloat(getComputedStyle(panell).opacity).toFixed(2),
          color: rel(col),
          colTr: col ? getComputedStyle(col).transform : null,
          colMt: col ? getComputedStyle(col).marginTop : null,
          cont: rel(cont),
          contTr: cont ? getComputedStyle(cont).transform : null,
          vel: rel(vel),
          velN: vel ? vel.naturalWidth + 'x' + vel.naturalHeight : null,
        });
      }
      if (window.__m.length < 2000) requestAnimationFrame(() => window.setTimeout(foto, 0));
    };
    requestAnimationFrame(() => window.setTimeout(foto, 0));
  });
  await p.goto(url, { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2200);
  await p.evaluate(() => { window.__marca = Math.round(performance.now()); });
  if (clica) await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(5000);
  const m = (await p.evaluate(() => window.__m)).filter((x) => x.color != null);
  await ctx.close();
  if (!m.length) { console.log(`run ${run}: cap mostra`); return; }
  let previ = null;
  const files = [];
  for (const x of m) {
    const k = `${x.op}|${JSON.stringify(x.color)}|${x.colTr}|${x.colMt}|${x.cont && x.cont.t}|${x.contTr}|${JSON.stringify(x.vel)}`;
    if (k !== previ) {
      files.push(`  t=${String(x.t).padStart(5)} op=${x.op} | COLORS t=${x.color.t} l=${x.color.l} w=${x.color.w} h=${x.color.h} tr="${x.colTr}" mt=${x.colMt} | VEL ${x.vel ? `t=${x.vel.t} l=${x.vel.l} w=${x.vel.w} h=${x.vel.h} nat=${x.velN}` : 'NO HI ES'} | cont.t=${x.cont && x.cont.t} h=${x.cont && x.cont.h} tr="${x.contTr}"`);
    }
    previ = k;
  }
  console.log(`\n=== run ${run} (${clica ? 'clic' : '?active='}) · estats ${files.length} ===`);
  for (const f of files.slice(0, 14)) console.log(f);
};

for (let i = 1; i <= 3; i++) await mostra(i, 'http://127.0.0.1:3003/nova/inici', true);
for (let i = 4; i <= 5; i++) await mostra(i, 'http://127.0.0.1:3003/nova/inici?active=first_contact', false);
await b.close();
