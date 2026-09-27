// TEMPORAL — no es comiteja. Els dos vels (inactives 0.6 i buides 0.3) amb l'INDEX DE DEBÒ de cada silueta.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const actius = (process.argv[2] || 'miscellania').split(',');
const [w, h] = (process.argv[3] || '1920x946').split('x').map(Number);
for (const act of actius) {
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(1500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(4500);
const r = await p.evaluate(async () => {
  const taula = document.querySelector('[data-taula-vertical="2"]');
  const arrel = taula || document.querySelector('[data-mega-page-viewport="2"]');
  const franja = arrel.querySelector('[data-stripe-visual-content="2"]');
  const original = await (await fetch('/placeholders/cercador/full-clic-area-5.svg')).text();
  const doc = new DOMParser().parseFromString(original, 'image/svg+xml');
  const ds = [...doc.querySelectorAll('.tshirt-outline')].map((x) => (x.getAttribute('d') || '').slice(0, 40));
  const imgs = [...franja.querySelectorAll('img')];
  const vels = {};
  for (const im of imgs) {
    const s = im.getAttribute('src') || '';
    if (!s.startsWith('data:image/svg+xml')) continue;
    const svg = decodeURIComponent(s.replace(/^data:image\/svg\+xml,/, ''));
    const re = /<path[^>]*>/g;
    let m;
    const trobat = [];
    while ((m = re.exec(svg))) {
      const d = (m[0].match(/d="([^"]{0,40})/) || [])[1] || '';
      const idx = ds.indexOf(d);
      const fo = (m[0].match(/fill-opacity="([^"]*)"/) || [])[1];
      trobat.push(`${idx}:${fo}`);
    }
    const z = getComputedStyle(im).zIndex;
    vels[`z${z}`] = trobat.join(' ');
  }
  const cases = [...franja.querySelectorAll('[data-stripe-tile]')].map((el) => ({ i: Number(el.getAttribute('data-stripe-tile')), c: el.getAttribute('data-stripe-collection'), src: (el.getAttribute('data-stripe-src') || '').split('/').pop().slice(0, 22) })).sort((a, b2) => a.i - b2.i);
  return { vels, cases, sonde: window.__HG_VEL__ || null };
});
console.log(`\nactive=${act} ${w}x${h} | SONDA idx=${r.sonde ? r.sonde.idx.join(',') : '?'}`);
for (const [k, v] of Object.entries(r.vels)) console.log(`  vel img ${k}: ${v}`);
const velSet = new Set();
for (const v of Object.values(r.vels)) for (const par of v.split(' ')) if (par.endsWith(':0.6')) velSet.add(Number(par.split(':')[0]));
const toca = new Set(r.cases.filter((c) => c.c && c.c !== act).map((c) => c.i));
const falta = [...toca].filter((i) => !velSet.has(i));
const sobra = [...velSet].filter((i) => !toca.has(i));
console.log(`  -> vel=${[...velSet].sort((a, b2) => a - b2).join(',')} | toca=${[...toca].sort((a, b2) => a - b2).join(',')} | FALTA=${falta.join(',') || '-'} SOBRA=${sobra.join(',') || '-'}`);
for (const c of r.cases) console.log(`     casa ${String(c.i).padStart(2)} ${String(c.c).padEnd(16)} ${c.src}`);
await ctx.close();
}
await b.close();
