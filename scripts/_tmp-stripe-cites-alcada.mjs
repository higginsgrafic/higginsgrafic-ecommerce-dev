import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1960, height: 839 } });
await p.goto('http://127.0.0.1:3003/austen/quotes-it-is-a-truth', { waitUntil: 'networkidle' });
await p.waitForTimeout(2000);
await p.locator('button[aria-label="Cercador i catàleg"]').first().click({ force: true });
await p.waitForTimeout(2400);
const el = p.locator('[data-mega-panel-surface="1"]').getByText('QUOTES', { exact: true }).first();
await el.evaluate((n) => { let x = n; while (x && x !== document.body) { if (x.tagName === 'BUTTON' || x.tagName === 'A' || x.onclick) { x.click(); return; } x = x.parentElement; } n.click(); });
await p.waitForTimeout(1600);
const caixa = await p.evaluate(() => {
  for (const im of document.querySelectorAll('[data-mega-panel-surface="1"] img')) {
    const s = im.getAttribute('src') || '';
    if (s.includes('full-') && s.includes('stripe')) {
      const r = im.getBoundingClientRect();
      if (r.left > 0 && r.left < window.innerWidth && r.width > 400) return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
    }
  }
  return null;
});
const buf = await p.screenshot({ clip: { x: caixa.x, y: caixa.y, width: caixa.w, height: caixa.h } });
const b64 = buf.toString('base64');
const res = await p.evaluate(async ({ b64, w, h }) => {
  const img = new Image();
  img.src = `data:image/png;base64,${b64}`;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  const esc = c.width / w;
  const out = [];
  for (let i = 0; i < 14; i++) {
    const x0 = Math.round((i * w / 14 + w / 42) * esc);
    const x1 = Math.round(((i + 1) * w / 14 - w / 42) * esc);
    let minY = 1e9, maxY = -1, minX = 1e9, maxX = -1;
    for (let y = 0; y < c.height; y++) {
      for (let x = x0; x < x1; x++) {
        const o = (y * c.width + x) * 4;
        const lum = 0.299 * d[o] + 0.587 * d[o + 1] + 0.114 * d[o + 2];
        if (lum < 190 && d[o + 3] > 200) { if (y < minY) minY = y; if (y > maxY) maxY = y; if (x < minX) minX = x; if (x > maxX) maxX = x; }
      }
    }
    out.push({ i, top: maxY < 0 ? null : Math.round(minY / esc * 10) / 10, bottom: maxY < 0 ? null : Math.round(maxY / esc * 10) / 10, h: maxY < 0 ? null : Math.round((maxY - minY + 1) / esc * 10) / 10 });
  }
  return out;
}, { b64, w: caixa.w, h: caixa.h });
for (const r of res) console.log(`casa ${String(r.i).padStart(2)}: top=${String(r.top).padStart(6)} bottom=${String(r.bottom).padStart(6)} alcada=${String(r.h).padStart(5)}`);
await b.close();
