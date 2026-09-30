import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const ruta of ['/', '/nova/inici', '/inici', '/nova']) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  try {
    const resp = await p.goto('http://127.0.0.1:3003' + ruta, { waitUntil: 'load', timeout: 60000 });
    await p.waitForTimeout(5000);
    const d = await p.evaluate(() => {
      const c = document.querySelector('[data-hero-caixa="1"]');
      const r = c ? c.getBoundingClientRect() : null;
      return {
        teHero: !!c,
        teMarcInici: !!document.querySelector('[data-taula-inici="1"]'),
        hero: r ? `${+r.top.toFixed(1)}..${+r.bottom.toFixed(1)}` : null,
        baix: r ? +(window.innerHeight - r.bottom).toFixed(1) : null,
        titol: document.title,
      };
    });
    console.log(`${ruta.padEnd(12)} HTTP ${resp?.status()}  hero ${String(d.teHero).padEnd(5)} marc ${String(d.teMarcInici).padEnd(5)} ${String(d.hero).padEnd(18)} baix a ${String(d.baix).padStart(6)}  · ${d.titol}`);
  } catch (e) { console.log(`${ruta.padEnd(12)} error: ${e.message.split('\n')[0]}`); }
  await ctx.close();
}
await b.close();
