import { chromium } from '@playwright/test';
// L'actiu es pot passar per argument (`node scripts/_tmp-offset-pastilles.mjs miscellania`):
// amb la primera colleccio la pastilla s'ancora a dalt; amb l'ultima, a baix.
const actiuArg = process.argv[2] || 'first_contact';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${actiuArg}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const R = (el) => { const r = el.getBoundingClientRect(); return { l: +r.left.toFixed(1), t: +r.top.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; };
  const cela = document.querySelector('[data-taula-vertical="2"] [data-taula-cela="1"]');
  const barra = cela && cela.querySelector('[data-stripe-buttonbar="bn"]');
  const pastillaSel = barra && [...barra.querySelectorAll('span')].find((s) => getComputedStyle(s).position === 'absolute' && getComputedStyle(s).backgroundColor === 'rgb(255, 255, 255)');
  const caixaCol = document.querySelector('[data-colleccions-caixes="1"]');
  const actiu = caixaCol && [...caixaCol.querySelectorAll('button')].find((x) => getComputedStyle(x).backgroundColor === 'rgb(255, 255, 255)');
  const insets = (caixa, fill) => {
    if (!caixa || !fill) return null;
    const c = caixa.getBoundingClientRect(); const f = fill.getBoundingClientRect();
    return { esq: +(f.left - c.left).toFixed(1), dreta: +((c.right) - f.right).toFixed(1), dalt: +(f.top - c.top).toFixed(1), baix: +((c.bottom) - f.bottom).toFixed(1) };
  };
  return {
    selector: { caixa: barra && R(barra), pastilla: pastillaSel && R(pastillaSel), offsets: insets(barra, pastillaSel) },
    colleccions: { caixa: caixaCol && R(caixaCol), pastilla: actiu && R(actiu), offsets: insets(caixaCol, actiu) },
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
