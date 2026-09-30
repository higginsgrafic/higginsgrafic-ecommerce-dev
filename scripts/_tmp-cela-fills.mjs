import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const R = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.left*10)/10, Math.round(r.top*10)/10, Math.round(r.width*10)/10, Math.round(r.height*10)/10]; };
  const cela = document.querySelector('[data-taula-vertical="2"] [data-taula-cela="2-4"]');
  const out = { cela: R(cela), fills: [] };
  if (cela) {
    [...cela.children].forEach((f, i) => out.fills.push({ i, etq: `${f.tagName.toLowerCase()}.${(f.className||'').toString().slice(0,20)}`, box: R(f), nFills: f.children.length }));
    const nets = [...cela.querySelectorAll('*')].slice(0, 22).map((e) => ({ etq: `${e.tagName.toLowerCase()}.${(e.className||'').toString().slice(0,18)}`, box: R(e) }));
    out.nets = nets.filter((n) => n.box && n.box[3] > 3).slice(0, 12);
  }
  return out;
});
console.log(JSON.stringify(r, null, 1));
await b.close();
