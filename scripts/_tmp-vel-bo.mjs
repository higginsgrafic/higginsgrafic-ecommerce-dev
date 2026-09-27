// TEMPORAL — no es comiteja. La mascara del vel a les vistes (cobertura per casa).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const cfg of [
  { nom: 'escriptori 1920', viewport: { width: 1920, height: 946 } },
  { nom: 'tauleta vertical 768', viewport: { width: 768, height: 1024 }, isMobile: false },
]) {
  const ctx = await b.newContext({ viewport: cfg.viewport, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(5000);
  const r = await p.evaluate(() => {
    const out = [];
    for (const vista of ['1', '2']) {
      const v = document.querySelector(`[data-mega-page-viewport="${vista}"]`);
      const franja = v?.querySelector(`[data-stripe-visual-content="${vista}"]`);
      if (!franja) { out.push(`p${vista}: sense franja`); continue; }
      const imgs = [...franja.querySelectorAll('img')];
      const vel = imgs.find((im) => {
        const s = im.getAttribute('src') || '';
        return s.startsWith('data:image/svg+xml') && /fill-opacity="0?\.6"/.test(decodeURIComponent(s));
      });
      if (!vel) { out.push(`p${vista}: sense vel`); continue; }
      const svg = decodeURIComponent(vel.getAttribute('src').replace(/^data:image\/svg\+xml,/, ''));
      out.push(`p${vista}: mascara ${/mask="url/.test(svg) ? 'si' : 'NO'} | retall al cos ${/clipPath/.test(svg) ? 'si' : 'NO'} | cases amb vel ${(svg.match(/fill-opacity="0?\.6"/g) || []).length} | cases ACTIVES retallades ${(svg.match(/clip-path="url\(#hgVelSamarretaVisibleCos\)"/g) || []).length}`);
    }
    return out.join('\n');
  });
  console.log(`--- ${cfg.nom}`);
  console.log(r);
  await ctx.close();
}
await b.close();
