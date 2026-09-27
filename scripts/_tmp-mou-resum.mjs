// TEMPORAL — no es comiteja. Resum: es mou la tira de colors DESPRES de ser
// visible? A quina opacitat apareix el vel? Diverses finestres i dos fluxos.
import { chromium } from '@playwright/test';
const b = await chromium.launch();

const mostra = async (w, h, dpr, clica) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
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
        const base = cont ? [...cont.querySelectorAll('img')].find((i) => !i.src.startsWith('data:')) : null;
        window.__m.push({
          t: Math.round(performance.now()),
          op: +Number.parseFloat(getComputedStyle(panell).opacity).toFixed(2),
          colTop: col ? +(col.getBoundingClientRect().top - v).toFixed(2) : null,
          colMt: col ? +Number.parseFloat(getComputedStyle(col).marginTop).toFixed(2) : null,
          velTop: vel ? +(vel.getBoundingClientRect().top - v).toFixed(2) : null,
          baseTop: base ? +(base.getBoundingClientRect().top - v).toFixed(2) : null,
          baseH: base ? +base.getBoundingClientRect().height.toFixed(2) : null,
        });
      }
      if (window.__m.length < 3000) requestAnimationFrame(() => window.setTimeout(foto, 0));
    };
    requestAnimationFrame(() => window.setTimeout(foto, 0));
  });
  await p.goto(`http://127.0.0.1:3003/nova/inici${clica ? '' : '?active=first_contact'}`, { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2200);
  if (clica) await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(5000);
  const m = (await p.evaluate(() => window.__m)).filter((x) => x.colTop != null);
  await ctx.close();
  if (!m.length) { console.log(`${w}x${h} DPR${dpr} ${clica ? 'clic' : 'active'}: cap mostra`); return; }

  // Moviment de la tira de colors NOME'S amb el panell visible (op>0)
  const vis = m.filter((x) => x.op > 0);
  const valors = [...new Set(vis.map((x) => x.colTop))];
  const mov = valors.length > 1 ? `${(Math.max(...valors) - Math.min(...valors)).toFixed(2)} px (${valors.join(' -> ')})` : 'no es mou';
  // Opacitat de la primera mostra amb el vel
  const ambVel = m.find((x) => x.velTop != null);
  const abansVel = m.filter((x) => x.velTop == null && x.op > 0).length;
  // Desalineacio del vel respecte la imatge base
  const desal = ambVel && ambVel.baseTop != null ? +(ambVel.velTop - ambVel.baseTop).toFixed(2) : null;
  console.log(`${String(w + 'x' + h).padEnd(10)} DPR${dpr} ${clica ? 'clic ' : 'activ'} | colors visible: ${mov.padEnd(28)} | vel apareix a op=${ambVel ? ambVel.op : '—'} (mostres visibles sense vel: ${abansVel}) | vel-base = ${desal} | baseH=${ambVel && ambVel.baseH}`);
};

await mostra(1920, 946, 1, true);
await mostra(1920, 946, 1, false);
await mostra(1512, 900, 2, false);
await mostra(2560, 1306, 1, false);
await mostra(1440, 800, 1, true);
await b.close();
