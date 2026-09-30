#!/usr/bin/env node
/**
 * Compara dues captures (`/tmp/_tmp-tokens/<a>` i `<b>`) pixel a pixel i diu
 * quant se'n separa cada pantalla. Serveix per comprovar que una tanda de
 * conversio de colors NOMES canvia color: si la disposicio es mou, la xifra
 * de pixels diferents puja molt i sobretot es veu als contorns.
 *
 *   node scripts/_tmp-tokens-diff.mjs abans vores
 */
import { chromium } from 'playwright';
import { readdirSync, readFileSync, existsSync } from 'node:fs';

const [a, b] = process.argv.slice(2);
const DIRA = `/tmp/_tmp-tokens/${a}`;
const DIRB = `/tmp/_tmp-tokens/${b}`;
if (!existsSync(DIRA) || !existsSync(DIRB)) { console.error('Falten captures'); process.exit(1); }

const noms = readdirSync(DIRA).filter((f) => f.endsWith('.png'));
const resums = {};
for (const [etq, dir] of [['a', DIRA], ['b', DIRB]]) {
  try { resums[etq] = JSON.parse(readFileSync(`${dir}/resum.json`, 'utf8')); } catch { resums[etq] = []; }
}
const geom = (etq, nom) => (resums[etq].find((r) => `${r.nom}.png` === nom) || {}).geometria || '-';
const chromiumB = await chromium.launch();
const p = await chromiumB.newPage();
await p.goto('http://127.0.0.1:3003/');
const resultats = [];
for (const nom of noms) {
  const A = readFileSync(`${DIRA}/${nom}`).toString('base64');
  const B = readFileSync(`${DIRB}/${nom}`).toString('base64');
  // El hero de la portada es sorteja a cada carrega (i el sorteig no es pot
  // fixar: `Math.random` es compartit). Se n'ignora la banda.
  const mascara = (nom === 'inici.png' || nom === 'mega-mega.png') ? [120, 650] : null;
  const r = await p.evaluate(async ({ a, b, mascara }) => {
    const carrega = (d) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = `data:image/png;base64,${d}`; });
    const [ia, ib] = await Promise.all([carrega(a), carrega(b)]);
    const w = Math.min(ia.width, ib.width), h = Math.min(ia.height, ib.height);
    const ca = document.createElement('canvas'); ca.width = w; ca.height = h;
    const cb = document.createElement('canvas'); cb.width = w; cb.height = h;
    const xa = ca.getContext('2d'); const xb = cb.getContext('2d');
    xa.drawImage(ia, 0, 0); xb.drawImage(ib, 0, 0);
    const da = xa.getImageData(0, 0, w, h).data; const db = xb.getImageData(0, 0, w, h).data;
    let diferents = 0, forts = 0;
    let minX = w, minY = h, maxX = -1, maxY = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (mascara && y >= mascara[0] && y <= mascara[1]) continue;
        const o = (y * w + x) * 4;
        const d = Math.abs(da[o] - db[o]) + Math.abs(da[o + 1] - db[o + 1]) + Math.abs(da[o + 2] - db[o + 2]);
        if (d > 6) {
          diferents++;
          if (d > 60) forts++;
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
      }
    }
    return { total: w * h, diferents, forts, caixa: maxX < 0 ? null : [minX, minY, maxX, maxY], mides: [ia.width, ia.height, ib.width, ib.height] };
  }, { a: A, b: B, mascara });
  resultats.push({ nom, ...r });
  const pct = ((r.diferents / r.total) * 100).toFixed(2);
  const pctFort = ((r.forts / r.total) * 100).toFixed(2);
  const ga = geom('a', nom), gb = geom('b', nom);
  const disp = mascara ? 'n/a (hero)' : (ga === gb ? 'igual' : 'CANVIADA');
  console.log(`${nom.replace('.png', '').padEnd(14)} diferents=${pct.padStart(6)}%  forts=${pctFort.padStart(6)}%  DISPOSICIO=${disp}  caixa=${r.caixa ? r.caixa.join(',') : '-'}${mascara ? '  (hero ignorat)' : ''}`);
}
await chromiumB.close();
