// TEMPORAL (28/09/2026): LES TRES IMATGES DE L'ENCARREC, per ensenyar-les.
//
//   ABANS  · la p1 amb la pastilla a la capa dels botons (l'estat de `HEAD`),
//            reconstruida NOMES per a la captura amb un `z-index: 1` a la
//            pastilla (que es exactament el que hi havia: guanyava a l'ombra);
//   ARA    · la p1 amb la pastilla a la capa de la caixa, ABANS de l'ombra;
//   P2     · la referencia, amb la MATEIXA variant i una fila que cau sota
//            l'ombra.
//
// Desa `_tmp-pastilla-abans-ara-p2.png` (zoom x6 de la vora) i
// `_tmp-pastilla-blocs.png` (els tres blocs sencers, x2).
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { PNG } from 'pngjs';

const ZOOM = { x: 1394, y: 253, width: 26, height: 44 };
const ESC = 8;
const BLOC = { x: 1391, y: 79, width: 137, height: 264 };
const ESC_BLOC = 2;
const INDEX_P2 = 6;

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact&stripeVariant=color', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);

// La p2, a COLOR i amb una fila que cau sota l'ombra (INDEX 6).
await p.click('[data-mega-page-viewport="2"] [data-p2-color-selector] button[aria-label="Color"]').catch(() => {});
await p.waitForTimeout(4000);
await p.evaluate((i) => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  v2?.querySelectorAll('[data-colleccions-targeta]')?.[i]?.click();
}, INDEX_P2);
await p.waitForTimeout(6000);

const gris = (png, x, y) => {
  const i = (png.width * y + x) << 2;
  return Math.round(0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2]);
};

// La fila del mig de la pastilla de la p1 (y275), de x1388 a x1419.
const perfil = async (etiqueta) => {
  const buf = await p.screenshot({ clip: { x: 1388, y: 275, width: 32, height: 1 } });
  const png = PNG.sync.read(buf);
  const vals = [];
  for (let x = 0; x < 32; x++) vals.push(gris(png, x, 0));
  console.log(`${etiqueta.padEnd(8)} y275, x1388..1419: ${vals.map((v) => String(v).padStart(4)).join('')}`);
};

const captura = async (zona, escala) => {
  const buf = await p.screenshot({ clip: zona });
  return { buf: await sharp(buf).resize({ width: zona.width * escala, kernel: 'nearest' }).png().toBuffer(), bufCru: buf };
};

await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const carril = v1?.parentElement?.parentElement;
  if (carril) carril.style.transform = 'translateX(0)';
});
await p.waitForTimeout(1200);

const panells = [];
const panellsBloc = [];

// P2 (la referencia): despres de moure la p1 ja no hi es a la pantalla, o sigui
// que es captura PRIMER. Es torna a la p2 i despres a la p1.
await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const carril = v1?.parentElement?.parentElement;
  if (carril) carril.style.transform = 'translateX(-25%)';
});
await p.waitForTimeout(1200);
await perfil('P2');
panells.push(await captura(ZOOM, ESC));
panellsBloc.push(await captura(BLOC, ESC_BLOC));

await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const carril = v1?.parentElement?.parentElement;
  if (carril) carril.style.transform = 'translateX(0)';
});
await p.waitForTimeout(1200);

// ARA.
await perfil('ARA');
panells.push(await captura(ZOOM, ESC));
panellsBloc.push(await captura(BLOC, ESC_BLOC));

// ABANS: nome's per a la captura, es torna a posar la pastilla per damunt de
// l'ombra amb el `z-index: 1` que tenia.
await p.addStyleTag({ content: '[data-pastilla-p1="1"] > span[aria-hidden="true"] { z-index: 1 !important; }' });
await p.waitForTimeout(600);
await perfil('ABANS');
panells.push(await captura(ZOOM, ESC));
panellsBloc.push(await captura(BLOC, ESC_BLOC));

const etiquetes = ['ABANS (HEAD)', 'ARA', 'P2 (referencia)'];
const composa = async (llista, zona, escala, sortida) => {
  const w = zona.width * escala;
  const h = zona.height * escala;
  const gap = 24;
  const cap = 34;
  const ample = w * 3 + gap * 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ample}" height="${cap}">`
    + etiquetes.map((t, i) => `<text x="${i * (w + gap) + w / 2}" y="23" font-family="Helvetica,Arial" font-size="19" font-weight="bold" text-anchor="middle" fill="#111">${t}</text>`).join('')
    + '</svg>';
  await sharp({ create: { width: ample, height: h + cap, channels: 3, background: { r: 255, g: 255, b: 255 } } })
    .composite([
      { input: Buffer.from(svg), left: 0, top: 0 },
      ...llista.map((z, i) => ({ input: z.buf, left: i * (w + gap), top: cap })),
    ])
    .png()
    .toFile(sortida);
  console.log('desada', sortida);
};

// LES CAPTURES S'AGAFEN EN L'ORDRE P2, ARA, ABANS (la p2 s'ha de capturar
// primer, perque per capturar la p1 s'ha de moure el carril). Aqui es posen en
// l'ordre de les etiquetes.
const enOrdre = (llista) => [llista[2], llista[1], llista[0]];
await composa(enOrdre(panells), ZOOM, ESC, '_tmp-pastilla-abans-ara-p2.png');
await composa(enOrdre(panellsBloc), BLOC, ESC_BLOC, '_tmp-pastilla-blocs.png');

await ctx.close();
await b.close();
