// TEMPORAL: referencia del 23/09 contra l'estat d'ara amb l'arranjament.
import sharp from 'sharp';
for (const [quin, ref, ara] of [['p1', '_tmp-vert-e479d2fa-p1.png', '_tmp-vertical-p1.png'], ['p2', '_tmp-vert-e479d2fa-p2.png', '_tmp-vertical-768.png']]) {
  const W = 470, CAP = 32, GAP = 20;
  const imgs = [];
  for (const [f, t] of [[ref, '23/09 (referencia)'], [ara, 'ARA (amb l arranjament)']]) {
    const b = await sharp(f).resize({ width: W }).png().toBuffer();
    const m = await sharp(b).metadata();
    imgs.push({ b, h: m.height, t });
  }
  const ample = 2 * W + GAP, alt = imgs[0].h + CAP;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ample}" height="${alt}">` + imgs.map((im, i) => `<text x="${i * (W + GAP) + W / 2}" y="21" font-family="Helvetica,Arial" font-size="17" font-weight="bold" text-anchor="middle" fill="#111">${im.t}</text>`).join('') + '</svg>';
  const comps = [{ input: Buffer.from(svg), left: 0, top: 0 }];
  imgs.forEach((im, i) => comps.push({ input: im.b, left: i * (W + GAP), top: CAP }));
  await sharp({ create: { width: ample, height: alt, channels: 3, background: { r: 255, g: 255, b: 255 } } }).composite(comps).png().toFile(`_tmp-vert-${quin}-comparat.png`);
  console.log(`desada _tmp-vert-${quin}-comparat.png`);
}
