// TEMPORAL: caça de seqüencies on, amb PEMBERLEY o KEEP CALM actius, surtin
// dibuixos de CROSSWORDS a la franja.
import { chromium } from '@playwright/test';
const CROSS = /persuasion|pride-and|sense-and/;
const b = await chromium.launch();
const AMP = Number(process.argv[2] || 768);
const ALT = Number(process.argv[3] || 1024);
const ctx = await b.newContext({ viewport: { width: AMP, height: ALT }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

const estat = () => p.evaluate(() => {
  const col = document.querySelector('[data-colleccions-caixes="1"]');
  const marcada = [...col.querySelectorAll('button')].find((x) => getComputedStyle(x).backgroundColor === 'rgb(255, 255, 255)');
  const cela = document.querySelector('[data-taula-vertical="2"] [data-taula-cela="6-9+11-14"]');
  const tiles = [...cela.querySelectorAll('[data-stripe-tile]')].sort((a, b) => Number(a.getAttribute('data-stripe-tile')) - Number(b.getAttribute('data-stripe-tile')));
  return {
    marcada: marcada ? marcada.textContent.trim() : null,
    dibuixos: tiles.map((t) => { const i = t.querySelector('img'); return i ? (i.getAttribute('src') || '').split('/').pop() : ''; }),
    subs: tiles.map((t) => t.getAttribute('data-stripe-subcollection') || '-'),
  };
});
const clicaReal = async (pre) => {
  const boto = await p.evaluateHandle((x) => {
    const el = [...document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')]
      .find((b) => b.textContent.trim().toUpperCase().startsWith(x));
    return el || null;
  }, pre);
  const el = boto.asElement();
  if (!el) { console.log(`  (no trobo ${pre})`); return; }
  await el.click();          // clic de Playwright, amb ratoli de debò
  await p.waitForTimeout(1200);
};

// La variant del selector, si es demana per argument.
const variantArg = process.argv[4] || null;
if (variantArg) {
  const h = await p.evaluateHandle((v) => [...document.querySelectorAll('[data-taula-vertical="2"] [data-taula-cela="1"] button')]
    .find((x) => x.getAttribute('aria-label') === v) || null, variantArg);
  if (h.asElement()) { await h.asElement().click(); await p.waitForTimeout(1200); console.log(`(selector: ${variantArg})`); }
  else console.log(`(no trobo el boto ${variantArg})`);
}

const sequencies = [
  ['PEMBERLEY'], ['KEEP CALM'],
  ['CROSSWORDS', 'PEMBERLEY'], ['CROSSWORDS', 'KEEP CALM'],
  ['QUOTES', 'PEMBERLEY'], ['PEMBERLEY', 'KEEP CALM'],
  ['PEMBERLEY', 'CROSSWORDS', 'KEEP CALM'],
  ['LOOKING', 'PEMBERLEY'], ['PEMBERLEY', 'QUOTES', 'KEEP CALM'],
  ['KEEP CALM', 'PEMBERLEY'],
];
let trobats = 0;
for (const seq of sequencies) {
  for (const q of seq) await clicaReal(q);
  const e = await estat();
  const cross = e.dibuixos.filter((d) => CROSS.test(d));
  const pemberley = e.dibuixos.filter((d) => /pemberley/.test(d));
  const keep = e.dibuixos.filter((d) => /keep-calm/.test(d));
  const alarma = (e.marcada === 'PEMBERLEY' && cross.length) || (e.marcada === 'KEEP CALM' && cross.length);
  if (alarma) trobats += 1;
  console.log(`${alarma ? 'ALARMA' : '  ok  '} ${AMP}x${ALT} [${seq.join(' > ')}]  marcada=${e.marcada}  crosswords=${cross.length}  pemberley=${pemberley.length}  keepcalm=${keep.length}`);
  if (alarma) console.log('        ' + e.dibuixos.map((d, i) => `${i}:${d.replace('-b-stripe.webp', '').replace('-stripe.webp', '').slice(0, 16)}`).join(' '));
}
console.log(`\ncasos amb alarma: ${trobats}`);
await b.close();
