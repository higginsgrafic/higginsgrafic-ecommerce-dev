// TEMPORAL (28/09/2026): en clicar una colleccio a la p2 vertical, les seves
// cases de la franja surten seguides i comencen a la casa 0 (la filera de dalt)?
// Us: node scripts/_tmp-colleccio-filera.mjs
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

// Les catorze cases, en ordre, amb la seva colleccio. Files 0-6 = filera de dalt.
const cases = () => p.evaluate(() => {
  const cela = document.querySelector('[data-taula-vertical="2"] [data-taula-cela="6-9+11-14"]');
  return [...cela.querySelectorAll('[data-stripe-tile]')]
    .sort((a, b) => Number(a.getAttribute('data-stripe-tile')) - Number(b.getAttribute('data-stripe-tile')))
    .map((t) => ({ idx: Number(t.getAttribute('data-stripe-tile')), coll: t.getAttribute('data-stripe-collection'), item: t.getAttribute('data-stripe-item') }));
});

const clica = async (prefix) => {
  const i = await p.evaluate((pre) => [...document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')]
    .findIndex((x) => x.textContent.trim().toUpperCase().startsWith(pre)), prefix);
  if (i < 0) return null;
  await p.evaluate((j) => document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')[j].click(), i);
  await p.waitForTimeout(1200);
  return cases();
};

const analitza = (nom, llista) => {
  const actives = llista.filter((c) => c.idx >= 0).map((c) => c.idx);
  const colleccions = [...new Set(llista.map((c) => c.coll))];
  // Les cases de la colleccio activa (la que mes hi surt).
  const comptes = {};
  for (const c of llista) comptes[c.coll] = (comptes[c.coll] || 0) + 1;
  const principal = Object.entries(comptes).sort((a, b) => b[1] - a[1])[0][0];
  const seves = llista.filter((c) => c.coll === principal).map((c) => c.idx);
  const seguides = seves.every((v, i) => i === 0 || v === seves[i - 1] + 1);
  const aDalt = seves.filter((v) => v <= 6).length;
  const aBaix = seves.filter((v) => v >= 7).length;
  console.log(`  ${nom.padEnd(16)} ${principal.padEnd(18)} ${seves.length} cases: [${seves.join(',')}]`);
  console.log(`      comencen a la casa 0: ${seves[0] === 0 ? 'SI' : 'NO (' + seves[0] + ')'}   seguides: ${seguides ? 'SI' : 'NO'}   a dalt: ${aDalt}  a baix: ${aBaix}   (${colleccions.length} colleccions a la franja)`);
  console.log('      cases: ' + llista.map((c) => `${c.idx}:${(c.coll || '?').slice(0, 6)}`).join(' '));
};

console.log('### en carregar (active=first_contact) ###');
analitza('inicial', await cases());

for (const [nom, prefix] of [['PEMBERLEY', 'PEMBERLEY'], ['KEEP CALM', 'KEEP'], ['QUOTES', 'QUOTES'], ['CROSSWORDS', 'CROSSWORDS'], ['LOOKING FOR MY DARCY', 'LOOKING'], ['MISCEL·LANIA', 'MISCEL']]) {
  const r = await clica(prefix);
  if (r) analitza(`clic ${nom}`, r);
}
await b.close();
