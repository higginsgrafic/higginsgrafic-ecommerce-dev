// TEMPORAL — el cadenat injectat: posicio, mida i els dos estats.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
const errors = [];
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 140)); });
p.on('pageerror', (e) => errors.push(String(e.message).slice(0, 140)));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(6000);
const info = async () => p.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const x = Number.parseFloat(cs.getPropertyValue('--hg-mega-x'));
  const ww = Number.parseFloat(cs.getPropertyValue('--hg-mega-w'));
  const btn = [...document.querySelectorAll('button')].find((b) => (b.getAttribute('aria-label') || '').includes('megaslide'));
  const img = btn.querySelector('img');
  const svg = btn.querySelector('svg');
  const ib = img.getBoundingClientRect(), sb = svg.getBoundingClientRect(), bb = btn.getBoundingClientRect();
  return {
    carrilDreta: +(x + ww).toFixed(1),
    btn: [+bb.left.toFixed(1), +bb.right.toFixed(1), +bb.top.toFixed(1)],
    placa: [+ib.width.toFixed(1), +ib.height.toFixed(1)],
    cadenat: [+sb.width.toFixed(1), +sb.height.toFixed(1), +(sb.left - ib.left).toFixed(1), +(sb.top - ib.top).toFixed(1)],
    color: getComputedStyle(svg).color,
    paths: [...svg.querySelectorAll('path')].map((q) => q.getAttribute('d')),
    label: btn.getAttribute('aria-label'),
  };
});
const a = await info();
console.log('BLOQUEJAT  ', JSON.stringify(a));
const r = await p.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const x = Number.parseFloat(cs.getPropertyValue('--hg-mega-x'));
  const ww = Number.parseFloat(cs.getPropertyValue('--hg-mega-w'));
  const btn = [...document.querySelectorAll('button')].find((b) => (b.getAttribute('aria-label') || '').includes('megaslide'));
  const bb = btn.getBoundingClientRect();
  return { left: Math.round(x + ww) - 120, top: Math.round(bb.top) - 30, w: 160, h: 120 };
});
await p.screenshot({ path: '/tmp/cadenat-tancat.png', clip: { x: r.left, y: Math.max(0, r.top), width: r.w, height: r.h } });
await p.click('button[aria-label="Bloca el megaslide"]');
await p.waitForTimeout(500);
const c = await info();
console.log('DESBLOQUEJAT', JSON.stringify(c));
await p.screenshot({ path: '/tmp/cadenat-obert.png', clip: { x: r.left, y: Math.max(0, r.top), width: r.w, height: r.h } });
console.log('errors:', errors.length, errors.slice(0, 2));
await ctx.close(); await b.close();
