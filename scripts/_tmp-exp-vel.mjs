// TEMPORAL — experiments sobre la franja de la p2, sense tocar el codi:
//   masa  -> treu la mascara del contenidor (maskImage: none)
//   grup  -> posa totes les siluetes del vel en UN sol grup (opacitat una sola
//            vegada: el solapament de dues cases deixa de comptar doble)
//   tots  -> les dues coses
import { chromium } from '@playwright/test';
const MODE = process.argv[2] || 'grup';
const PAGINA = process.argv[3] || '2';
const DSF = Number(process.argv[4] || 3);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: DSF });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector(`[data-mega-page-viewport="${PAGINA}"]`, { timeout: 30000 });
await p.waitForTimeout(9000);
if (PAGINA === '1') {
  await p.evaluate(() => {
    const v1 = document.querySelector('[data-mega-page-viewport="1"]');
    let t = v1.parentElement;
    while (t && !(t.style && t.style.width === '400%')) t = t.parentElement;
    if (t) { t.style.transition = 'none'; t.style.transform = 'translateX(0%)'; }
  });
  await p.waitForTimeout(400);
}
const info = await p.evaluate(({ mode, pag }) => {
  const v = document.querySelector(`[data-mega-page-viewport="${pag}"]`);
  const franja = v.querySelector(`[data-stripe-visual-content="${pag}"]`);
  const fet = [];
  // 1) la mascara del contenidor
  if (mode === 'masa' || mode === 'tots') {
    for (const el of [franja, ...franja.querySelectorAll('*')]) {
      const cs = getComputedStyle(el);
      const m = cs.maskImage || cs.webkitMaskImage || 'none';
      if (!m || m === 'none') continue;
      el.style.webkitMaskImage = 'none';
      el.style.maskImage = 'none';
      fet.push('mascara fora');
    }
  }
  // 2) el vel en un sol grup
  if (mode === 'grup' || mode === 'tots') {    const img = [...franja.querySelectorAll('img')].find((i) => (i.getAttribute('src') || '').startsWith('data:image/svg+xml'));
    if (!img) return { fet, error: 'sense vel' };
    const text = decodeURIComponent(img.getAttribute('src').replace(/^data:image\/svg\+xml,/, ''));
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    const svg = doc.documentElement;
    const gs = [...svg.querySelectorAll('g[mask]')];
    const camins = [];
    let maskId = null;
    let op = '0.6';
    for (const g of gs) {
      maskId = maskId || g.getAttribute('mask');
      for (const pa of [...g.querySelectorAll('path')]) {
        if (pa.getAttribute('fill-opacity')) op = pa.getAttribute('fill-opacity');
        camins.push(pa);
        if (pa.parentNode) pa.parentNode.removeChild(pa);
      }
    }
    for (const g of gs) { if (g.parentNode) g.parentNode.removeChild(g); }
    const NS = 'http://www.w3.org/2000/svg';
    const nou = doc.createElementNS(NS, 'g');
    if (maskId) nou.setAttribute('mask', maskId);
    nou.setAttribute('fill', '#FFFFFF');
    nou.setAttribute('opacity', op);
    for (const c of camins) { c.removeAttribute('fill-opacity'); nou.appendChild(c); }
    svg.appendChild(nou);
    const serial = new XMLSerializer().serializeToString(svg);
    img.setAttribute('src', `data:image/svg+xml,${encodeURIComponent(serial)}`);
    fet.push(`vel en un grup (${camins.length} siluetes)`);
  }
  // 3) el vel COM ERA ABANS: una opacitat a cada cami (per tenir l'abans i el
  //    despres amb el mateix clip i la mateixa captura)
  if (mode === 'abans') {
    const img = [...franja.querySelectorAll('img')].find((i) => (i.getAttribute('src') || '').startsWith('data:image/svg+xml'));
    if (!img) return { fet, error: 'sense vel' };
    const text = decodeURIComponent(img.getAttribute('src').replace(/^data:image\/svg\+xml,/, ''));
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    const svg = doc.documentElement;
    const grups = [...svg.querySelectorAll('g[opacity]')].filter((g) => g.querySelector('path'));
    for (const g of grups) {
      const op = g.getAttribute('opacity');
      g.removeAttribute('opacity');
      for (const pa of [...g.querySelectorAll('path')]) pa.setAttribute('fill-opacity', op);
    }
    img.setAttribute('src', `data:image/svg+xml,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`);
    fet.push(`vel com abans (${grups.length} grups desfets)`);
  }
  const r = franja.getBoundingClientRect();
  return { fet, x: r.left, y: r.top, width: r.width, height: r.height };
}, { mode: MODE, pag: PAGINA });
console.log(JSON.stringify(info));
await p.waitForTimeout(700);
await p.screenshot({ path: `_tmp-exp-${MODE}-p${PAGINA}.png`, clip: { x: info.x, y: info.y, width: info.width, height: info.height } });
console.log(`desat _tmp-exp-${MODE}-p${PAGINA}.png`);
await ctx.close(); await b.close();
