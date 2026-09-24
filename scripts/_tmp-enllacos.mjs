// TEMPORAL — no es comita. Els enllacos de colleccions vs la graella de dibuixos.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const mida of ['1920x946', '1440x900', '2560x1440']) {
  const [w, h] = mida.split('x').map(Number);
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?carril=1', { waitUntil: 'load', timeout: 45000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(3500);
  const r = await p.evaluate(() => {
    const rect = (e) => { const b = e.getBoundingClientRect(); return [+b.left.toFixed(1), +b.right.toFixed(1), +b.width.toFixed(1)]; };
    const linia = document.querySelector('[data-colleccions-linia="1"]');
    const botons = linia ? [...linia.querySelectorAll('button')] : [];
    const amples = botons.map((x) => +x.getBoundingClientRect().width.toFixed(1));
    const tira = [...document.querySelectorAll('div')].find((d) => d.style && d.style.width && d.style.width.endsWith('px') && d.querySelectorAll('button').length > 8 && getComputedStyle(d).transform.startsWith('matrix'));
    const retall = tira ? tira.parentElement : null;
    return {
      linia: rect(linia), retallDibuixos: rect(retall),
      primer: botons.length ? rect(botons[0]) : null, ultim: botons.length ? rect(botons[botons.length - 1]) : null,
      quants: botons.length, suma_textos: +amples.reduce((a, c) => a + c, 0).toFixed(1), amples,
      gap: getComputedStyle(linia).columnGap,
      font: getComputedStyle(botons[0]).fontSize,
    };
  });
  console.log(mida, JSON.stringify({ linia: r.linia, retallDibuixos: r.retallDibuixos, primer: r.primer, ultim: r.ultim, suma_textos: r.suma_textos, gap: r.gap, font: r.font }));
  await ctx.close();
}
await b.close();
