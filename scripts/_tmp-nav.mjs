import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 45000 });
await p.waitForTimeout(3000);
const estat = async (etiqueta) => {
  const r = await p.evaluate(() => {
    const out = {};
    document.querySelectorAll('[data-mega-page-viewport]').forEach((v) => {
      const b = v.getBoundingClientRect();
      out[v.getAttribute('data-mega-page-viewport')] = [+b.left.toFixed(0), +b.width.toFixed(0), !!v.querySelector('[data-stripe-visual-content]')];
    });
    return out;
  });
  console.log(etiqueta, JSON.stringify(r));
};
await estat('inici');
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(3000);
await estat('megamenu obert');
for (const nom of ['THE HUMAN INSIDE', 'AUSTEN', 'CUBE']) {
  await p.hover(`header >> text=${nom}`, { timeout: 4000 }).catch((e) => console.log('hover', nom, e.message.slice(0, 40)));
  await p.waitForTimeout(2500);
  await estat(`hover ${nom}`);
}
await b.close();
