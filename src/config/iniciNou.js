/**
 * ============================================================================
 *  LA PÀGINA D'INICI NOVA — l'esquelet
 * ============================================================================
 *
 * QUÈ ÉS. La llista de seccions de la pàgina d'inici que es construeix al
 * costat de l'actual, darrere la ruta `/nova/inici`. És l'única part d'aquesta
 * pàgina que és DADES i no JSX, i per això viu aquí: així l'esquelet es pot
 * fixar amb proves sense muntar cap component.
 *
 * PER QUÈ ES CONSTRUEIX AL COSTAT. `docs/informes/PLA-arquitectura-nova.md` §6:
 * la pàgina vella no es toca mentre es construeix la nova, i no s'esborra codi
 * vell fins que la ruta nova porta dies funcionant. El motiu és que la
 * geometria de l'inici actual està feta de números calibrats que es desfan els
 * uns als altres: cada arranjament en trenca dos, i sense una ruta on provar-ho
 * tot cada passa es veu en directe a la botiga.
 *
 * LES REGLES QUE COMPLEIX AQUEST ESQUELET, i que són les de §3 del pla:
 *
 *   1. Una sola columna vertebral: les seccions van en flux i en ordre de
 *      document. Cap `position: absolute`, cap `top` en píxels.
 *   2. L'alçada la mana el contingut. L'esquelet no en declara cap; les caixes
 *      de `--esp-4` són NOMÉS per veure l'esquelet mentre està buit.
 *   3. Els aires es declaren, no es mesuren: cada secció diu quin `--esp-*`
 *      porta, i no hi ha cap número de píxels enlloc.
 *   4. Cap mesura del DOM per decidir un espai.
 */

/**
 * Una secció de l'inici.
 *
 * `id`    àncora estable per a les proves i per identificar-la al navegador
 * `label` el nom que es veu a l'esquelet
 * `esp`   quin token de l'escala d'espaiat porta a sobre. `null` la primera
 * `alcada` NOMÉS per a l'esquelet buit: quin `--esp-*` fa de caixa provisional
 */
export const SECCIONS_INICI = [
  { id: 'hero', label: 'Hero', esp: null, alcada: '--esp-4' },
  { id: 'colleccio-1', label: 'Galeria 1 · First Contact', esp: '--esp-4', alcada: '--esp-4' },
  { id: 'colleccio-2', label: 'Galeria 2 · The Human Inside', esp: '--esp-4', alcada: '--esp-4' },
  { id: 'colleccio-3', label: 'Galeria 3 · Austen', esp: '--esp-4', alcada: '--esp-4' },
  { id: 'colleccio-4', label: 'Galeria 4 · Cube', esp: '--esp-4', alcada: '--esp-4' },
  { id: 'colleccio-5', label: 'Galeria 5 · Miscel·lània', esp: '--esp-4', alcada: '--esp-4' },
  { id: 'poster', label: 'Pòster', esp: '--esp-4', alcada: '--esp-4' },
];

/** La ruta on es prova la pàgina nova sense afectar la botiga. */
export const RUTA_INICI_NOU = '/nova/inici';
