// TEMPORAL (28/09/2026): tots els selectors BLANC/COLOR/NEGRE del DOM i la seva
// pastilla, abans i despres de clicar LOOKING FOR MY DARCY. Busca la
// discrepancia entre l'estil de la pastilla i la seva posicio pintada.
// Us: node scripts/_tmp-pastilla-tots.mjs
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

const bolcat = () => p.evaluate(() => {
  const bars = [...document.querySelectorAll('[data-stripe-buttonbar]')].map((bar, i) => {
    const rb = bar.getBoundingClientRect();
    const spans = [...bar.querySelectorAll('span')];
    const pastilla = spans.find((s) => getComputedStyle(s).position === 'absolute' && getComputedStyle(s).backgroundColor === 'rgb(255, 255, 255)');
    const cs = pastilla ? getComputedStyle(pastilla) : null;
    const rp = pastilla ? pastilla.getBoundingClientRect() : null;
    // Qui es veu de debò en el centre de la caixa?
    const el = rb.width > 5 ? document.elementFromPoint(rb.left + rb.width / 2, rb.top + rb.height / 2) : null;
    return {
      i,
      format: bar.getAttribute('data-stripe-buttonbar-format'),
      pare: bar.parentElement ? bar.parentElement.className.slice(0, 40) : null,
      parePosition: bar.parentElement ? getComputedStyle(bar.parentElement).position : null,
      bar: { x: +rb.left.toFixed(1), y: +rb.top.toFixed(1), w: +rb.width.toFixed(1), h: +rb.height.toFixed(1) },
      pastillaInlineTop: pastilla ? pastilla.style.top : null,
      pastillaComputedTop: cs ? cs.top : null,
      pastillaComputedTransition: cs ? cs.transitionProperty + ' ' + cs.transitionDuration : null,
      pastillaPare: pastilla && pastilla.parentElement === bar ? '= bar' : (pastilla ? pastilla.parentElement.tagName : null),
      pastillaRect: rp ? { top: +(rp.top - rb.top).toFixed(2), h: +rp.height.toFixed(2) } : null,
      pastillaTopResoltPct: (rp && rb.height > 5) ? +(((rp.top - rb.top) / rb.height) * 100).toFixed(2) : null,
      aLaMevaCaixa: el === bar || (el && bar.contains(el)) ? 'si' : 'NO (tapat)',
      quiEsVeu: el ? `${el.tagName}.${(el.className || '').toString().slice(0, 30)}` : null,
      desactivats: [...bar.querySelectorAll('button')].filter((x) => x.disabled).map((x) => x.getAttribute('aria-label')),
      seleccionat: [...bar.querySelectorAll('button')].filter((x) => getComputedStyle(x.querySelector('span')).fontWeight === '400').map((x) => x.getAttribute('aria-label')),
    };
  });
  return bars;
});

console.log('=== ABANS ===');
console.log(JSON.stringify(await bolcat(), null, 1));

const idx = await p.evaluate(() => [...document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')]
  .findIndex((x) => x.textContent.trim().toUpperCase().startsWith('LOOKING')));
await p.evaluate((i) => document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')[i].click(), idx);
await p.waitForTimeout(1500);

console.log('\n=== DESPRES (1,5 s) ===');
console.log(JSON.stringify(await bolcat(), null, 1));
await b.close();
