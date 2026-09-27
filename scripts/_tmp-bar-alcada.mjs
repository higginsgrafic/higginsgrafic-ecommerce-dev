// TEMPORAL — no es comiteja. L'alcada i la posicio del bloc del selector de la
// pagina 1 a totes les colleccions (es l'alcada que governa l'alineacio).
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(5000);

const foto = async (et) => {
  const r = await p.evaluate(() => {
    const ba = document.querySelector('[data-mega-page-viewport="1"] [data-stripe-buttonbar="bn"]');
    const rb = ba.getBoundingClientRect();
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const s2 = v2.querySelector('[data-p2-color-selector] button[aria-label="Color"]');
    const f2 = v2.querySelector('[data-p2-cercador-row]');
    const c2 = v2.querySelector('[data-p2-color-grid]');
    const t = (e) => e ? +e.getBoundingClientRect().top.toFixed(2) : null;
    return {
      barra: [+rb.top.toFixed(2), +rb.height.toFixed(2), +rb.width.toFixed(2)],
      bots: [...ba.querySelectorAll('button')].map((x) => x.getAttribute('aria-label')),
      p2selector: t(s2), p2filera: t(f2), p2colors: t(c2),
      p2franja: t(v2.querySelector('[data-stripe-visual-content="2"]')),
    };
  });
  console.log(et.padEnd(16), JSON.stringify(r));
};
await foto('inici');
for (const nom of ['CUBE', 'FIRST CONTACT', 'MISCEL·LÀNIA', 'THE HUMAN INSIDE', 'AUSTEN']) {
  const card = await p.evaluateHandle((n) => [...document.querySelectorAll('[data-colleccions-targeta]')].find((e) => (e.textContent || '').trim().toUpperCase() === n), nom);
  if (!card.asElement()) { console.log(nom.padEnd(16), 'targeta no trobada'); continue; }
  await card.asElement().click();
  await p.waitForTimeout(2500);
  await foto(nom);
}
await b.close();
