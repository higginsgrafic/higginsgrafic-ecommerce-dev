import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: Number(process.env.W || 1440), height: Number(process.env.H || 900) } });
await p.goto((process.env.BASE || 'http://127.0.0.1:3003') + '/', { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
await p.locator('header').getByText('First Contact', { exact: true }).first().click({ force: true });
const t0 = Date.now();
for (let i = 0; i < 14; i++) {
  const t = Date.now() - t0;
  const d = await p.evaluate(() => {
    const h = document.querySelector('header');
    const surf = document.querySelector('[data-mega-panel-surface="1"]');
    const cadenat = [...document.querySelectorAll('body > div')].find((el) => el.querySelector('button[aria-label*="megaslide"]'));
    const cs = cadenat ? getComputedStyle(cadenat) : null;
    return {
      headerBg: getComputedStyle(h).backgroundColor,
      headerH: Math.round(h.getBoundingClientRect().height),
      surf: surf ? getComputedStyle(surf).opacity : '-',
      cadenat: cadenat ? `${cs.opacity}` : 'NO',
    };
  });
  console.log(`t=${String(t).padStart(4)}ms headerBg=${d.headerBg} h=${d.headerH} surf.op=${d.surf} cadenat=${d.cadenat}`);
  if (i === 3) await p.screenshot({ path: '/tmp/_tmp-obertura-pausa.png' });
  if (i === 9) await p.screenshot({ path: '/tmp/_tmp-obertura-final.png' });
  await p.waitForTimeout(90);
}
await b.close();
