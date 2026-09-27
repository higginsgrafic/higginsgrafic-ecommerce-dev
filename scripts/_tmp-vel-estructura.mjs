// TEMPORAL — el vel, despres del canvi: estructura (grups) i repeticio del
// rombe, a les vistes que demana la condicio de parada.
import { chromium } from '@playwright/test';
const ACT = process.argv[2] || 'first_contact';
const b = await chromium.launch();
const casos = [
  { nom: 'escriptori 1920', viewport: { width: 1920, height: 946 } },
  { nom: 'tauleta vertical 768x1024', viewport: { width: 768, height: 1024 } },
  { nom: 'tauleta apaïsada 1024x768', viewport: { width: 1024, height: 768 } },
];
for (const c of casos) {
  const ctx = await b.newContext({ viewport: c.viewport, deviceScaleFactor: 1, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:3003/nova/inici?active=${ACT}`, { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(7000);
  const r = await p.evaluate(() => {
    const out = [];
    for (const pag of ['1', '2']) {
      const v = document.querySelector(`[data-mega-page-viewport="${pag}"]`);
      if (!v) { out.push(`p${pag}: sense vista`); continue; }
      const franjas = [...v.querySelectorAll(`[data-stripe-visual-content="${pag}"]`)];
      out.push(`p${pag}: ${franjas.length} franja/es`);
      franjas.forEach((franja, k) => {
        // el vel: imatge data-url i paths amb fill-opacity
        const vels = [...franja.querySelectorAll('img')].filter((im) => (im.getAttribute('src') || '').startsWith('data:image/svg+xml'));
        for (const im of vels) {
          const s = decodeURIComponent(im.getAttribute('src'));
          const fos = (s.match(/fill-opacity="0?\.\d+"/g) || []).length;
          const grupsOp = (s.match(/<g[^>]*opacity="/g) || []).length;
          const mascara = /mask="url/.test(s);
          out.push(`   franja ${k}: VEL imatge: ${fos} paths amb fill-opacity, ${grupsOp} grups amb opacity, mascara ${mascara ? 'si' : 'no'}`);
        }
        const pathsVel = [...franja.querySelectorAll('path[fill-opacity]')];
        const grupsVel = [...franja.querySelectorAll('g[opacity]')].filter((g) => g.querySelector('path'));
        out.push(`   franja ${k}: VEL svg: ${pathsVel.length} paths amb fill-opacity, ${grupsVel.length} grups amb opacity`);
        // la mascara del contenidor
        for (const el of [franja, ...franja.querySelectorAll('*')]) {
          const cs = getComputedStyle(el);
          const m = cs.maskImage || cs.webkitMaskImage || 'none';
          if (!m || m === 'none') continue;
          if (m.startsWith('url("data:')) {
            const s = decodeURIComponent(m.replace(/^url\("data:image\/svg\+xml,/, '').replace(/"\)$/, ''));
            const fos = (s.match(/fill-opacity="0?\.\d+"/g) || []).length;
            const grupsOp = (s.match(/<g[^>]*opacity="/g) || []).length;
            out.push(`   franja ${k}: MASCARA data-url: ${fos} paths amb fill-opacity, ${grupsOp} grups amb opacity`);
          } else {
            out.push(`   franja ${k}: MASCARA ${m.slice(0, 60)}`);
          }
          break;
        }
      });
    }
    return out.join('\n');
  });
  console.log(`--- ${c.nom}`);
  console.log(r);
  await ctx.close();
}
await b.close();
