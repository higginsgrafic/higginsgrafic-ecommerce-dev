// TEMPORAL (28/09/2026): on cau el TEXT de cada nom de la columna de
// colleccions, clicant les nou colleccions. Mesura el text (no la caixa del
// boto), que es el que es veu moure.
// Us: node scripts/_tmp-files-moviment.mjs
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 90)); });
p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

const mesura = () => p.evaluate(() => {
  const caixa = document.querySelector('[data-colleccions-caixes="1"]');
  const c = caixa.getBoundingClientRect();
  const centreText = (el) => {
    const r = document.createRange();
    r.selectNodeContents(el);
    const t = r.getBoundingClientRect();
    return {
      mig: +((t.top + t.height / 2) - c.top).toFixed(2),
      migX: +((t.left + t.width / 2) - c.left).toFixed(2),
      alt: +t.height.toFixed(2),
    };
  };
  return [...caixa.querySelectorAll('button')].map((el) => ({
    text: el.textContent.trim(),
    ...centreText(el),
    arc: el.getAttribute('aria-current') === 'true',
  }));
});

const base = await mesura();
const noms = base.map((f) => f.text);
const estats = [];
for (let i = 0; i < noms.length; i += 1) {
  await p.evaluate((idx) => {
    document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')[idx].click();
  }, i);
  await p.waitForTimeout(2500);
  estats.push(await mesura());
}

console.log('--- on cau el centre del TEXT de cada nom (px des del top de la caixa) ---');
console.log('    ' + noms.map((n) => n.slice(0, 6).padStart(7)).join(''));
for (let e = 0; e < estats.length; e += 1) {
  const actiu = estats[e].findIndex((f) => f.arc);
  console.log(`  ${String(e)} ` + estats[e].map((f, i) => `${f.mig.toFixed(2)}${i === actiu ? '*' : ' '}`.padStart(7)).join(''));
}

console.log('\n--- recorregut de cada nom (max - min), vertical i horitzontal ---');
let pitjor = 0;
let pitjorX = 0;
for (let i = 0; i < noms.length; i += 1) {
  const v = estats.map((s) => s[i].mig);
  const x = estats.map((s) => s[i].migX);
  const min = Math.min(...v); const max = Math.max(...v);
  const rec = +(max - min).toFixed(2);
  const recX = +(Math.max(...x) - Math.min(...x)).toFixed(2);
  if (rec > pitjor) pitjor = rec;
  if (recX > pitjorX) pitjorX = recX;
  console.log(`  fila ${i} ${noms[i].padEnd(22)} min=${min.toFixed(2).padStart(7)} max=${max.toFixed(2).padStart(7)} es mou=${rec.toFixed(2)} px  | X es mou=${recX.toFixed(2)} px${rec > 0 ? '  <== ES MOU' : ''}`);
}
console.log(`\nRECORREGUT MAXIM D'UN NOM: ${pitjor.toFixed(2)} px vertical, ${pitjorX.toFixed(2)} px horitzontal`);
console.log('errors de consola:', errors.length ? errors.join(' | ') : 'cap');
await b.close();
