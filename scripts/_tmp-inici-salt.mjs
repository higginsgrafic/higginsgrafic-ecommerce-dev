import { chromium } from 'playwright';
const b = await chromium.launch();
const mides = (p) => p.evaluate(() => {
  const root = getComputedStyle(document.documentElement);
  const cel = document.querySelector('[data-cella="2"]');
  const cel1 = document.querySelector('[data-cella="1"]');
  const carril = (() => { const c = document.createElement('div'); c.style.cssText = 'position:absolute;visibility:hidden;height:0;width:1px'; document.body.appendChild(c); c.style.width = 'var(--inici-nou-carril, 0px)'; const v = parseFloat(getComputedStyle(c).width) || 0; c.remove(); return Math.round(v); })();
  return {
    carril,
    finestra: `${window.innerWidth}x${window.innerHeight}`,
    frontera: root.getPropertyValue('--inici-frontera').trim(),
    megaBottom: root.getPropertyValue('--hg-mega-bottom').trim() || '-',
    cel2: cel ? Math.round(cel.getBoundingClientRect().top) : null,
    cel1h: cel1 ? Math.round(cel1.getBoundingClientRect().height) : null,
  };
});
for (const [w, h] of [[1920, 1080], [1920, 946], [1440, 900], [1440, 766], [1366, 768], [1280, 720], [1024, 768], [768, 1024]]) {
  const p1 = await b.newPage({ viewport: { width: w, height: h } });
  await p1.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'domcontentloaded' });
  await p1.waitForTimeout(2800);
  const tancat = await mides(p1);
  await p1.close();
  const p2 = await b.newPage({ viewport: { width: w, height: h } });
  await p2.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'domcontentloaded' });
  await p2.waitForTimeout(3600);
  const obert = await mides(p2);
  await p2.close();
  console.log(`${tancat.finestra.padEnd(9)} carril=${String(tancat.carril).padStart(4)} | TANCAT frontera=${tancat.frontera.padStart(6)} cel1h=${String(tancat.cel1h).padStart(4)} cel2y=${String(tancat.cel2).padStart(4)} | OBERT megaBottom=${obert.megaBottom.padStart(6)} cel1h=${String(obert.cel1h).padStart(4)} cel2y=${String(obert.cel2).padStart(4)} | salt=${tancat.cel2 - obert.cel2}`);
}
await b.close();
