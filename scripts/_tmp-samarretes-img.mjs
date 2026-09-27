// TEMPORAL — no es comiteja. On son les samarretes dins la imatge de la franja?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext()).newPage(); await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'domcontentloaded', timeout: 180000 });
const r = await p.evaluate(async () => {
  const analitza = async (url) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = 2866; c.height = 307;
    const g = c.getContext('2d');
    g.clearRect(0, 0, 2866, 307);
    g.drawImage(img, 0, 0, 2866, 307);
    const d = g.getImageData(0, 0, 2866, 307).data;
    const col = new Array(2866).fill(0);
    for (let x = 0; x < 2866; x++) {
      let s = 0;
      for (let y = 0; y < 307; y++) {
        const k = (y * 2866 + x) * 4;
        // "tinta": com de lluny es del blanc pur (o de transparent)
        const a = d[k + 3];
        if (a < 25) { s += 0; continue; }
        const min = Math.min(d[k], d[k + 1], d[k + 2]);
        s += (255 - min);
      }
      col[x] = s;
    }
    const max = Math.max(...col);
    const llindar = Math.max(30, max * 0.08);
    const trams = [];
    let ini = null;
    for (let x = 0; x < 2866; x++) {
      if (col[x] > llindar) { if (ini === null) ini = x; } else if (ini !== null) { trams.push([ini, x - 1, Math.round((ini + x - 1) / 2)]); ini = null; }
    }
    if (ini !== null) trams.push([ini, 2865, Math.round((ini + 2865) / 2)]);
    return { max: Math.round(max), llindar: Math.round(llindar), trams };
  };
  return {
    blanca: await analitza('http://127.0.0.1:3003/placeholders/cercador/full-white-stripe.webp'),
    doble: await analitza('http://127.0.0.1:3003/placeholders/tablet%20vertical/full-white-stripe-doble.webp'),
  };
});
for (const [k, v] of Object.entries(r)) {
  console.log(`${k}: max ${v.max} llindar ${v.llindar} trams ${v.trams.map((t) => `${t[0]}..${t[1]}(c${t[2]})`).join(' ')}`);
}
await b.close();
