// TEMPORAL — no es comiteja. Comprova: layoutPanel(franja) = RESERVA_ALCADA + stripeRowPadPx.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const GAP_X_PX = 12;
for (const [w, h] of [[1920, 946], [2000, 1000], [1680, 900], [1512, 900], [1440, 800], [1400, 900], [2560, 1306], [1366, 768], [1280, 720], [1024, 768], [768, 1024]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(4000);
  const r = await p.evaluate(({ GAP_X_PX }) => {
    const root = document.documentElement;
    const num = (n, d) => {
      const v = parseFloat(getComputedStyle(root).getPropertyValue(n));
      return Number.isFinite(v) ? v : d;
    };
    const carril = num('--hg-mega-w', 1350);
    const escala = num('--hg-escala-mega', 1);
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const franja = v2.querySelector('[data-stripe-visual-content="2"]');
    const panel = document.querySelector('[data-mega-panel-surface="1"]');
    const pr = panel.getBoundingClientRect();
    const m = new DOMMatrixReadOnly(getComputedStyle(franja).transform);
    const layoutPanel = +(franja.getBoundingClientRect().top - m.f - pr.top).toFixed(2);
    const reserva = (carril - 8 * GAP_X_PX * escala) / 9 + 13.96;
    // Reserva del bloc de graella del panell (fill del panell amb visibility hidden)
    const bloc = panel.querySelector('[aria-hidden="true"]');
    const blocLayout = bloc ? +bloc.getBoundingClientRect().height.toFixed(2) : null;
    const blocCS = bloc ? getComputedStyle(bloc) : null;
    return {
      carril: +carril.toFixed(2), escala: +escala.toFixed(5),
      layoutPanel, reserva: +reserva.toFixed(2),
      diff: +(layoutPanel - reserva).toFixed(2),
      blocLayout, blocTransform: blocCS ? blocCS.transform : null,
      blocFit: getComputedStyle(root).getPropertyValue('--hgGridFitScale').trim(),
      pad: null,
    };
  }, { GAP_X_PX });
  console.log(`${String(w + 'x' + h).padEnd(10)} carril ${String(r.carril).padStart(7)} esc ${String(r.escala).padStart(8)} | layoutPanel ${String(r.layoutPanel).padStart(7)} reserva ${String(r.reserva).padStart(7)} diff ${String(r.diff).padStart(7)} | bloc ${r.blocLayout} ty ${r.blocTransform} fit ${r.blocFit}`);
  await ctx.close();
}
await b.close();
