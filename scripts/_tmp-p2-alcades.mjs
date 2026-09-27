// TEMPORAL — d'on surt l'alcada del megaslide i on acaba cada pagina.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const q = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { y: +x.top.toFixed(1), baix: +(x.top + x.height).toFixed(1), x: +x.left.toFixed(1), h: +x.height.toFixed(1), pad: `${cs.paddingTop}/${cs.paddingBottom}`, marg: `${cs.marginTop}/${cs.marginBottom}`, tr: cs.transform }; };
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const tira = v2.parentElement;          // la tira de pagines (400%)
  const contenidor = tira ? tira.parentElement : null;   // el contenidor amb py-8
  const guard = contenidor ? contenidor.parentElement : null;
  return {
    v1: q(v1), v2: q(v2), tira: q(tira), contenidor: q(contenidor), guard: q(guard),
    guardFill: guard ? [...guard.children].map((c) => `${c.tagName}.${String(c.className).slice(0, 16)} ${JSON.stringify(q(c))}`) : null,
    f1: q(v1.querySelector('[data-stripe-visual-content="1"]')),
    f2: q(v2.querySelector('[data-stripe-visual-content="2"]')),
  };
});
console.log(JSON.stringify(r, null, 1));
await ctx.close(); await b.close();
