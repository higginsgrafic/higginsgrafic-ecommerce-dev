import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push('PAGEERROR ' + String(e).slice(0, 160)));
p.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE ' + m.text().slice(0, 160)); });
p.on('response', (r) => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url().slice(0, 90)}`); });
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 45000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(4500);
// Fer activa una colleccio curta perque els veins es vegin a la finestra
const card = await p.evaluateHandle(() => [...document.querySelectorAll('[data-colleccions-targeta]')]
  .find((e) => /MISCEL/i.test(e.textContent || '')));
await card.asElement().click();
await p.waitForTimeout(1200);
const abans = await p.evaluate(() => ({
  url: location.href,
  actius: document.querySelectorAll('[data-p2-color-grid]').length,
}));
// Clicar una icona ATENUADA visible
const atenuada = await p.evaluateHandle(() => {
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  const tira = v.querySelector('[data-carrusel="1"] > div').firstElementChild;
  const totes = [...tira.querySelectorAll('button')];
  return totes.slice(0, totes.length / 2).find((x) => x.style.opacity === '0.24'
    && x.getBoundingClientRect().left > 456 && x.getBoundingClientRect().right < 1309);
});
const el = atenuada.asElement();
console.log('abans', JSON.stringify(abans));
if (el) {
  console.log('icona', await el.getAttribute('title'));
  await el.click();
  await p.waitForTimeout(2500);
  const despres = await p.evaluate(() => ({
    url: location.href,
    activa: [...document.querySelectorAll('[data-colleccions-targeta]')].filter((e) => e.getAttribute('aria-current') === 'true').map((e) => e.textContent.trim()),
    vista2: !!document.querySelector('[data-mega-page-viewport="2"]'),
    notfound: /404|no trobat|not found/i.test(document.body.innerText.slice(0, 400)),
  }));
  console.log('despres', JSON.stringify(despres));
} else {
  console.log('cap icona atenuada visible');
}
console.log('errors', JSON.stringify(errors.slice(0, 4), null, 1));
await b.close();
