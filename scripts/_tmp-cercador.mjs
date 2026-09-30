import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1960, height: 839 } });
await p.goto('http://127.0.0.1:3003/austen/quotes-it-is-a-truth', { waitUntil: 'networkidle' });
await p.waitForTimeout(2200);
await p.locator('button[aria-label="Cercador i catàleg"]').first().click({ force: true });
await p.waitForTimeout(2500);
await p.screenshot({ path: '/tmp/_tmp-cercador.png' });
const estat = (etq) => p.evaluate((e) => {
  const g = window.__HG_STRIPE_INACTIUS__ || {};
  const inact = new Set(Array.isArray(g.inactius) ? g.inactius : []);
  const act = [...Array(14).keys()].filter((i) => !inact.has(i));
  return `${e}: active=${g.active} sub=${g.sub} offset=${g.offset} actives=[${act.join(',')}]`;
}, etq).then((s) => console.log(s));
await estat('cercador');
// Clicar QUOTES a la llista del cercador
const q = p.locator('[data-mega-panel-surface="1"]').getByText('QUOTES', { exact: true }).first();
if (await q.count()) {
  await q.evaluate((n) => { let x = n; while (x && x !== document.body) { if (x.tagName === 'BUTTON' || x.tagName === 'A' || x.onclick) { x.click(); return; } x = x.parentElement; } n.click(); });
  await p.waitForTimeout(1300);
  await estat('QUOTES  ');
  await p.screenshot({ path: '/tmp/_tmp-cercador-quotes.png' });
}
// Clicar un dibuix de la graella intercalada
const img = p.locator('[data-mega-panel-surface="1"] img[src*="austen/quotes"]').first();
if (await img.count()) {
  await img.evaluate((n) => { let x = n; while (x && x !== document.body) { if (x.tagName === 'BUTTON' || x.tagName === 'A' || x.onclick) { x.click(); return; } x = x.parentElement; } n.click(); });
  await p.waitForTimeout(1300);
  await estat('dibuix  ');
}
await b.close();
