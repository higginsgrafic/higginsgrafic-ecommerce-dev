// TEMPORAL — no es comiteja. L'escala del carril arriba tard a 1366?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1366, 768], [1280, 720]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })).newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2200);
  await p.evaluate(() => {
    window.__m = [];
    const foto = () => {
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      if (v2) {
        const sel = v2.querySelector('[data-p2-color-selector] button[aria-label="Color"]');
        window.__m.push({
          t: Math.round(performance.now()),
          escala: getComputedStyle(document.documentElement).getPropertyValue('--hg-escala-mega').trim(),
          carril: getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w').trim(),
          alt: sel ? +sel.getBoundingClientRect().height.toFixed(2) : null,
          top: sel ? +sel.getBoundingClientRect().top.toFixed(2) : null,
        });
      }
      if (window.__m.length < 300) requestAnimationFrame(foto);
    };
    requestAnimationFrame(foto);
  });
  await p.click('svg.lucide-search').catch(() => {});
  await p.waitForTimeout(4000);
  const m = (await p.evaluate(() => window.__m)).filter((x) => x.alt != null);
  console.log(`--- ${w}x${h}`);
  let previ = null;
  for (const x of m) {
    const clau = `${x.escala}|${x.carril}|${x.alt}`;
    if (clau !== previ) console.log(`  t=${String(x.t).padStart(5)} escala=${x.escala} carril=${x.carril} selectorAlt=${x.alt} top=${x.top}`);
    previ = clau;
  }
  await p.close();
}
await b.close();
