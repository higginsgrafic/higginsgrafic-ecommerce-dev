// TEMPORAL — les caselles de la franja de la p1: quantes n'hi ha i on cauen.
import { chromium } from '@playwright/test';
const w = Number(process.argv[2]), h = Number(process.argv[3]);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: w, height: h } });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(8000);
const r = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const fr = v1.querySelector('[data-stripe-visual-content="1"]');
  const fila = fr.querySelector('div.relative');
  const fills = [...fila.children].map((c) => {
    const x = c.getBoundingClientRect();
    return { tag: c.tagName.toLowerCase(), cls: (c.className || '').toString().slice(0, 26), x: +x.left.toFixed(1), fi: +x.right.toFixed(1), w: +x.width.toFixed(1), imgs: c.querySelectorAll('img').length };
  });
  const fx = fr.getBoundingClientRect();
  const panel = v1.closest('[data-mega-panel-surface="1"]') || document.querySelector('[data-mega-panel-surface="1"]');
  const px = panel ? panel.getBoundingClientRect() : null;
  return {
    franja: { x: +fx.left.toFixed(1), fi: +fx.right.toFixed(1), w: +fx.width.toFixed(1) },
    panel: px ? { x: +px.left.toFixed(1), fi: +px.right.toFixed(1), w: +px.width.toFixed(1) } : null,
    fila: (() => { const q = fila.getBoundingClientRect(); return { x: +q.left.toFixed(1), fi: +q.right.toFixed(1), w: +q.width.toFixed(1), transform: getComputedStyle(fila).transform }; })(),
    n: fills.length,
    fills,
  };
});
console.log(`${w}x${h} panel ${JSON.stringify(r.panel)}`);
console.log(`  franja ${JSON.stringify(r.franja)}  fila ${JSON.stringify(r.fila)}`);
console.log(`  caselles (${r.n}):`, r.fills.map((f) => `${f.x}->${f.fi}(${f.w})${f.imgs ? ` img${f.imgs}` : ''}`).join(' | '));
await b.close();
