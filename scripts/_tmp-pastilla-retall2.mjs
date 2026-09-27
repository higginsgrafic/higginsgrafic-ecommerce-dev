// TEMPORAL — no es comiteja. On comença el FONS de la pastilla activa (es el que
// es retalla) i on acaba el text (no s'ha de moure). El text es mesura amb un
// Range, perque el boto no te cap fill d'elements.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const r = await p.evaluate(() => [...document.querySelectorAll('[data-colleccions-targeta]')].map((x) => {
  const s = getComputedStyle(x);
  const bb = x.getBoundingClientRect();
  const bl = parseFloat(s.borderLeftWidth) || 0;
  // El text: el contingut del boto, amb un Range.
  const rg = document.createRange();
  rg.selectNodeContents(x);
  const tb = rg.getBoundingClientRect();
  return {
    text: (x.textContent || '').trim(),
    actiu: s.backgroundColor !== 'rgba(0, 0, 0, 0)',
    caixaEsq: +bb.left.toFixed(1),
    caixaDreta: +bb.right.toFixed(1),
    voraEsq: bl,
    fonsEsq: +(bb.left + bl).toFixed(1),
    textDreta: +tb.right.toFixed(1),
    textEsq: +tb.left.toFixed(1),
  };
}));
for (const x of r) console.log(`${x.text.padEnd(18)} actiu=${String(x.actiu).padEnd(6)} caixa=${x.caixaEsq}..${x.caixaDreta} voraEsq=${x.voraEsq} fons_esq=${x.fonsEsq} text=${x.textEsq}..${x.textDreta}`);
const actiu = r.find((x) => x.actiu);
const altres = r.filter((x) => !x.actiu);
console.log('--- fons de l\'activa comença a', actiu.fonsEsq, '| caixa de les altres a', altres[0].caixaEsq, '| retall:', +(actiu.fonsEsq - altres[0].caixaEsq).toFixed(1), 'px');
console.log('--- text: activa', actiu.textEsq + '..' + actiu.textDreta, '| altra', altres[0].textEsq + '..' + altres[0].textDreta);
await b.close();
