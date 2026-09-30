// TEMPORAL (28/09/2026): les mides del TEXT de la columna de colleccions de la
// vertical (p2), per poder-les comparar amb la de la p2 horitzontal.
// Us: node scripts/_tmp-text-colleccions.mjs
import { chromium } from '@playwright/test';

const b = await chromium.launch();
for (const [W, H, etq] of [[768, 1024, 'vertical'], [1280, 800, 'horitzontal']]) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(6000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(9000);
  const r = await p.evaluate(() => {
    const R = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10]; };
    const boto = document.querySelector('[data-colleccions-caixes="1"] button')
      || document.querySelector('[data-colleccions-linia="1"] a, [data-colleccions-linia="1"] button');
    if (!boto) return { trobat: false };
    const s = getComputedStyle(boto);
    return {
      trobat: true,
      text: (boto.textContent || '').trim().slice(0, 24),
      fontSize: s.fontSize,
      fontWeight: s.fontWeight,
      fontFamily: s.fontFamily.slice(0, 40),
      textTransform: s.textTransform,
      caixa: R(boto),
      pare: boto.parentElement ? R(boto.parentElement) : null,
    };
  });
  console.log(etq, JSON.stringify(r));
  await ctx.close();
}
await b.close();
