// TEMPORAL — no es comiteja. El clic a un dibuix de la graella (actiu i atenuat)
// ha d'obrir la PDP DEL REGISTRE.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));

const prova = async (activa, icona) => {
  await p.goto(`http://127.0.0.1:3003/nova/inici?active=${activa}`, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(2200);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(4500);
  const boto = await p.evaluateHandle((n) => {
    const tots = [...document.querySelectorAll('[data-mega-page-viewport="2"] button')];
    return tots.filter((x) => x.getAttribute('aria-label') === n).pop() || null;
  }, icona);
  if (!boto.asElement()) { console.log(`  ${icona}: boto no trobat`); return; }
  await boto.asElement().click({ timeout: 6000 }).catch((e) => console.log('  clic:', e.message.slice(0, 60)));
  await p.waitForTimeout(3000);
  const r = await p.evaluate(() => ({
    url: location.pathname,
    titol: (document.title || '').slice(0, 48),
    noTro: /no trobat/i.test(document.body.innerText || ''),
  }));
  console.log(`${activa} + "${icona}":`, JSON.stringify(r));
};

await prova('first_contact', 'Robocube');
await prova('cube', 'NX-01');
await prova('cube', 'Persuasion 1');
await prova('first_contact', 'DJ Vader');
console.log('errors de pagina:', errs.length, errs.slice(0, 2));
await b.close();
