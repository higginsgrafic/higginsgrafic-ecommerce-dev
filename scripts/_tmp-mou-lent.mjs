// TEMPORAL — no es comiteja. Amb la CPU alentida (com la maquina de l'amo):
// es mou la tira de colors amb el panell visible? A quina opacitat apareix el vel?
import { chromium } from '@playwright/test';
const b = await chromium.launch();

const mostra = async (w, h, clica, rate, run) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate });
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
        window.__m.push({
          t: Math.round(performance.now()),
          op: +Number.parseFloat(getComputedStyle(panell).opacity).toFixed(2),
          colTop: col ? +(col.getBoundingClientRect().top - v).toFixed(2) : null,
          colMt: col ? +Number.parseFloat(getComputedStyle(col).marginTop).toFixed(2) : null,
          vel: vel ? +(vel.getBoundingClientRect().top - v).toFixed(2) : null,
        });
      }
      if (window.__m.length < 4000) requestAnimationFrame(() => window.setTimeout(foto, 0));
    };
    requestAnimationFrame(() => window.setTimeout(foto, 0));
  });
  await p.goto(`http://127.0.0.1:3003/nova/inici${clica ? '' : '?active=first_contact'}`, { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2500);
  if (clica) await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(7000);
  const m = (await p.evaluate(() => window.__m)).filter((x) => x.colTop != null);
  await ctx.close();
  if (!m.length) { console.log(`${run}: cap mostra`); return; }
  const vis = m.filter((x) => x.op > 0);
  const valors = [...new Set(vis.map((x) => x.colMt))];
  const mov = valors.length > 1 ? `${(Math.max(...valors) - Math.min(...valors)).toFixed(2)} px (${valors.join(' -> ')})` : 'no es mou';
  const ambVel = m.find((x) => x.vel != null);
  const visSenseVel = m.filter((x) => x.vel == null && x.op > 0).length;
  console.log(`${w}x${h} ${clica ? 'clic ' : 'activ'} x${rate} run${run} | colors visible: ${mov.padEnd(30)} | vel a op=${ambVel ? ambVel.op : '—'} (visibles sense vel: ${visSenseVel})`);
};

for (let i = 1; i <= 3; i++) await mostra(1920, 946, false, 6, i);
for (let i = 1; i <= 2; i++) await mostra(1920, 946, true, 6, i);
await b.close();
