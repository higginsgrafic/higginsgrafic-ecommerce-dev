/**
 * EL FULL DE LES SILUETES DE SAMARRETA, AMB LA SEVA MEMORIA (26/09/2026)
 * -----------------------------------------------------------------------------
 * Els dos panells de la franja (pagina 1 i pagina 2) i les seves mascares (les
 * samarretes buides i les de les colleccions inactives) fan servir el mateix
 * fitxer (`full-clic-area-5.svg`, catorze siluetes).
 *
 * PER QUE EXISTEIX
 *
 * Cada panell se'l demanava pel seu compte dins d'un efecte, o sigui que el
 * full arribava DESPRES de muntar el panell i el vel apareixia a mig obrir
 * (mesurat amb la CPU alentida: a opacitat 1,00, amb el megaslide ja visible).
 *
 * Aqui es descarrega UNA sola vegada i el text es queda a memoria. La porta
 * d'obertura del megaslide el precarrega ABANS de muntar el panell, i els
 * components el poden llegir de manera SINCRONA, de manera que el vel neix en
 * el mateix primer render.
 */
const URL_SILUETES = '/placeholders/cercador/full-clic-area-5.svg';

let textCache = null;
let promesaCache = null;

/** Demana el full una sola vegada i en desa el text. */
export function precarregaSiluetesSamarreta() {
  if (!promesaCache) {
    promesaCache = fetch(URL_SILUETES)
      .then((r) => r.text())
      .then((text) => {
        textCache = text;
        return text;
      })
      .catch(() => null);
  }
  return promesaCache;
}

/** El text del full si ja es a memoria (null si encara no ha arribat). */
export function textSiluetesSamarreta() {
  return textCache;
}

/**
 * ELS CATORZE CAMINS DEL FULL DE SILUETES, EN ORDRE DE CASA (27/09/2026).
 *
 * El full es pot dir de dues maneres i totes dues s'han d'acceptar:
 *
 *   - amb `class="tshirt-outline"` a cada cami (el full de sempre, i el que fa
 *     servir el CSS de les arees de clic);
 *   - amb `id="_1".."_14"` i `affinity:id`, sense cap classe: es el full nou
 *     que va desar l'amo el 27/09/2026 a la tarda. Sense aquesta segona via, el
 *     vel es quedava sense siluetes (`generaVelDataUrl` tornava null) i les
 *     arees de clic es pintaven amb el seu propi color damunt de la franja
 *     (mesurat: la franja sencera de blau `rgb(0,145,255)`).
 *
 * L'ordre dels camins al document es l'ordre de les cases (0 a 13).
 *
 * @param {Document} doc el full ja parsejat
 * @returns {SVGPathElement[]} els catorze camins, o els que hi hagi
 */
export function caminsSiluetes(doc) {
  const ambClasse = [...doc.querySelectorAll('.tshirt-outline')];
  if (ambClasse.length >= 14) return ambClasse.slice(0, 14);
  const tots = [...doc.querySelectorAll('path')].filter((p) => p.getAttribute('d'));
  return tots.slice(0, 14);
}
