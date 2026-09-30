// TEMPORAL (28/09/2026): la pastilla del selector, al llarg del temps: des que
// carrega la pagina, durant l'obertura del cercador i amb scroll. Busca si la
// pastilla canvia de lloc dins de la seva caixa (la "dansa").
// Us: node scripts/_tmp-pastilla-timeline.mjs
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();

// Comença a mostrejar ABANS d'obrir el cercador.
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'commit', timeout: 180000 });
await p.evaluate(() => {
  window.__mostres = [];
  window.__fites = [];
  const t0 = performance.now();
  const pas = () => {
    const bars = [...document.querySelectorAll('[data-stripe-buttonbar]')];
    const bar = bars.find((x) => { const r = x.getBoundingClientRect(); return r.width > 5 && r.height > 5; });
    if (bar) {
      const pastilla = [...bar.querySelectorAll('span')].find((s) => getComputedStyle(s).position === 'absolute' && getComputedStyle(s).backgroundColor === 'rgb(255, 255, 255)');
      if (pastilla) {
        const rb = bar.getBoundingClientRect();
        const rp = pastilla.getBoundingClientRect();
        // En proporcio de la caixa: es el que es veu, i no depen de l'escala.
        window.__mostres.push({
          t: +(performance.now() - t0).toFixed(0),
          topPct: +(((rp.top - rb.top) / rb.height) * 100).toFixed(3),
          altPct: +((rp.height / rb.height) * 100).toFixed(3),
          amplePct: +((rp.width / rb.width) * 100).toFixed(3),
          barH: +rb.height.toFixed(2),
        });
      }
    }
    requestAnimationFrame(pas);
  };
  pas();
});

await p.waitForTimeout(6000);
await p.evaluate(() => window.__fites.push({ que: 'clic cerca', t: performance.now() }));
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
await p.evaluate(() => window.__fites.push({ que: 'scroll avall', t: performance.now() }));
await p.mouse.wheel(0, 600);
await p.waitForTimeout(3000);
await p.evaluate(() => window.__fites.push({ que: 'scroll amunt', t: performance.now() }));
await p.mouse.wheel(0, -600);
await p.waitForTimeout(3000);

const mostres = await p.evaluate(() => window.__mostres);
console.log(`mostres: ${mostres.length}`);

// Els trams on la pastilla esta quieta, i els canvis.
const trams = [];
let actual = null;
for (const m of mostres) {
  const clau = `${m.topPct}|${m.altPct}|${m.amplePct}`;
  if (!actual || actual.clau !== clau) {
    actual = { clau, des: m.t, fins: m.t, topPct: m.topPct, altPct: m.altPct, amplePct: m.amplePct, barH: m.barH };
    trams.push(actual);
  } else {
    actual.fins = m.t;
    actual.barH = m.barH;
  }
}
console.log(`trams amb posicio propia: ${trams.length}`);
console.log('  t_inici  t_fi   dura  topPct   altPct  amplePct  barH');
for (const t of trams) {
  console.log(`  ${String(t.des).padStart(6)} ${String(t.fins).padStart(6)} ${String(t.fins - t.des).padStart(5)}  ${String(t.topPct).padStart(7)} ${String(t.altPct).padStart(7)} ${String(t.amplePct).padStart(8)}  ${t.barH}`);
}
const fites = await p.evaluate(() => window.__fites.map((f) => `${f.que}@${Math.round(f.t)}`));
console.log('fites (t del navegador, no del mostreig):', fites.join(' '));
await b.close();
