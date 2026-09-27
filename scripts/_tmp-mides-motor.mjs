// TEMPORAL — no es coiteja. Les mides que governen la composicio de la p2.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(10000);
console.log(JSON.stringify(await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const tira = v2.querySelector('[data-carrusel="1"]').firstElementChild.firstElementChild;
  const boto = [...tira.querySelectorAll('button')][0];
  const r = boto.getBoundingClientRect();
  const cg = v2.querySelector('[data-p2-color-grid]');
  const barra = cg.querySelector('button');
  return {
    escala: getComputedStyle(document.documentElement).getPropertyValue('--hg-escala-mega').trim(),
    carril: getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w').trim(),
    peca: { w: +r.width.toFixed(2), h: +r.height.toFixed(2) },
    // El pas entre peces de la MATEIXA fila
    pas: (() => { const ps = [...tira.querySelectorAll('button')].map((x) => x.getBoundingClientRect()); const fila = ps.filter((x) => +x.top.toFixed(1) === +ps[0].top.toFixed(1)).map((x) => x.left).sort((a, b2) => a - b2); return +(fila[1] - fila[0]).toFixed(2); })(),
    barraColors: { w: +barra.getBoundingClientRect().width.toFixed(1), h: +barra.getBoundingClientRect().height.toFixed(1), ratio: +(barra.getBoundingClientRect().width / barra.getBoundingClientRect().height).toFixed(2) },
  };
}), null, 1));
await ctx.close();
await b.close();
