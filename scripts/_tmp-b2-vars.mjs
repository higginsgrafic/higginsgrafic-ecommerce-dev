// TEMPORAL — no es comiteja. B2: les variables del carril dins la filera nova.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const filera = v1.querySelector('[data-filera-p1="1"]');
  const graella = v1.querySelector('[data-graella-files-p1="1"]');
  const carr = v1.querySelector('[data-carrusel="1"]');
  const sel = v1.querySelector('[data-stripe-buttonbar="bn-p1"]');
  const vars = (el, et) => {
    if (!el) return { et };
    const cs = getComputedStyle(el);
    return {
      et,
      escala: cs.getPropertyValue('--hg-escala-mega').trim(),
      megaW: cs.getPropertyValue('--hg-mega-w').trim(),
      fit: cs.getPropertyValue('--hgGridFitScale').trim(),
      fontSize: cs.fontSize,
      w: +el.getBoundingClientRect().width.toFixed(1),
    };
  };
  return {
    html: vars(document.documentElement, 'html'),
    filera: vars(filera, 'filera'),
    graellaWrap: vars(graella, 'graellaWrap'),
    carrusel: vars(carr, 'carrusel'),
    retall: vars(carr?.firstElementChild, 'retall'),
    tira: vars(carr?.firstElementChild?.firstElementChild, 'tira'),
    selector: vars(sel, 'selector'),
    // Les variables definides al root
    rootInline: document.documentElement.getAttribute('style'),
    styleTags: [...document.querySelectorAll('style')].map((s) => (s.textContent || '').includes('--hg-escala-mega')).filter(Boolean).length,
  };
});
console.log(JSON.stringify(r, null, 1));
await ctx.close();
await b.close();
