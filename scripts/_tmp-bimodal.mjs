// TEMPORAL — no es comiteja. Quant cops el bucle de les files es queda malament?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
let dolents = 0;
let fetes = 0;
for (let i = 1; i <= 6; i += 1) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2200);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(4000);
  const d = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    if (!v2) return null;
    const graella = v2.querySelector('[data-carrusel="1"] > div');
    const bar = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
    const peces = graella ? [...graella.querySelectorAll('button')] : [];
    if (!bar || peces.length < 4) return null;
    const sb = bar.getBoundingClientRect();
    const cella = sb.height / 3;
    const objectius = [sb.top + cella / 2, sb.top + cella * 1.5];
    const files = [[], []];
    peces.forEach((x, k) => files[k % 2].push(x));
    const c = files.map((f) => { const b2 = f[0].getBoundingClientRect(); return b2.top + b2.height / 2; });
    return {
      desv: [+(c[0] - objectius[0]).toFixed(2), +(c[1] - objectius[1]).toFixed(2)],
      inline: [files[0][0].style.top, files[1][0].style.top],
      alcada: +(graella.getBoundingClientRect().height / 2).toFixed(2),
    };
  });
  await ctx.close();
  if (!d) { console.log(`  obertura ${i}: no s'ha pogut mesurar`); continue; }
  fetes += 1;
  const dolent = Math.abs(d.desv[0]) > 1 || Math.abs(d.desv[1]) > 1;
  if (dolent) dolents += 1;
  console.log(`  obertura ${i}: desv=${String(d.desv[0]).padStart(7)}/${String(d.desv[1]).padStart(7)}  top_declarats=${d.inline[0]} / ${d.inline[1]}  alcadaFila=${d.alcada}  ${dolent ? '<-- DESALINEADES' : 'ok'}`);
}
console.log(`mesurades ${fetes}; files desalineades (>1 px): ${dolents}`);
await b.close();
