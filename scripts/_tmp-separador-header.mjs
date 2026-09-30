// Mesura les dues linies: la del header i la del megaslide.
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:3003';
const W = Number(process.env.W || 1440);
const H = Number(process.env.H || 900);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto(`${BASE}/?active=first_contact`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);

const dades = await page.evaluate(() => {
  const out = {};
  const surf = document.querySelector('[data-mega-panel-surface="1"]');
  if (surf) {
    const r = surf.getBoundingClientRect();
    const s = getComputedStyle(surf);
    out.megaslide = {
      rect: { x: r.x, y: r.y, w: r.width, h: r.height, bottom: r.bottom },
      borderBottom: `${s.borderBottomWidth} ${s.borderBottomStyle} ${s.borderBottomColor}`,
      bg: s.backgroundColor,
    };
  } else {
    out.megaslide = null;
  }
  const fila = document.querySelector('[data-capcalera-fila="1"]');
  if (fila && fila.parentElement) {
    const p = fila.parentElement;
    const r = p.getBoundingClientRect();
    const s = getComputedStyle(p);
    out.header = {
      cls: p.className,
      rect: { x: r.x, y: r.y, w: r.width, h: r.height, bottom: r.bottom },
      borderBottom: `${s.borderBottomWidth} ${s.borderBottomStyle} ${s.borderBottomColor}`,
      bg: s.backgroundColor,
    };
  }
  const soca = document.querySelector('header');
  if (soca) {
    const r = soca.getBoundingClientRect();
    out.headerOuter = { rect: { x: r.x, y: r.y, w: r.width, h: r.height, bottom: r.bottom } };
  }
  return out;
});

console.log(JSON.stringify(dades, null, 2));
await browser.close();
