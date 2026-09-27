// TEMPORAL — no es comiteja. Quant costa la pagina 2 en TEMPS DE CARREGA?
// Mesura: carrega de la pagina (megaslide tancat), obertura amb ?active= i
// obertura amb clic. Bytes de document, total i de les imatges del megaslide.
import { chromium } from '@playwright/test';

const BASE = process.env.HG_URL || 'http://127.0.0.1:3003';
const b = await chromium.launch();

async function mesura(nom, url, clica) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await ctx.addInitScript(() => {
    window.__m = [];
    window.__clic = null;
    const foto = () => {
      const panell = document.querySelector('[data-mega-panel-surface="1"]');
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      let op = 0; let imgs = 0; let franjaImg = 0;
      if (panell) {
        op = Number.parseFloat(getComputedStyle(panell).opacity) || 0;
        if (v2) {
          const g = v2.querySelector('[data-carrusel="1"] > div');
          if (g) imgs = [...g.querySelectorAll('button img')].filter((i) => i.naturalWidth > 0).length;
          const fr = v2.querySelector('[data-stripe-visual-content="2"]');
          if (fr && fr.querySelector('img')) franjaImg = fr.querySelector('img').naturalWidth;
        }
      }
      window.__m.push({ t: Math.round(performance.now()), panell: !!panell, op: +op.toFixed(2), imgs, franjaImg });
      if (window.__m.length < 3000) requestAnimationFrame(() => window.setTimeout(foto, 0));
    };
    requestAnimationFrame(() => window.setTimeout(foto, 0));
  });
  await p.goto(url, { waitUntil: 'load', timeout: 180000 });
  if (clica) {
    await p.waitForTimeout(1200);
    await p.evaluate(() => { window.__clic = Math.round(performance.now()); });
    await p.click('button:has(svg.lucide-search)');
  }
  await p.waitForTimeout(5000);
  const r = await p.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const res = performance.getEntriesByType('resource');
    const esImg = (u) => /images_grid_trim|images_stripe|full-white-stripe/.test(u);
    const imgs = res.filter((x) => esImg(x.name));
    const perExt = {};
    for (const x of res) {
      const m = x.name.split('?')[0].match(/\.([a-z0-9]+)$/i);
      const k = m ? m[1].toLowerCase() : 'altres';
      perExt[k] = perExt[k] || { n: 0, b: 0 };
      perExt[k].n += 1;
      perExt[k].b += x.transferSize || 0;
    }
    const grans = res.slice().sort((a, b) => (b.transferSize || 0) - (a.transferSize || 0)).slice(0, 6)
      .map((x) => ({ u: x.name.replace(/^https?:\/\/[^/]+/, '').slice(0, 70), kb: Math.round((x.transferSize || 0) / 1024) }));
    return {
      m: window.__m,
      clic: window.__clic,
      dcl: Math.round(nav.domContentLoadedEventEnd),
      load: Math.round(nav.loadEventEnd),
      docBytes: nav.transferSize || 0,
      totalBytes: (nav.transferSize || 0) + res.reduce((a, x) => a + (x.transferSize || 0), 0),
      imgBytes: imgs.reduce((a, x) => a + (x.transferSize || 0), 0),
      imgN: imgs.length,
      reqN: res.length,
      perExt,
      grans,
    };
  });
  await ctx.close();

  const t0 = clica ? r.clic : 0;
  const desde = (x) => Math.round(x - t0);
  const panel = r.m.find((x) => x.panell);
  const visible = r.m.find((x) => x.panell && x.op > 0);
  const ple = r.m.find((x) => x.panell && x.imgs >= 128 && x.franjaImg > 0);
  console.log(`\n=== ${nom} ===`);
  console.log(`  carrega:   DCL ${r.dcl} ms · load ${r.load} ms`);
  console.log(`  pes:       document ${(r.docBytes / 1024).toFixed(1)} KB · total ${(r.totalBytes / 1024).toFixed(0)} KB en ${r.reqN} peticions`);
  console.log(`  imatges:   ${r.imgN} fitxers · ${(r.imgBytes / 1024).toFixed(0)} KB`);
  console.log(`  panell:    DOM ${panel ? desde(panel.t) + ' ms' : '—'} · visible ${visible ? desde(visible.t) + ' ms (op ' + visible.op + ')' : '—'} · sencer ${ple ? desde(ple.t) + ' ms' : '—'}`);
  if (visible) console.log(`  al primer visible: imgs ${visible.imgs}/128 franjaImg ${visible.franjaImg}`);
  const ext = Object.entries(r.perExt).sort((a, b) => b[1].b - a[1].b).slice(0, 6)
    .map(([k, v]) => `${k} ${(v.b / 1024).toFixed(0)} KB/${v.n}`).join(' · ');
  console.log(`  per tipus: ${ext}`);
  console.log(`  més grans: ${r.grans.map((g) => `${g.kb} KB ${g.u}`).join(' | ')}`);
}

if (process.env.HG_NOMES === 'click') {
  await mesura('obrir amb el clic de cerca', `${BASE}/nova/inici`, true);
} else if (process.env.HG_NOMES === 'active') {
  await mesura('obrir amb ?active= (carrega)', `${BASE}/nova/inici?active=first_contact`, false);
} else {
  await mesura('pagina sola (megaslide tancat)', `${BASE}/nova/inici`, false);
  await mesura('obrir amb ?active= (carrega)', `${BASE}/nova/inici?active=first_contact`, false);
  await mesura('obrir amb el clic de cerca', `${BASE}/nova/inici`, true);
}
await b.close();
