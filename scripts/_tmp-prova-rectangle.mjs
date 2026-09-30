import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const pila = document.elementsFromPoint(5, 145).slice(0, 6).map((el) => {
    const rr = el.getBoundingClientRect();
    return `${el.tagName}.${(el.className||'').toString().trim().split(/\s+/).slice(0,3).join('.')} [${Math.round(rr.left)},${Math.round(rr.top)} ${Math.round(rr.width)}x${Math.round(rr.height)}] pe=${getComputedStyle(el).pointerEvents} z=${getComputedStyle(el).zIndex}`;
  });
  const rect = [...document.querySelectorAll('[data-stripe-buttonbar-format="rectangle"]')].map((bar) => {
    const rr = bar.getBoundingClientRect();
    const cad = [];
    let x = bar;
    while (x && x !== document.body && cad.length < 8) {
      cad.push(`${x.tagName}.${(x.className||'').toString().trim().split(/\s+/).slice(0,2).join('.')}${x.hasAttribute('aria-hidden') ? '[aria-hidden]' : ''}`);
      x = x.parentElement;
    }
    // Qui mana al centre del seu boto BLANC?
    const bl = bar.querySelector('button[aria-label="Blanc"]');
    const rb = bl.getBoundingClientRect();
    const aDalt = document.elementFromPoint(rb.left + rb.width/2, rb.top + rb.height/2);
    return { caixa: `${Math.round(rr.left)},${Math.round(rr.top)} ${Math.round(rr.width)}x${Math.round(rr.height)}`,
      visibleCS: getComputedStyle(bar).visibility + '/' + getComputedStyle(bar).opacity,
      ariaHiddenAmunt: cad.filter((c) => c.includes('aria-hidden')).length,
      repElClic: aDalt ? `${aDalt.tagName}.${(aDalt.className||'').toString().trim().split(/\s+/).slice(0,2).join('.')}` : null,
      cadena: cad };
  });
  return { pila, rect };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
