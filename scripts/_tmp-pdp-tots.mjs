// TEMPORAL — no es comiteja. Comprova que cada dibuix de la graella porta a la
// PDP DE DEBO (`/<colleccio>/<ruta>`), la del registre, i que la pagina diu el
// nom del producte.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(1500);

const destins = await p.evaluate(async () => {
  const { dibuixosGraella16x4 } = await import('/src/components/fullwide/CercadorTextRow.jsx');
  const { findPdpUrl } = await import('/src/config/pdpRoutes.js');
  return dibuixosGraella16x4().map((g) => ({
    quem: `${g.collection}/${g.label}`,
    url: findPdpUrl(g.collection, g.label),
  }));
});

const sense = destins.filter((d) => !d.url);
console.log('dibuixos:', destins.length, '· sense URL:', sense.length);
for (const s of sense) console.log('  SENSE:', s.quem);

let dolents = 0;
for (const d of destins) {
  if (!d.url) continue;
  await p.goto('http://127.0.0.1:3003' + d.url, { waitUntil: 'load', timeout: 45000 });
  await p.waitForTimeout(1400);
  const r = await p.evaluate(() => ({
    noTro: /no trobat/i.test(document.body.innerText || ''),
    titol: (document.title || '').slice(0, 45),
    tePdp: /·\s*(FIRST CONTACT|THE HUMAN INSIDE|AUSTEN|CUBE|MISCEL)/.test(document.title || ''),
  }));
  if (r.noTro || !r.tePdp) { dolents++; console.log('  DOLENT', d.quem, '->', d.url, JSON.stringify(r)); }
}
console.log(`provats ${destins.length - sense.length} · dolents ${dolents}`);
await b.close();
