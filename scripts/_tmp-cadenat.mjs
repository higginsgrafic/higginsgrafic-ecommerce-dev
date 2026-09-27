// TEMPORAL — no es comiteja. El cadenat del megaslide en el primer clic.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
p.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 120)); });
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
const estat = async (et) => {
  const r = await p.evaluate(() => ({
    surface: !!document.querySelector('[data-mega-panel-surface="1"]'),
    cadenat: !!document.querySelector('button[aria-label="Bloca el megaslide"], button[aria-label="Desbloca el megaslide"]'),
    cadenatY: (() => { const e = document.querySelector('button[aria-label="Bloca el megaslide"], button[aria-label="Desbloca el megaslide"]'); if (!e) return null; const q = e.getBoundingClientRect(); return +q.top.toFixed(1); })(),
    megaBottom: getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-bottom').trim(),
  }));
  console.log(et, JSON.stringify(r));
};
await estat('abans del clic');
await p.click('button:has(svg.lucide-search)').catch((e) => console.log('clic KO', e.message.slice(0, 60)));
for (const t of [500, 1500, 3000, 6000, 9000]) { await p.waitForTimeout(t === 500 ? 500 : t - (t === 1500 ? 500 : t === 3000 ? 1500 : t === 6000 ? 3000 : 6000)); await estat(`+${t}ms`); }
// Segon clic: clica el cercador un altre cop i mira si apareix
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(2500);
await estat('despres del 2n clic');
await ctx.close();
await b.close();
