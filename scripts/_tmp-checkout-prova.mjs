import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
p.on('console', (m) => { if (m.type() === 'error') errors.push(`[console] ${m.text().slice(0, 400)}`); });
p.on('pageerror', (e) => errors.push(`[pageerror] ${String(e.message).slice(0, 500)}\n${String(e.stack || '').split('\n').slice(0, 4).join('\n')}`));
// Anar a una fitxa i afegir al cistell
await p.goto('http://127.0.0.1:3003/austen/quotes-it-is-a-truth', { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
const boto = p.getByText("AFEGEIX AL CISTELL", { exact: false }).first();
if (await boto.count()) {
  await boto.evaluate((n) => { let x = n; while (x && x !== document.body) { if (x.tagName === 'BUTTON' || x.onclick) { x.click(); return; } x = x.parentElement; } n.click(); });
  await p.waitForTimeout(1200);
}
const cart = await p.evaluate(() => localStorage.getItem('cart'));
console.log('cistell desat:', (cart || '').slice(0, 120));
// Anar al checkout
await p.goto('http://127.0.0.1:3003/checkout', { waitUntil: 'networkidle' });
await p.waitForTimeout(3500);
await p.screenshot({ path: '/tmp/_tmp-checkout.png' });
const estat = await p.evaluate(() => ({ url: location.href, text: (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 300) }));
console.log('ESTAT', JSON.stringify(estat, null, 1));
console.log('ERRORS (' + errors.length + '):');
for (const e of [...new Set(errors)].slice(0, 10)) console.log('  ' + e);
await b.close();
