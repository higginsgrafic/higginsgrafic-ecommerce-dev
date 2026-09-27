import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 45000 });
await p.waitForTimeout(3000);
await p.evaluate(() => {
  window.__log = [];
  const mostra = (etiqueta) => {
    const files = [...document.querySelectorAll('#stripe-guide-stripe-row, #stripe-guide-stripe-row-p1')];
    window.__log.push([etiqueta, ...files.map((f) => {
      const c = f.querySelector('[data-stripe-visual-content]');
      return `${f.id.slice(-3)}:${f.offsetWidth}/${c ? Math.round(c.getBoundingClientRect().width) : '-'}`;
    })]);
  };
  mostra('abans');
  window.__interval = setInterval(() => mostra('t'), 400);
  window.__mostra = mostra;
});
const boto = await p.evaluateHandle(() => [...document.querySelectorAll('header button')].find((e) => /THE HUMAN INSIDE/i.test(e.textContent || '')));
await boto.asElement().click();
await p.waitForTimeout(6000);
const log = await p.evaluate(() => { clearInterval(window.__interval); return window.__log; });
for (const l of log) console.log(JSON.stringify(l));
await b.close();
