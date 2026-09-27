// TEMPORAL — no es comiteja. Les entrades de les mides de la graella, per finestra.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const CASES = [[1920, 946, 1], [1512, 900, 2], [1440, 800, 1], [1366, 768, 1], [1280, 720, 1], [2560, 1306, 1]];
for (const [w, h, dpr] of CASES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(4000);
  const r = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const crop = v2.querySelector('[data-carrusel="1"] > div');
    const franja = v2.querySelector('[data-stripe-visual-content="2"]');
    const row = v2.querySelector('[data-p2-cercador-row]');
    const cs = getComputedStyle(document.documentElement);
    const g = window.__hgGraella || [];
    const last = g[g.length - 1];
    return {
      carril: Number.parseFloat(cs.getPropertyValue('--hg-mega-w')) || null,
      x: Number.parseFloat(cs.getPropertyValue('--hg-mega-x')) || null,
      escala: Number.parseFloat(cs.getPropertyValue('--hg-escala-mega')) || null,
      layout: document.documentElement.clientWidth,
      cropW: crop ? +crop.getBoundingClientRect().width.toFixed(2) : null,
      cropTop: crop ? +crop.getBoundingClientRect().top.toFixed(2) : null,
      cropH: crop ? +crop.getBoundingClientRect().height.toFixed(2) : null,
      franjaTop: franja ? +franja.getBoundingClientRect().top.toFixed(2) : null,
      franjaL: franja ? +franja.getBoundingClientRect().left.toFixed(2) : null,
      franjaW: franja ? +franja.getBoundingClientRect().width.toFixed(2) : null,
      rowTop: row ? +row.getBoundingClientRect().top.toFixed(2) : null,
      ample: last && last.ample,
      dalt: last && last.dalt,
      sostre: last && last.sostre,
      espai: last && last.espai,
      next: last && last.next,
      primer: g[0] && { ample: g[0].ample, dalt: g[0].dalt, sostre: g[0].sostre, next: g[0].next },
      passos: g.length,
    };
  });
  console.log(`\n=== ${w}x${h} DPR${dpr} ===`);
  console.log(`  carril ${r.carril} x ${r.x} escala ${r.escala} layout ${r.layout}`);
  console.log(`  crop: ample ${r.cropW} alcada ${r.cropH} top ${r.cropTop} | franja top ${r.franjaTop} l ${r.franjaL} w ${r.franjaW} | row top ${r.rowTop}`);
  console.log(`  entrades: ample=${r.ample} dalt=${r.dalt} sostre=${r.sostre} espai=${r.espai}`);
  console.log(`  mides: ${JSON.stringify(r.next)}  (primera passada: ${JSON.stringify(r.primer && r.primer.next)})`);
  console.log(`  sostre-dalt MESURAT: ${r.sostre != null && r.dalt != null ? (r.sostre - r.dalt).toFixed(2) : '—'}  · passos ${r.passos}`);
  await ctx.close();
}
await b.close();
