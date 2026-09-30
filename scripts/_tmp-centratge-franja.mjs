import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const cela = document.querySelector('[data-taula-vertical="2"] [data-taula-cela="6-9+11-14"]');
  const files = [{ n: 'filera 1 (idx 0-6)', dx: [], dy: [] }, { n: 'filera 2 (idx 7-13)', dx: [], dy: [] }];
  if (!cela) return files;
  [...cela.querySelectorAll('[data-stripe-tile]')].forEach((tile) => {
    const idx = Number(tile.getAttribute('data-stripe-tile'));
    const img = tile.querySelector('img');
    if (!Number.isFinite(idx) || !img) return;
    const t = tile.getBoundingClientRect(); const i = img.getBoundingClientRect();
    if (t.width < 2 || i.width < 2) return;
    const f = idx < 7 ? files[0] : files[1];
    f.dx.push(Math.round(((i.left + i.width / 2) - (t.left + t.width / 2)) * 10) / 10);
    f.dy.push(Math.round(((i.top + i.height / 2) - (t.top + t.height / 2)) * 10) / 10);
  });
  return files;
});
for (const f of r) {
  const mit = (a) => (a.length ? Math.round((a.reduce((x, y) => x + y, 0) / a.length) * 10) / 10 : null);
  console.log(`${f.n}: n=${f.dx.length}  desviament mig x=${mit(f.dx)}  y=${mit(f.dy)}   (x: ${f.dx.join(', ')})`);
}
await b.close();
