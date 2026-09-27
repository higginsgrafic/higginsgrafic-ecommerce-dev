// TEMPORAL — arbre del contenidor de la franja (p1 i p2): qui es dins de qui,
// amb la mascara i el z.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const linies = [];
  for (const pag of ['1', '2']) {
    const v = document.querySelector(`[data-mega-page-viewport="${pag}"]`);
    const franja = v.querySelector(`[data-stripe-visual-content="${pag}"]`);
    linies.push(`===== p${pag} =====`);
    // l'element amb mascara
    let mascara = null;
    for (const e of [franja, ...franja.querySelectorAll('*')]) {
      const cs = getComputedStyle(e);
      const m = cs.maskImage || cs.webkitMaskImage || 'none';
      if (m && m !== 'none') { mascara = e; break; }
    }
    const capa = v.querySelector('[data-stripe-drawing-layer]')
      || [...franja.querySelectorAll('div')].find((d) => { const cp = getComputedStyle(d).clipPath; return cp && cp !== 'none' && d.querySelector('img'); });
    const tinta = [...franja.querySelectorAll('img')].find((i) => /stripe\.(webp|png)/.test(i.getAttribute('src') || ''));
    const dins = (a, b2) => !!(a && b2 && b2.contains(a));
    linies.push(`  mascara: ${mascara ? mascara.tagName + '.' + String(mascara.className).slice(0, 20) : 'cap'}  size=${mascara ? getComputedStyle(mascara).maskSize : '-'}`);
    linies.push(`  imatge de la franja DINS de la mascara? ${dins(tinta, mascara)}`);
    linies.push(`  capa de dibuixos DINS de la mascara? ${dins(capa, mascara)}`);
    linies.push(`  capa de dibuixos clip-path: ${capa ? (getComputedStyle(capa).clipPath || 'none') : 'n/a'}`);
    // cadena d'ancestres de la capa
    if (capa) {
      const cami = [];
      let e = capa;
      for (let k = 0; k < 8 && e && e !== v; k++) { cami.push(`${e.tagName}.${String(e.className || '').slice(0, 18)}[z=${getComputedStyle(e).zIndex}]`); e = e.parentElement; }
      linies.push('  capa: ' + cami.join(' > '));
    }
    if (tinta) {
      const cami = [];
      let e = tinta;
      for (let k = 0; k < 8 && e && e !== v; k++) { cami.push(`${e.tagName}.${String(e.className || '').slice(0, 18)}[z=${getComputedStyle(e).zIndex}]`); e = e.parentElement; }
      linies.push('  imatge: ' + cami.join(' > '));
    }
  }
  return linies.join('\n');
});
console.log(r);
await ctx.close(); await b.close();
