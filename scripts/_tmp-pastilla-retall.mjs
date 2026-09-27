// TEMPORAL — no es comiteja. La pastilla activa comença 10 px mes a la dreta, i
// el text no s'ha mogut?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const r = await p.evaluate(() => [...document.querySelectorAll('[data-colleccions-targeta]')].map((x) => {
  const bb = x.getBoundingClientRect();
  const span = x.querySelector('span') || x;
  const sb = span.getBoundingClientRect();
  return {
    text: (x.textContent || '').trim(),
    actiu: getComputedStyle(x).backgroundColor !== 'rgba(0, 0, 0, 0)',
    caixaEsq: Math.round(bb.left),
    caixaDreta: Math.round(bb.right),
    fonsEsq: Math.round(bb.left) + (parseFloat(getComputedStyle(x).marginLeft) || 0),
    textDreta: +sb.right.toFixed(1),
  };
}));
for (const x of r) console.log(`${x.text.padEnd(18)} actiu=${String(x.actiu).padEnd(6)} caixa=${x.caixaEsq}..${x.caixaDreta}  fons_esq=${x.fonsEsq}  text_dreta=${x.textDreta}`);
const actiu = r.find((x) => x.actiu);
const altres = r.filter((x) => !x.actiu);
console.log('--- pastilla activa: fons comença', actiu.fonsEsq, '| caixa de les altres:', altres[0].caixaEsq, '| diferencia:', actiu.fonsEsq - altres[0].caixaEsq, 'px');
console.log('--- text (dreta) de l\'activa vs una altra:', actiu.textDreta, altres[0].textDreta);
await b.close();
