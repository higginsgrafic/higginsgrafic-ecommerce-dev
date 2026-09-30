// TEMPORAL — on cau la columna de colleccions respecte les guies del carril.
import { chromium } from '@playwright/test';

const VISTES = [[1920, 946], [1680, 1050], [1512, 982], [1440, 900], [1366, 768], [1280, 720], [1200, 800], [1024, 768]];

const b = await chromium.launch();
for (const [w, h] of VISTES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  try {
    await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
    await p.waitForTimeout(3500);
    await p.click('button:has(svg.lucide-search)').catch(() => {});
    await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
    await p.waitForTimeout(8000);
    const r = await p.evaluate(() => {
      const box = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return { l: +x.left.toFixed(1), r: +x.right.toFixed(1), w: +x.width.toFixed(1) }; };
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      const enllacos = [...v2.querySelectorAll('[data-colleccions-targeta="1"]')];
      const primer = enllacos[0];
      const ultim = enllacos[enllacos.length - 1];
      // La caixa de la columna: el pare que porta la vora (el contenidor amb radi).
      let columna = primer;
      while (columna && getComputedStyle(columna).borderTopWidth === '0px') columna = columna.parentElement;
      const cs = getComputedStyle(document.documentElement);
      const carrilX = Number.parseFloat(cs.getPropertyValue('--hg-mega-x'));
      const carrilW = Number.parseFloat(cs.getPropertyValue('--hg-mega-w'));
      const fletxa = document.getElementById('stripe-guide-right-arrow');
      const franja = v2.querySelector('[data-stripe-visual-content="2"]');
      const sd = document.querySelector('[data-mega-panel-surface]');
      return {
        carrilX: +carrilX.toFixed(1), carrilD: +(carrilX + carrilW).toFixed(1), carrilW: +carrilW.toFixed(1),
        fletxa: fletxa ? +fletxa.getBoundingClientRect().right.toFixed(1) : null,
        columna: box(columna), primer: box(primer), ultim: box(ultim),
        franja: box(franja), panel: box(sd), nEnllacos: enllacos.length,
      };
    });
    console.log(`${w}x${h}  carril ${r.carrilX}..${r.carrilD} (${r.carrilW})  fletxa=${r.fletxa}  panel ${r.panel.l}..${r.panel.r}`);
    console.log(`     columna ${JSON.stringify(r.columna)}  text ${r.primer.l}..${r.ultim.r}  (${r.nEnllacos} enllacos)  franja ${JSON.stringify(r.franja)}`);
  } catch (e) {
    console.log(`${w}x${h}  ERROR ${e.message.split('\n')[0]}`);
  } finally {
    await ctx.close();
  }
}
await b.close();
