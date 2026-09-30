// TEMPORAL: (a) els dibuixos de la franja de la p2 vertical obren producte DESPRES
// del canvi de pointer-events? (b) els botons del selector de la p1 estan desactivats?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

// (b) els botons dels dos selectors verticals: quin es desactivat?
const bots = await p.evaluate(() => [...document.querySelectorAll('[data-taula-vertical] label, [data-taula-vertical] [data-stripe-buttonbar]')]
  .filter((x) => x.getAttribute('data-stripe-buttonbar'))
  .map((bar) => {
    const cela = bar.closest('[data-taula-cela]');
    const r = bar.getBoundingClientRect();
    return {
      taula: bar.closest('[data-taula-vertical]').getAttribute('data-taula-vertical'),
      cela: cela && cela.getAttribute('data-taula-cela'),
      format: bar.getAttribute('data-stripe-buttonbar-format'),
      caixa: `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`,
      botons: [...bar.querySelectorAll('button')].map((x) => `${x.getAttribute('aria-label')}${x.disabled ? '(desactivat)' : ''}`).join(' '),
    };
  }));
console.log('selectors de les taules verticals:', JSON.stringify(bots, null, 1));

// (a) un dibuix de la franja de la p2, clic real.
const dib = await p.evaluate(() => {
  const cela = document.querySelector('[data-taula-vertical="2"] [data-taula-cela="6-9+11-14"]');
  for (const el of cela.querySelectorAll('.clic-area-overlay .tshirt-outline')) {
    const r = el.getBoundingClientRect();
    if (r.width > 20 && r.height > 20 && r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight) {
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, caixa: `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`, id: el.getAttribute('id') };
    }
  }
  return null;
});
console.log('dibuix de la franja de la p2 a', dib ? `${dib.caixa} (${dib.id})` : 'NO TROBAT');
if (dib) {
  const abans = await p.evaluate(() => location.pathname);
  await p.mouse.click(dib.x, dib.y);
  await p.waitForTimeout(2500);
  const despres = await p.evaluate(() => location.pathname + location.search);
  console.log(`  -> url: ${abans}  =>  ${despres}${despres.includes('/') && despres !== abans && !despres.startsWith('/nova') ? '   OK (obre el producte)' : '   ATENCIO: no sembla que obri producte'}`);
}
await b.close();
