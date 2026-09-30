// DIAGNOSTIC (28/09/2026): la geometria fila a fila de la columna de
// colleccions de la taula vertical, per comprovar on cau la pastilla blanca.
// `node scripts/_tmp-offset-pastilles-files.mjs [actiu]`
import { chromium } from '@playwright/test';

const actiuArg = process.argv[2] || 'first_contact';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${actiuArg}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

const r = await p.evaluate(() => {
  const caixa = document.querySelector('[data-colleccions-caixes="1"]');
  if (!caixa) return { error: 'sense [data-colleccions-caixes]' };
  const c = caixa.getBoundingClientRect();
  const cs = getComputedStyle(caixa);
  const boto = (el) => {
    const b = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      text: el.textContent.trim(),
      top: +(b.top - c.top).toFixed(2),
      bottom: +((c.bottom) - b.bottom).toFixed(2),
      h: +b.height.toFixed(2),
      alignSelf: s.alignSelf,
      marginTop: s.marginTop,
      marginBottom: s.marginBottom,
      blanc: s.backgroundColor === 'rgb(255, 255, 255)',
      actiu: el.getAttribute('aria-current') === 'true',
    };
  };
  return {
    caixa: {
      w: +c.width.toFixed(2),
      h: +c.height.toFixed(2),
      border: cs.borderTopWidth,
      padding: cs.paddingTop,
      boxSizing: cs.boxSizing,
      rows: cs.gridTemplateRows,
      alignContent: cs.alignContent,
      rowGap: cs.rowGap,
    },
    files: [...caixa.querySelectorAll('button')].map(boto),
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
