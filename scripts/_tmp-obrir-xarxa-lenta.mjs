// TEMPORAL — no es comiteja. Obrir amb la xarxa lenta (imatges arribant tard).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const perf of ['normal', 'lenta']) {
  const ctx = await b.newContext({ viewport: { width: 1512, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  if (perf === 'lenta') {
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 300, downloadThroughput: 60 * 1024, uploadThroughput: 30 * 1024 });
  }
  await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 240000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => {
    window.__m = [];
    const foto = () => {
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      if (v2) {
        const v = v2.getBoundingClientRect().top;
        const q = (s) => v2.querySelector(s);
        const graella = q('[data-carrusel="1"] > div');
        const row = q('[data-p2-cercador-row]');
        const rel = (el) => (el ? +(el.getBoundingClientRect().top - v).toFixed(2) : null);
        const franja = q('[data-stripe-visual-content="2"]');
        window.__m.push({
          t: Math.round(performance.now()),
          sel: rel(q('[data-p2-color-selector] [data-stripe-buttonbar="bn"]')),
          colors: rel(q('[data-p2-color-grid]')),
          segona: row ? rel(row.children[1]) : null,
          franja: rel(franja),
          hFranja: franja ? +franja.getBoundingClientRect().height.toFixed(2) : null,
          wFranja: franja ? +franja.getBoundingClientRect().width.toFixed(2) : null,
          hRow: row ? +row.getBoundingClientRect().height.toFixed(2) : null,
          hClip: graella ? +graella.getBoundingClientRect().height.toFixed(2) : null,
        });
      }
      if (window.__m.length < 2500) requestAnimationFrame(() => window.setTimeout(foto, 0));
    };
    requestAnimationFrame(() => window.setTimeout(foto, 0));
  });
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(14000);
  const m = (await p.evaluate(() => window.__m)).filter((x) => x.sel != null);
  console.log(`=== xarxa ${perf}  (mostres ${m.length})`);
  let previ = null;
  for (const x of m) {
    const clau = `${x.sel}|${x.colors}|${x.segona}|${x.franja}|${x.hFranja}|${x.wFranja}|${x.hRow}|${x.hClip}`;
    if (clau !== previ) console.log(`  t=${String(x.t).padStart(5)} sel=${String(x.sel).padStart(7)} colors=${String(x.colors).padStart(7)} 2a=${String(x.segona).padStart(7)} franja=${String(x.franja).padStart(7)} hFranja=${x.hFranja} wFranja=${x.wFranja} hRow=${x.hRow} hClip=${x.hClip}`);
    previ = clau;
  }
  await ctx.close();
}
await b.close();
