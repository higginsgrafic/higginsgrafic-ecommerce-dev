// TEMPORAL (28/09/2026): AUDITORIA DE CLICS (amb retalls). Per cada element
// interactiu mira qui rep el clic al centre de la seva part VISIBLE (tenint en
// compte els `overflow` dels avantpassats: en un carrussell, el centre geometric
// d'una peca pot quedar retallat i allo no es cap clic perdut).
//
// Ho demana l'amo: «El cadenat te el clic tapat. i el selector tambe. Mira si hi
// ha mes clics tapats o capturats».
//
// Us: node scripts/_tmp-audit-clics.mjs [obert|tancat] [amplada] [alcada]
import { chromium } from '@playwright/test';

const estat = process.argv[2] || 'obert';
const ample = Number(process.argv[3] || 768);
const alt = Number(process.argv[4] || 1024);
// La pagina del megaslide (es guarda a localStorage): per auditar la p1.
const pagina = process.argv[5] || null;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: ample, height: alt }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
// Amb `?active=` el megaslide s'obre tot sol: per a l'estat TANCAT, sense res.
if (pagina) await p.addInitScript((v) => { try { window.localStorage.setItem('HG_MEGA_PAGE', v); } catch { /* res */ } }, pagina);
await p.goto(estat !== 'tancat'
  ? 'http://127.0.0.1:3003/nova/inici?active=first_contact'
  : 'http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
if (estat === 'obert') {
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(9000);
}

const r = await p.evaluate(() => {
  const curt = (el) => {
    if (!el || el === document.documentElement) return 'HTML';
    if (el === document.body) return 'BODY';
    const cls = (el.className || '').toString().trim().split(/\s+/).filter(Boolean).slice(0, 3).join('.');
    const dat = [...el.attributes].filter((a) => a.name.startsWith('data-')).map((a) => `${a.name}=${String(a.value).slice(0, 16)}`);
    const etq = el.getAttribute('aria-label') || el.getAttribute('title');
    return `${el.tagName}${cls ? `.${cls}` : ''}${dat.length ? `[${dat.join(' ')}]` : ''}${etq ? ` «${etq.slice(0, 22)}»` : ''}`;
  };
  const caixa = (r) => `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`;
  const cadena = (el, n = 6) => {
    const out = [];
    let x = el;
    while (x && x !== document.body && out.length < n) { out.push(curt(x)); x = x.parentElement; }
    return out;
  };
  const esVe = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
    const rr = el.getBoundingClientRect();
    return rr.width > 2 && rr.height > 2;
  };
  // La part VISIBLE de l'element: la seva caixa retallada pels `overflow` de dalt.
  const visibleDe = (el) => {
    const r = el.getBoundingClientRect();
    let { left, top, right, bottom } = r;
    let x = el.parentElement;
    while (x && x !== document.documentElement) {
      const cs = getComputedStyle(x);
      if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
        const rr = x.getBoundingClientRect();
        left = Math.max(left, rr.left); top = Math.max(top, rr.top);
        right = Math.min(right, rr.right); bottom = Math.min(bottom, rr.bottom);
      }
      x = x.parentElement;
    }
    const w = Math.max(0, right - left); const h = Math.max(0, bottom - top);
    return { left, top, w, h, fraccio: (w * h) / Math.max(1, r.width * r.height) };
  };
  const interactiuDe = (el) => {
    let x = el;
    while (x && x !== document.body) {
      if (x.tagName === 'BUTTON' || x.tagName === 'A' || x.getAttribute('role') === 'button' || x.getAttribute('role') === 'link') return x;
      x = x.parentElement;
    }
    return null;
  };

  const grups = new Map();
  const foraDePantalla = [];
  let interactius = 0;
  for (const el of document.querySelectorAll('button, a[href], input, select, textarea, [role="button"], [role="link"]')) {
    if (!esVe(el)) continue;
    const vis = visibleDe(el);
    if (vis.w < 6 || vis.h < 6) { foraDePantalla.push(curt(el)); continue; }
    // Nome's els que son DINS la pantalla.
    if (vis.left < 0 || vis.top < 0 || vis.left + vis.w > innerWidth || vis.top + vis.h > innerHeight) continue;
    interactius += 1;
    const cx = vis.left + vis.w / 2;
    const cy = vis.top + vis.h / 2;
    const aDalt = document.elementFromPoint(cx, cy);
    if (aDalt === el || el.contains(aDalt)) continue;
    if (interactiuDe(aDalt) === el) continue;
    const clau = curt(aDalt);
    if (!grups.has(clau)) {
      grups.set(clau, {
        qui: clau,
        caixa: caixa(aDalt.getBoundingClientRect()),
        z: getComputedStyle(aDalt).zIndex,
        pe: getComputedStyle(aDalt).pointerEvents,
        fons: getComputedStyle(aDalt).backgroundColor,
        cadena: cadena(aDalt),
        taps: [],
      });
    }
    grups.get(clau).taps.push({ jo: curt(el), caixa: caixa(el.getBoundingClientRect()), visible: `${Math.round(vis.w)}x${Math.round(vis.h)}`, fraccio: +(vis.fraccio * 100).toFixed(0) });
  }
  return { interactius, grups: [...grups.values()].sort((a, c) => c.taps.length - a.taps.length), foraDePantalla: foraDePantalla.length };
});

console.log(`### megaslide ${estat.toUpperCase()} · ${ample}x${alt} ###`);
console.log(`interactius amb part visible dins la pantalla: ${r.interactius}  (fora: ${r.foraDePantalla})`);
const total = r.grups.reduce((a, g) => a + g.taps.length, 0);
console.log(`AMB EL CLIC TAPAT: ${total}\n`);
for (const g of r.grups) {
  console.log(`>>> SE'L QUEDA: ${g.qui}   caixa ${g.caixa}  z=${g.z}  fons=${g.fons}  pe=${g.pe}`);
  console.log(`    on viu: ${g.cadena.join('\n             < ')}`);
  console.log(`    taps (${g.taps.length}):`);
  for (const t of g.taps) console.log(`      · ${t.jo}  [${t.caixa}] visible ${t.visible} (${t.fraccio}%)`);
  console.log('');
}
await b.close();
