import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/austen/looking-for-my-darcy-red-solid?color=irish-green', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(8000);
const r = await p.evaluate(() => {
  const out = [];
  document.querySelectorAll('*').forEach((el) => {
    const bg = getComputedStyle(el).backgroundImage || '';
    if (!bg.includes('mockups') && !bg.includes('darcy')) return;
    const cs = getComputedStyle(el);
    out.push({ q: `${el.tagName}.${(el.className||'').toString().split(/\s+/).slice(0,2).join('.')}`, bg: bg.split('/').slice(-1)[0].slice(0, 60), filtre: cs.filter, opacitat: cs.opacity, barreja: cs.mixBlendMode });
  });
  return out.slice(0, 6);
});
console.log(JSON.stringify(r, null, 1));
await b.close();
