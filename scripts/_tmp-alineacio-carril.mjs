// 03/10/2026 — En Marc: «Assegura't que totes les vistes estan ben alineades amb
// el segon carril». Es mesura, a cada vista, on cau el segon carril (les guies
// verdes `data-guia-carril-pagina`) i el que hi ha d'anar alineat: la fila del
// header, la hero, el bloc de la p1, la seva franja, el selector de la p2, la
// graella, la tira de colors, la columna de colleccions i la franja de la p2.
import { chromium } from '@playwright/test';

const BASE = 'http://127.0.0.1:3003';
const VISTES = [
  { nom: 'Tab S9 apaisada', w: 853, h: 455 },
  { nom: 'Tab S9+ apaisada', w: 934, h: 506 },
  { nom: 'MatePad 12.2 apaisada', w: 981, h: 535 },
  { nom: 'iPad 10.2 apaisada', w: 1024, h: 690 },
  { nom: 'iPad Air 11 apaisada', w: 1180, h: 742 },
  { nom: 'Portatil 1280', w: 1280, h: 666 },
  { nom: 'iPad Air 13 apaisada', w: 1366, h: 946 },
  { nom: 'iPad Pro 13 apaisada', w: 1376, h: 954 },
  { nom: 'Portatil 1440 (escriptori)', w: 1440, h: 900 },
  { nom: 'Escriptori 1920', w: 1920, h: 1080 },
];

const arrodonir = (n) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : null);
const b = await chromium.launch();
console.log('vista'.padEnd(30) + 'carril'.padEnd(18) + 'desviacions (px, respecte del segon carril)');
for (const v of VISTES) {
  const ctx = await b.newContext({ viewport: { width: v.w, height: v.h }, hasTouch: v.w < 1400 });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message.slice(0, 80)));
  await p.goto(`${BASE}/nova/inici?active=first_contact&carril=1`, { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(8000);
  const r = await p.evaluate(async () => {
    const cal = await import('/src/config/stripeCalibrations.js');
    const q = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return { l: x.left, r: x.right, w: x.width }; };
    const guiaEsq = document.querySelector('[data-guia-carril-pagina="esq"]');
    const guiaDret = document.querySelector('[data-guia-carril-pagina="dret"]');
    const carril = guiaEsq && guiaDret
      ? { l: guiaEsq.getBoundingClientRect().left, r: guiaDret.getBoundingClientRect().left }
      : null;
    const v1 = document.querySelector('[data-mega-page-viewport="1"]');
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const p1 = v1.getBoundingClientRect();
    const rel = (el) => { const r = el?.getBoundingClientRect(); return r ? { l: r.left - p1.left, r: r.right - p1.left, w: r.width } : null; };
    // Les cintures, relatives a la pagina indicada (quan se'n veu una altra, la
    // seva pagina viu desplacada una amplada de maquetacio).
    const cossos = (el, pagina) => {
      const r = el?.getBoundingClientRect();
      if (!r) return null;
      const dx = pagina ? r.left - pagina.getBoundingClientRect().left : 0;
      const l = (pagina ? 0 : r.left) + dx + cal.FRACCIO_MARGE_ESQUERRE_FRANJA * r.width;
      return { l, r: l + cal.FRACCIO_COSSOS_FRANJA * r.width };
    };
    return {
      carril,
      header: { logo: q(document.querySelector('#stripe-guide-header-logo-anchor'))?.l ?? null, icones: (() => { const ic = document.querySelector('[data-icons-wrap="true"]'); return ic ? ic.getBoundingClientRect().right : null; })() },
      hero: q(document.querySelector('[data-hero-inici]')),
      p1Bloc: rel(v1.querySelector('[data-bloc-dreta-p1]')),
      p1Franja: cossos(v1.querySelector('[data-stripe-visual-content="1"]'), v1),
      p2Selector: q(v2?.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"], [data-p2-color-selector] [data-stripe-buttonbar="bn-p1"]')),
      p2Graella: q(v2?.querySelector('[data-carrusel="1"]')),
      p2Colors: q(document.querySelector('[data-p2-color-grid]')),
      p2Columna: (() => { const e = document.querySelector('[data-colleccions-franja="1"], [data-colleccions-columna="1"]'); return e ? q(e) : null; })(),
      p2Franja: cossos(document.querySelector('[data-stripe-visual-content="2"]')),
      cadenat: q(document.querySelector('[data-cadenat], #cadenat-megaslide, button[aria-label*="cadenat" i]')),
    };
  });
  console.log(`--- ${v.nom} (${v.w}x${v.h})`);
  if (!r.carril) { console.log('   sense guies del segon carril'); await ctx.close(); continue; }
  const L = r.carril.l; const R = r.carril.r;
  const files = [
    ['header logo', r.header.logo, L], ['header icones', r.header.icones, R],
    ['hero', r.hero?.l, L], ['hero dreta', r.hero ? r.hero.r : null, R],
    ['p1 bloc', r.p1Bloc?.l, L], ['p1 bloc dreta', r.p1Bloc ? r.p1Bloc.r : null, R],
    ['p1 cintura esq', r.p1Franja?.l, L], ['p1 cintura dreta', r.p1Franja?.r, R],
    ['p2 selector', r.p2Selector?.l, L], ['p2 graella', r.p2Graella?.l, L], ['p2 graella dreta', r.p2Graella ? r.p2Graella.r : null, R],
    ['p2 colors', r.p2Colors?.l, L], ['p2 colors dreta', r.p2Colors ? r.p2Colors.r : null, R],
    ['p2 columna', r.p2Columna?.l, L], ['p2 columna dreta', r.p2Columna ? r.p2Columna.r : null, R],
    ['p2 cintura esq', r.p2Franja?.l, L], ['p2 cintura dreta', r.p2Franja?.r, R],
    ['cadenat', r.cadenat ? r.cadenat.r : null, R],
  ];
  const desviacions = files
    .filter(([, val, ref]) => val != null && ref != null && Math.abs(val - ref) > 1)
    .map(([nom, val, ref]) => `${nom} ${arrodonir(val - ref)}`);
  console.log(`    carril ${arrodonir(L)}..${arrodonir(R)}  ${desviacions.length ? 'DESVIACIONS: ' + desviacions.join(' · ') : 'tot alineat'}`);
  if (errs.length) console.log('    errors', errs.slice(0, 2));
  await ctx.close();
}
await b.close();
