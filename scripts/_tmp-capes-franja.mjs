// TEMPORAL — no es comiteja. Ordre de capes de la franja: vel vs dibuixos.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const [w, h] = (process.argv[3] || '1920x946').split('x').map(Number);
const act = process.argv[2] || 'miscellania';
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(1500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(4500);
const r = await p.evaluate(() => {
  const taula = document.querySelector('[data-taula-vertical="2"]');
  const franja = (taula || document.querySelector('[data-mega-page-viewport="2"]')).querySelector('[data-stripe-visual-content="2"]');
  const descriu = (el, etiqueta) => {
    const cs = getComputedStyle(el);
    const rr = el.getBoundingClientRect();
    return `${etiqueta}: ${el.tagName} z=${cs.zIndex} pos=${cs.position} op=${cs.opacity} [${Math.round(rr.left)},${Math.round(rr.top)} ${Math.round(rr.width)}x${Math.round(rr.height)}]`;
  };
  const linies = [];
  // fills directes de l'embolcall de la franja (ordre del DOM)
  const pare = franja.parentElement;
  linies.push('--- fills de ' + (pare ? pare.className : '?'));
  for (const f of (pare ? [...pare.children] : [])) {
    const cs = getComputedStyle(f);
    const rr = f.getBoundingClientRect();
    linies.push(`   ${f.tagName} z=${cs.zIndex} pos=${cs.position} [${Math.round(rr.width)}x${Math.round(rr.height)}] ${(f.getAttribute('src') || '').slice(0, 24)} ${(f.className || '').toString().slice(0, 20)}`);
  }
  // la casa 0 i les seves capes
  const casa = franja.querySelector('[data-stripe-tile="0"]');
  if (casa) {
    linies.push('--- casa 0 i capes');
    linies.push(descriu(casa, '   casa0'));
    let el = casa;
    for (const f of [...casa.querySelectorAll('*')].slice(0, 12)) {
      const cs = getComputedStyle(f);
      linies.push(`   ${f.tagName} z=${cs.zIndex} pos=${cs.position} op=${cs.opacity} ${(f.getAttribute('src') || '').slice(0, 22)} ${(f.className || '').toString().slice(0, 18)}`);
    }
    el = null;
  }
  // el vel
  const vel = [...franja.querySelectorAll('img')].find((im) => (im.getAttribute('src') || '').startsWith('data:image/svg+xml'));
  if (vel) linies.push(descriu(vel, '--- VEL'));
  return linies.join('\n');
});
console.log(r);
await ctx.close();
await b.close();
