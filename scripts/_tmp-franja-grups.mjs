import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: Number(process.env.W || 1960), height: Number(process.env.H || 839) } });
await p.goto((process.env.URL || 'http://127.0.0.1:3003/austen/quotes-it-is-a-truth?active=austen'), { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);

const clica = async (text) => {
  const el = p.locator('[data-mega-panel-surface="1"]').getByText(text, { exact: true }).first();
  if (!(await el.count())) return false;
  await el.evaluate((n) => {
    let x = n;
    while (x && x !== document.body) {
      if (x.tagName === 'BUTTON' || x.tagName === 'A' || x.onclick) { x.click(); return; }
      x = x.parentElement;
    }
    n.click();
  });
  await p.waitForTimeout(900);
  return true;
};

const estat = () => p.evaluate(() => {
  const g = window.__HG_STRIPE_INACTIUS__ || {};
  const inact = new Set(Array.isArray(g.inactius) ? g.inactius : []);
  const actives = [...Array(14).keys()].filter((i) => !inact.has(i));
  return { active: g.active, sub: g.sub, offset: g.offset, actives, nActives: actives.length };
});

const grups = (process.env.GRUPS || 'PEMBERLEY|KEEP CALM|QUOTES|CROSSWORDS|LOOKING FOR MY D|FIRST CONTACT|THE HUMAN INSIDE|CUBE|MISCEL·LÀNIA').split('|');
for (const g of grups) {
  const ok = await clica(g);
  if (!ok) { console.log(`${g.padEnd(20)} NO TROBAT`); continue; }
  const e = await estat();
  console.log(`${g.padEnd(20)} active=${String(e.active).padEnd(16)} sub=${String(e.sub).padEnd(20)} offset=${String(e.offset).padStart(3)} casosActives=${e.nActives} [${e.actives.join(',')}]`);
}
await p.screenshot({ path: '/tmp/_tmp-franja-final.png' });
await b.close();
