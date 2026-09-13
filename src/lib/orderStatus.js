/**
 * Estats de la comanda (tal com es guarden a la base de dades) → què veu el
 * client a la pàgina de seguiment.
 *
 * PER QUÈ ÉS UN FITXER A PART
 *
 * Aquest mapa HA DE DIR LA VERITAT, i va estar dient mentides:
 *
 *   - 'seguiment' (la comanda ja té número de seguiment, o sigui que ja ha
 *     sortit del taller) es mostrava com "Processant"
 *   - 'cancel_lada' es mostrava com "Comanda rebuda i confirmada", de manera
 *     que un client amb la comanda cancel·lada llegia que tot anava bé
 *   - 'aturada' es mostrava com "Processant"
 *
 * Com que és informació que el client es creu, viu en un fitxer propi amb
 * proves automàtiques (tests/unit/order-status.test.js) que impedeixen que
 * torni a passar.
 */

// Etapes del recorregut normal d'una comanda.
export const STATUS_TO_STAGE = {
  'pendent': 'created',
  'confirmada': 'created',
  'en_preparacio': 'processing',
  'seguiment': 'shipped',
  'en_repartiment': 'shipped',
  'entregada': 'delivered',
};

// Estats que NO són una passa més del recorregut: la comanda no va endavant.
export const ESTATS_ANORMALS = ['cancel_lada', 'aturada'];

/**
 * Retorna l'avís que s'ha de mostrar per a una comanda cancel·lada o aturada,
 * o null si la comanda va pel camí normal.
 *
 * @param {string|null} estatOriginal estat tal com és a la base de dades
 */
export function avisDEstatAnormal(estatOriginal) {
  if (estatOriginal === 'cancel_lada') {
    return {
      titol: 'Comanda cancel·lada',
      text: "Aquesta comanda s'ha cancel·lat i no s'enviarà. Si ja l'havies pagada, et tornarem els diners al mateix mètode de pagament. Si tens qualsevol dubte, escriu-nos i t'ho expliquem.",
      classes: 'bg-red-50 border-red-200 text-red-900',
    };
  }

  if (estatOriginal === 'aturada') {
    return {
      titol: 'Comanda aturada',
      text: 'Hem aturat aquesta comanda per revisar-la. Ens posarem en contacte ben aviat per explicar-te què ha passat i com ho resolem.',
      classes: 'bg-amber-50 border-amber-200 text-amber-900',
    };
  }

  return null;
}
