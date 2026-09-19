import { chromium } from '@playwright/test';
const BASE = process.env.HG_URL || 'http://127.0.0.1:3003';
const nav = await chromium.launch();
for (const [nom, w, h, touch] of [['1920', 1920, 1080, false], ['1440', 1440, 900, false], ['1280', 1280, 800, false], ['1280 touch', 1280, 800, true], ['1024 tauleta', 1024, 768, true], ['768 tauleta', 768, 1024, true]]) {
  const ctx = await nav.newContext({ viewport: { width: w, height: h }, hasTouch: touch, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(BASE + '/miscellania/pont-del-diable', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(6000);
  const m = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('[data-component="product-card"]')].map((c) => c.getBoundingClientRect())
      .filter((r) => r.width > 0 && r.right > 0 && r.left >= -1 && r.left < window.innerWidth).sort((a, b) => a.left - b.left);
    const cs = getComputedStyle(document.documentElement);
    const t = (s) => [...document.querySelectorAll('*')].find((e) => e.children.length === 0 && e.textContent.trim() === s);
    const specs = t('ESPECIFICACIONS');
    const afegir = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('AFEGEIX'));
    let row = null;
    if (specs && afegir) { let a = specs; while (a && !(a.contains(afegir) && getComputedStyle(a).display === 'grid')) a = a.parentElement; row = a; }
    return {
      lane: +parseFloat(cs.getPropertyValue('--hg-mega-w')).toFixed(0),
      cardW: cards[0] ? +cards[0].width.toFixed(0) : null,
      card1L: cards[0] ? +cards[0].left.toFixed(0) : null,
      tdpL: row ? +row.getBoundingClientRect().left.toFixed(0) : null,
    };
  });
  console.log(nom.padEnd(12), JSON.stringify(m));
  await ctx.close();
}
await nav.close();
