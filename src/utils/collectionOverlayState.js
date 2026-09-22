/**
 * L'estat de les capes del constructor de colleccio (opacitat de la pauta, de
 * la taula i del fons), guardat a `localStorage` per colleccio.
 *
 * Cada pagina tenia la seva propia clau (`hg.constructorColleccioCopyN...`): la
 * N es el numero de copia de la pagina, i es el que fa que cada colleccio
 * recordi el seu estat sense trepitjar el de les altres. El numero viu a
 * `config/collectionVertical.js` perque ha de coincidir amb el que hi havia:
 * canviar-lo fa perdre l'estat desat.
 */

const DEFAULT_OVERLAY_STATE = {
  pautaOpacity: 1,
  tableOpacity: 1,
  backgroundOpacity: 1,
};

const clau = (copy) => `hg.constructorColleccioCopy${copy}.overlayOpacity.v1`;

export function readOverlayState(copy) {
  try {
    const raw = window.localStorage.getItem(clau(copy));
    if (!raw) return DEFAULT_OVERLAY_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_OVERLAY_STATE, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
  } catch {
    return DEFAULT_OVERLAY_STATE;
  }
}

export function writeOverlayState(copy, overlayState) {
  try {
    window.localStorage.setItem(clau(copy), JSON.stringify(overlayState));
  } catch {
    // ignore: si el navegador no deixa escriure, l'estat simplement no es desa
  }
}
