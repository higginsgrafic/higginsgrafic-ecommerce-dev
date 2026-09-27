// TEMPORAL — reprodueix l'estat de la captura de l'amo (CUBE + light-blue) i
// mesura el ROMBE: quines cases son buides, quines inactives, i on es pinta el
// vel.
import { chromium } from '@playwright/test';
const ACT = process.argv[2] || 'cube';
const COLOR = Number(process.argv[3] ?? 6);
const DSF = Number(process.argv[4] || 3);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: DSF });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${ACT}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
if (COLOR >= 0) {
  const c = await p.evaluate((i) => {
    const v = document.querySelector('[data-mega-page-viewport="2"]');
    const g = v.querySelector('[data-p2-color-grid]');
    const btns = g ? [...g.querySelectorAll('button')] : [];
    if (!btns[i]) return null;
    const r = btns[i].getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  }, COLOR);
  if (c) { await p.mouse.click(c.x, c.y); await p.waitForTimeout(1500); }
}
const info = await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  const franja = v.querySelector('[data-stripe-visual-content="2"]');
  const tiles = [...franja.querySelectorAll('[data-stripe-tile]')].map((t) => ({
    i: Number(t.getAttribute('data-stripe-tile')),
    col: t.getAttribute('data-stripe-collection'),
    src: (t.getAttribute('data-stripe-src') || '').split('/').pop(),
    op: getComputedStyle(t).opacity,
  }));
  // el vel
  const vels = [];
  for (const im of franja.querySelectorAll('img')) {
    const s = im.getAttribute('src') || '';
    if (!s.startsWith('data:image/svg+xml')) continue;
    const t = decodeURIComponent(s);
    vels.push({
      z: getComputedStyle(im).zIndex,
      op: getComputedStyle(im).opacity,
      fos: (t.match(/fill-opacity="[^"]*"/g) || []),
      grupsOp: (t.match(/<g[^>]*opacity="[^"]*"/g) || []).map((g) => (g.match(/opacity="[^"]*"/) || [''])[0]),
      mask: /mask="url/.test(t),
      paths: (t.match(/<path/g) || []).length,
      te0_3: /fill-opacity="0?\.3"/.test(t) || /opacity="0?\.3"/.test(t),
    });
  }
  // la mascara del contenidor
  let mascara = null;
  for (const el of [franja, ...franja.querySelectorAll('*')]) {
    const cs = getComputedStyle(el);
    const m = cs.maskImage || cs.webkitMaskImage || 'none';
    if (!m || m === 'none') continue;
    const esData = m.includes('data:image/svg+xml');
    let detall = null;
    if (esData) {
      const t = decodeURIComponent(m.replace(/^url\(["']?/, '').replace(/["']?\)$/, '').replace(/^data:image\/svg\+xml,/, ''));
      detall = { grupsOp: (t.match(/<g[^>]*opacity="[^"]*"/g) || []).length, paths: (t.match(/<path/g) || []).length };
    }
    mascara = { esData, size: cs.maskSize, detall, classe: String(el.className).slice(0, 24) };
    break;
  }
  const r = franja.getBoundingClientRect();
  return { tiles, vels, mascara, rect: { x: r.left, y: r.top, width: r.width, height: r.height } };
});
console.log('rect', JSON.stringify(info.rect));
console.log('mascara del contenidor', JSON.stringify(info.mascara));
console.log('vels', JSON.stringify(info.vels, null, 1));
console.log('cases:');
for (const t of info.tiles) console.log(`  ${String(t.i).padStart(2)} ${String(t.col).padEnd(18)} op=${t.op} ${t.src}`);
await p.waitForTimeout(300);
const MODE = process.env.MODE || 'ple';
if (MODE !== 'ple') {
  await p.evaluate((mode) => {
    const v = document.querySelector('[data-mega-page-viewport="2"]');
    const franja = v.querySelector('[data-stripe-visual-content="2"]');
    const tinta = [...franja.querySelectorAll('img')].find((i) => /stripe\.webp/.test(i.getAttribute('src') || ''));
    const vel = [...franja.querySelectorAll('img')].find((i) => (i.getAttribute('src') || '').startsWith('data:image/svg+xml'));
    const capa = v.querySelector('[data-stripe-drawing-layer]');
    const amaga = (el) => { if (el) el.style.visibility = 'hidden'; };
    if (mode === 'sense-vel') { amaga(vel); amaga(capa); }
    if (mode === 'nomes-vel') { amaga(tinta); amaga(capa); }
    if (mode === 'nomes-tinta') { amaga(vel); amaga(capa); }
  }, MODE);
  await p.waitForTimeout(300);
}
await p.screenshot({ path: `_tmp-rombe-${ACT}-${COLOR}${MODE === 'ple' ? '' : '-' + MODE}.png`, clip: info.rect });
console.log(`desat _tmp-rombe-${ACT}-${COLOR}.png`);
await ctx.close();
await b.close();
