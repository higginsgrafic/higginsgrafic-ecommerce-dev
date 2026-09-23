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
  { id: 'hero', label: 'Hero', esp: null, alcada: null },
  { id: 'colleccio-1', label: 'Galeria 1 · First Contact', esp: '--esp-4', alcada: '--esp-4' },
  { id: 'colleccio-2', label: 'Galeria 2 · The Human Inside', esp: '--esp-4', alcada: '--esp-4' },
  { id: 'colleccio-3', label: 'Galeria 3 · Austen', esp: '--esp-4', alcada: '--esp-4' },
  { id: 'colleccio-4', label: 'Galeria 4 · Cube', esp: '--esp-4', alcada: '--esp-4' },
  { id: 'colleccio-5', label: 'Galeria 5 · Miscel·lània', esp: '--esp-4', alcada: '--esp-4' },
  { id: 'poster', label: 'Pòster', esp: '--esp-4', alcada: '--esp-4' },
];

/**
 * LA HERO: LA SEVA PROPORCIO, que es la de disseny.
 *
 * `HERO_AMPLADA` es el 70,5 % del carril, i el 70,5 % es el vell
 * `transform: scale(0.705)`: la hero actual fa la mida de la caixa MULTIPLICADA
 * per 0,705, i aixo es el que fa que sembli de la mida que sembla. En comptes
 * d'escalar-la, la caixa nova FA DIRECTAMENT la mida final (952, no 1351) i
 * l'escala desapareix, amb el seu rastreig de `transform-origin` i el seu
 * efecte sobre els fills.
 *
 * LA CAIXA TE UNA PROPORCIO, NO UN NUMERO PER PANTALLA. Mesurada la relacio
 * ample/alcada de la hero visible a la pagina vella:
 *
 *     1920   2,3728      1280   2,3719
 *     1440   2,3722      1024   2,3711
 *
 * O sigui 952 / 401. Escrivint-la, la hero nova reprodueix la vella AMB MENYS DE
 * MIG PIXEL a les quatre mides d'escriptori (mesurat: −0,4 / +0,2 / +0,2 / +0,1).
 *
 * I A LA VISTA VERTICAL, LA MATEIXA PROPORCIO: alla la caixa de disseny fa
 * 541 x 430, o sigui 952 / 430. Tambe es una proporcio, i per aixo s'escriu
 * igual i no cal cap alcada en pixels.
 *
 * AIXO CANVIA LA MIDA, I S'HA DE MIRAR. La pagina vella, a 768x1024, fa la
 * caixa de 381,4 x 303,1: un factor de 430 px fixos que la deixa un 76 % MES
 * ALTA del que li toca per la seva amplada (381 x 172). Es el mateix patro que
 * l'aire: NOMES a 1920 la hero es on el disseny diu. A la resta de mides esta on
 * va quedar, i a la vista vertical el numero fix la fa mes alta que ampla.
 *
 * La decisio es del propietari: o s'accepta la proporcio (la hero vertical
 * s'abaixa de 303 a 172 px), o es conserva el 430 i aleshores es un número fix
 * mes que s'ha d'escriure amb el seu motiu.
 */
export const HERO_AMPLADA = 952;
export const HERO_ALCADA = 401;
/** L'alcada de la caixa de disseny a la vista vertical (541 x 430). Tambe es
 *  una proporcio, i per aixo s'escriu com a tal. */
export const HERO_ALCADA_VERTICAL = 430;

/**
 * L'AIRE DE LA HERO, com a fraccio de l'AMPLE DEL CARRIL (el total, els dos
 * costats junts).
 *
 * Es el complement del 70,5 % de la caixa: `1 − 0,705 = 0,295`, i aixo es el
 * que fa que la peça estigui centrada i que la caixa faci el 70,5 % del carril
 * sencer. El component el reparteix a parts iguals.
 *
 * MESURAT A LA PAGINA VELLA: amb un carril de 1350 la hero visible fa 952 i
 * queden 224,3 px d'aire a cada costat, o sigui 448,6 dels 1350 = el 33,2 %.
 *
 *     mida     aire esq./dreta   en % del carril   salt a la galeria 1
 *     1920        224,3 / 223,3        16,6 %              536,0
 *     1440        343,2 / 342,3        33,9 %              515,0
 *     1280        315,4 / 314,4        35,0 %              393,0
 *     1024        250,8 / 249,9        34,8 %              381,8
 *     768         186,3 / 185,3        34,3 %              238,7
 *
 * O sigui: NOMES A 1920 l'aire es el que el disseny demana. A 1440, 1280, 1024
 * i 768 es mes del DOBLE, i el salt a la primera galeria va de 536 a 239 px
 * sense cap relacio amb l'amplada. A les mides petites la hero no esta on el
 * disseny diu: esta on va quedar.
 *
 * AIXO ES UN CANVI DE DIBUIX, I S'HA DE MIRAR: la hero nova es veura mes ampla
 * del que es veu ara a 1440, 1280, 1024 i 768. A 1920 queda igual.
 */
export const HERO_AIRE_CARRIL = (1350 - HERO_AMPLADA) / 1350;

/** La ruta on es prova la pàgina nova sense afectar la botiga. */
export const RUTA_INICI_NOU = '/nova/inici';
