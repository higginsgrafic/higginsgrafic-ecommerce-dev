// TEMPORAL — no es comiteja. Les tres mesures, en una sola passada.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1440, 800]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })).newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2500);
  await p.click('svg.lucide-search').catch(() => {});
  await p.waitForTimeout(4500);
  const d = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const clip = v2.querySelector('[data-carrusel="1"]');
    const graella = clip.querySelector(':scope > div');
    const bar = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
    const peces = [...graella.querySelectorAll('button')];
    const files = [[], []];
    peces.forEach((x, i) => files[i % 2].push(x));
    const rc = (el) => { const b2 = el.getBoundingClientRect(); return { top: b2.top, alt: b2.height, centre: b2.top + b2.height / 2 }; };
    const c = rc(clip);
    const g = rc(graella);
    const t = [[rc(files[0][0]), rc(files[0][1])], [rc(files[1][0]), rc(files[1][1])]];
    const s = rc(bar);
    const objectius = [s.top + (s.alt / 3) / 2, s.top + (s.alt / 3) * 1.5];
    return {
      clip: c, graella: g, bar: s,
      cella: s.alt / 3,
      files: t.map((f) => f.map((x) => ({ top: +(x.top - c.top).toFixed(2), centre: +(x.centre - c.top).toFixed(2) }))),
      objectius: objectius.map((o) => +(o - c.top).toFixed(2)),
      ample: peces[0].getBoundingClientRect().width,
      gapV: +(g.height / 2 - peces[0].getBoundingClientRect().height).toFixed(3),
    };
  });
  console.log(`--- ${w}x${h}`);
  console.log(`  contenidor (retall): alt=${d.clip.alt.toFixed(2)}  amplada peça=${d.ample.toFixed(2)}`);
  console.log(`  selector B/N/C: alt total=${d.bar.alt.toFixed(2)}  cel·la=${d.cella.toFixed(2)}`);
  console.log(`  fila 0: top=${d.files[0][0].top} centre=${d.files[0][0].centre}  (objectiu ${d.objectius[0]})  desviament=${(d.files[0][0].centre - d.objectius[0]).toFixed(2)}`);
  console.log(`  fila 1: top=${d.files[1][0].top} centre=${d.files[1][0].centre}  (objectiu ${d.objectius[1]})  desviament=${(d.files[1][0].centre - d.objectius[1]).toFixed(2)}`);
  console.log(`  separació pintada entre files: ${(d.files[1][0].top - d.files[0][0].top).toFixed(2)}   alcadaFila declarada (retall/2): ${(d.clip.alt / 2).toFixed(2)}   gapV=${d.gapV}`);
  console.log(`  solapament vertical entre peces: ${(d.ample - (d.files[1][0].top - d.files[0][0].top)).toFixed(2)} px`);
  await p.close();
}
await b.close();
