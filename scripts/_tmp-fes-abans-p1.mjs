// Reverteix NOME'S els tres canvis d'aquesta tongada (02/10/2026) i desa el
// resultat a la ruta que es passi. Serveix per mesurar el «abans» sense tocar
// la resta de feina sense commitar.
import { readFileSync, writeFileSync } from 'node:fs';
const [origen, desti] = process.argv.slice(2);
let t = readFileSync(origen, 'utf8');
const canvis = [
  ['...((esComposicioEstretaP1 && !esAjust1024P1) ?', '...(esComposicioEstretaP1 ?'],
  ['{!esAjust1024P1 && ombraManigaP1 && mascaraManigaP1 ? (', '{ombraManigaP1 && mascaraManigaP1 ? ('],
];
for (const [de, a] of canvis) {
  const n = t.split(de).length - 1;
  if (n !== 1) throw new Error(`esperava 1 ocurrencia de «${de}» i n'hi ha ${n}`);
  t = t.replace(de, a);
}
// El bloc de l'ombra dins la peca del selector (sencer, comentari inclos).
const inici = t.indexOf('                {/* L\'OMBRA DE LA MANIGA, AMB LA PEÇA DEL SELECTOR (02/10/2026).');
const final = t.indexOf('                <SelectorQuadratPagina1');
if (inici < 0 || final < 0 || final < inici) throw new Error('no he trobat el bloc de l\'ombra de la peca');
t = t.slice(0, inici) + t.slice(final);
// I la capa difosa compartida + l'amplada del bloc: fora.
const iniciCapa = t.indexOf('  // L\'AMPLADA DEL BLOC A 1024, EN NUMERO (02/10/2026).');
const finalCapa = t.indexOf('  return (', iniciCapa);
if (iniciCapa < 0 || finalCapa < 0 || finalCapa < iniciCapa) throw new Error('no he trobat el bloc de la capa difosa');
t = t.slice(0, iniciCapa) + t.slice(finalCapa);
// El contingut de l'ombra, que amb el canvi era una variable, torna a ser inline.
const contingut = `                    <div style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: \`rgba(0, 0, 0, \${OMBRA_MANIGA_ALFA})\`,
                      WebkitMaskImage: \`url("\${mascaraManigaP1}")\`,
                      maskImage: \`url("\${mascaraManigaP1}")\`,
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskSize: '103% 100%',
                      maskSize: '103% 100%',
                      WebkitMaskPosition: '50% 0',
                      maskPosition: '50% 0',
                    }} />`;
const n = t.split('                    {capaDifosaOmbraManigaP1}').length - 1;
if (n !== 1) throw new Error(`esperava 1 us de capaDifosaOmbraManigaP1 i n'hi ha ${n}`);
t = t.replace('                    {capaDifosaOmbraManigaP1}', contingut);
writeFileSync(desti, t);
console.log(`escrit ${desti} (${t.length} bytes)`);
