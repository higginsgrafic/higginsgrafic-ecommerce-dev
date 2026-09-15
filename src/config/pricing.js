// =============================================================================
//  Preu de venda — FONT ÚNICA
// -----------------------------------------------------------------------------
//  Nomes hi ha d'haver un preu a tota la botiga: 15,50 € (IVA inclòs).
//
//  Aquest fitxer el fan servir:
//    - la sincronitzacio amb Gelato (scripts/sync-gelato-products.js)
//    - l'api de sincronitzacio de la pagina d'administracio (api/gelato-sync.js)
//    - els components que mostren el preu
//
//  IMPORTANT: el preu de Gelato es el COST, no el preu de venda. La
//  sincronitzacio ha d'escriure sempre aquest preu, mai el de Gelato.
//
//  Aquest modul es JavaScript pla, sense dependències ni JSX, perque tambe
//  l'ha de poder importar l'script de Node.
// =============================================================================

export const SELLING_PRICE = 15.5;

// Tipus general d'IVA aplicable (21%). El preu de venda ja el porta inclòs,
// tambe el de l'enviament.
export const IVA_RATE = 0.21;

/** Preu de venda ja format per mostrar: "15,50€" */
export const SELLING_PRICE_LABEL = `${SELLING_PRICE.toFixed(2).replace('.', ',')}€`;

/** Formata un preu com el mostrem nosaltres: 15.5 -> "15,50€" */
export function formatPrice(value = SELLING_PRICE) {
  const n = Number(value);
  if (!Number.isFinite(n)) return SELLING_PRICE_LABEL;
  return `${n.toFixed(2).replace('.', ',')}€`;
}
