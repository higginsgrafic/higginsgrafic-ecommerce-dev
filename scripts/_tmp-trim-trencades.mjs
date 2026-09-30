import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1960, height: 839 } });
const colls = ['first_contact', 'the_human_inside', 'austen', 'cube', 'miscellania'];
const subs = ['PEMBERLEY', 'KEEP CALM', 'QUOTES', 'CROSSWORDS', 'LOOKING FOR MY D'];
const trencades = new Set();
const mira = async () => p.evaluate(() => [...document.querySelectorAll('[data-mega-panel-surface="1"] img')]
  .filter((im) => im.getBoundingClientRect().width > 2 && im.naturalWidth === 0)
  .map((im) => im.getAttribute('src')));
const clica = async (text) => {
  const el = p.locator('[data-mega-panel-surface="1"]').getByText(text, { exact: true }).first();
  if (!(await el.count())) return false;
  await el.evaluate((n) => { let x = n; while (x && x !== document.body) { if (x.tagName === 'BUTTON' || x.tagName === 'A' || x.onclick) { x.click(); return; } x = x.parentElement; } n.click(); });
  await p.waitForTimeout(900);
  return true;
};
for (const c of colls) {
  await p.goto(`http://127.0.0.1:3003/austen/quotes-it-is-a-truth?active=${c}`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(2200);
  (await mira()).forEach((s) => trencades.add(s));
  if (c === 'austen') {
    for (const s of subs) { if (await clica(s)) (await mira()).forEach((x) => trencades.add(x)); }
  }
}
console.log('TRENCADES (' + trencades.size + '):');
for (const t of [...trencades].sort()) console.log('  ' + t);
await b.close();
