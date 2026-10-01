// 02/10/2026 — Quina classe de dispositiu rep cada format de tauleta de la
// llista de `scripts/mesura-formats.mjs`, llegida del model de produccio.
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const font = readFileSync(new URL('./mesura-formats.mjs', import.meta.url), 'utf8');
const blocs = font.split('const FORMATS = [')[1].split('];')[0];
const FORMATS = [...blocs.matchAll(/\{\s*nom:\s*'([^']+)',\s*tipus:\s*'([^']+)',\s*w:\s*(\d+),\s*h:\s*(\d+),\s*chrome:\s*(\d+)\s*\}/g)]
  .map((m) => ({ nom: m[1], tipus: m[2], w: +m[3], h: +m[4], chrome: +m[5] }));
console.log('formats llegits:', FORMATS.length, '| tauletes:', FORMATS.filter((f) => f.tipus.startsWith('tauleta')).length);

const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
await p.goto('http://127.0.0.1:3003/', { waitUntil: 'load', timeout: 120000 });
const classes = await p.evaluate(async (formats) => {
  const m = await import('/src/utils/layoutModel.js');
  return formats.map((f) => {
    const alt = f.h - f.chrome;
    const d = m.deviceLayoutFromViewport(f.w, alt);
    const classe = d.isMobile ? 'mobil' : d.isPortraitTablet ? 'tauleta vertical' : d.isLandscapeTablet ? 'tauleta apaissada' : d.isDesktop ? 'escriptori' : '?';
    // La regla VELLA, per veure que nome's es mou el que ha de moure's.
    const mobil = f.w < 600 || (f.w < 768 && alt < f.w);
    const vertical = !mobil && f.w <= 1024 && alt > f.w;
    const apaissada = !mobil && !vertical && f.w <= 1366 && alt > 0 && alt < f.w && alt <= 1100;
    const vella = mobil ? 'mobil' : vertical ? 'tauleta vertical' : apaissada ? 'tauleta apaissada' : 'escriptori';
    return { ...f, alt, classe, vella };
  });
}, FORMATS);
await b.close();

const am = (s, n) => String(s).padEnd(n);
console.log(`${am('format', 30)}${am('tipus', 19)}${am('finestra', 12)}${am('classe', 19)}`);
for (const f of classes.filter((x) => x.tipus.startsWith('tauleta'))) {
  const mal = f.tipus === 'tauleta' ? f.classe !== 'tauleta vertical' : f.classe !== 'tauleta apaissada';
  console.log(am(f.nom, 30) + am(f.tipus, 19) + am(`${f.w}x${f.alt}`, 12) + am(f.classe, 19) + (mal ? '<-- NO es tauleta' : ''));
}
console.log('\nRESUM tauletes:', JSON.stringify(classes.filter((x) => x.tipus.startsWith('tauleta')).reduce((a, f) => { a[f.classe] = (a[f.classe] || 0) + 1; return a; }, {})));
console.log('RESUM tots   :', JSON.stringify(classes.reduce((a, f) => { a[f.classe] = (a[f.classe] || 0) + 1; return a; }, {})));
console.log('\nFORMATS QUE CANVIEN DE CLASSE:');
for (const f of classes.filter((x) => x.classe !== x.vella)) {
  console.log(`  ${f.nom}: ${f.vella} -> ${f.classe}   (${f.w}x${f.alt}, ${f.tipus})`);
}
console.log('\nTOTS ELS FORMATS (classe nova):');
for (const f of classes) console.log(`  ${am(f.nom, 30)}${am(`${f.w}x${f.alt}`, 12)}${f.classe}`);
