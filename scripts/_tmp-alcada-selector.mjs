// TEMPORAL — no es coiteja. Quina alcada te la pastilla blanca (l'actiu) de la
// columna de colleccions i la del selector BLANC/COLOR/NEGRE.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w,h] of [[1920,946],[1440,900],[1366,768],[1024,768],[2560,1306]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(4000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(9000);
  const r = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const col = v2.querySelector('[data-colleccions-targeta]')?.parentElement;
    const activa = [...v2.querySelectorAll('[data-colleccions-targeta]')].find((x) => x.getAttribute('aria-current') === 'true');
    const bands = [...v2.querySelectorAll('[data-colleccions-targeta]')];
    const sel = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
    const slider = sel ? [...sel.children].find((c) => c.tagName === 'SPAN') : null;
    const q = (e) => { if (!e) return null; const r2 = e.getBoundingClientRect(); return +r2.height.toFixed(2); };
    return {
      columna: q(col),
      banda: bands.length ? +(bands[0].getBoundingClientRect().height).toFixed(2) : null,
      caixaBlanca: q(activa),
      textActiu: activa ? q(activa.querySelector('span')) : null,
      selectorBlanc: slider ? q(slider) : null,
      contenidorSelector: q(sel),
      noms: bands.length,
    };
  });
  console.log(`${w}x${h}`, JSON.stringify(r));
  await ctx.close();
}
await b.close();
