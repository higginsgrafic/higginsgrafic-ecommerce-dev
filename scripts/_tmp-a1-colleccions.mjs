// TEMPORAL — no es comiteja. A1: la columna de colleccions de la p2 (escriptori)
// i la taula de caixes (vista vertical). Xifres d'abans del canvi.
import { chromium } from '@playwright/test';

const url = 'http://127.0.0.1:3003/nova/inici?active=first_contact';

async function obre(p, w, h) {
  await p.setViewportSize({ width: w, height: h });
  await p.goto(url, { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(3000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(5000);
}

const b = await chromium.launch();

// (1) ESCRIPTORI 1920x946: la columna de la dreta (casella 3).
{
  const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await obre(p, 1920, 946);
  const r = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const btns = [...v2.querySelectorAll('button.font-roboto-condensed')].filter((x) => /FIRST CONTACT|CUBE|MISCEL/.test(x.textContent || ''));
    const col = btns[0]?.parentElement;
    const cb = col?.getBoundingClientRect();
    const linies = btns.map((x) => {
      const q = x.getBoundingClientRect();
      const cs = getComputedStyle(x);
      return {
        t: (x.textContent || '').trim(),
        x: +q.left.toFixed(1), y: +q.top.toFixed(1), w: +q.width.toFixed(1), h: +q.height.toFixed(1),
        bg: cs.backgroundColor, fw: cs.fontWeight, fs: cs.fontSize,
      };
    });
    const act = btns.find((x) => x.getAttribute('aria-current') === 'true') || btns[0];
    const ac = act?.getBoundingClientRect();
    return {
      col: cb ? { x: +cb.left.toFixed(1), y: +cb.top.toFixed(1), w: +cb.width.toFixed(1), h: +cb.height.toFixed(1) } : null,
      linies,
      actiu: act ? ((act.textContent || '').trim()) : null,
      actiuBox: ac ? { x: +ac.left.toFixed(1), y: +ac.top.toFixed(1), w: +ac.width.toFixed(1), h: +ac.height.toFixed(1) } : null,
    };
  });
  console.log('=== ESCRIPTORI 1920x946 (columna de colleccions de la p2) ===');
  console.log('columna:', JSON.stringify(r.col));
  console.log('actiu:', r.actiu, JSON.stringify(r.actiuBox));
  console.table(r.linies);
  await ctx.close();
}

// (2) VERTICAL 900x1200: la taula de caixes.
{
  const ctx = await b.newContext({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await obre(p, 900, 1200);
  const r = await p.evaluate(() => {
    const taula = document.querySelector('[data-colleccions-caixes="1"]');
    if (!taula) return null;
    const tb = taula.getBoundingClientRect();
    const fills = [...taula.children].map((x) => {
      const q = x.getBoundingClientRect();
      const cs = getComputedStyle(x);
      return {
        t: (x.textContent || '').trim(),
        y: +q.top.toFixed(1), w: +q.width.toFixed(1), h: +q.height.toFixed(1),
        bg: cs.backgroundColor,
      };
    });
    return { box: { x: +tb.left.toFixed(1), y: +tb.top.toFixed(1), w: +tb.width.toFixed(1), h: +tb.height.toFixed(1) }, fills };
  });
  console.log('=== VERTICAL 900x1200 (data-colleccions-caixes) ===');
  console.log(JSON.stringify(r, null, 1));
  await ctx.close();
}

await b.close();
