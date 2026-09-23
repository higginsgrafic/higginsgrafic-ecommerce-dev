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

/**
 * LES CINC COLLECCIONS DE L'INICI.
 *
 * `titleOffsetY`, `numberAlign` i `numberOffsetX` son el DIBUIX de cada
 * colleccio: el numero de fons i el titol es mouen per composicio, i cada una
 * te el seu. Son els MATEIXOS valors que te la pagina vella, perque aquesta
 * passa no es sobre el dibuix dels titols.
 */
export const COLLECCIONS_INICI = [
  {
    id: 'colleccio-1', slug: 'first-contact', name: 'FIRST CONTACT', href: '/first-contact',
    label: 'Galeria 1 · First Contact',
    title: 'First Contact', subtitle: 'LA CIÈNCIA FICCIÓ QUE MIRA ENDINS',
    titleOffsetY: 5, numberAlign: 'left', numberOffsetX: -36,
  },
  {
    id: 'colleccio-2', slug: 'the-human-inside', name: 'THE HUMAN INSIDE', href: '/the-human-inside',
    label: 'Galeria 2 · The Human Inside',
    title: 'THE HUMAN INSIDE', subtitle: 'EN EL TEU RACÓ MÉS PROFUND HI HA UN HEROI',
    titleOffsetY: -1, numberAlign: 'right', numberOffsetX: 1,
  },
  {
    id: 'colleccio-3', slug: 'austen', name: 'AUSTEN', href: '/austen',
    label: 'Galeria 3 · Austen',
    title: 'Austen', subtitle: 'DIGUIS EL QUE DIGUIS, FES-HO AMB ELEGÀNCIA',
    titleOffsetY: -4, numberAlign: 'left', numberOffsetX: -22,
  },
  {
    id: 'colleccio-4', slug: 'cube', name: 'CUBE', href: '/cube',
    label: 'Galeria 4 · Cube',
    title: 'Cube', subtitle: 'TOTS SOM ESTRANYS A ULLS NOSTRES',
    titleOffsetY: 13, numberAlign: 'right', numberOffsetX: 19,
  },
  {
    id: 'colleccio-5', slug: 'miscellania', name: 'MISCEL·LÀNIA', href: '/miscellania',
    label: 'Galeria 5 · Miscel·lània',
    title: 'MISCEL·LÀNIA', subtitle: 'MÉS VAL SOL QUE MAL ACOMPANYAT',
    titleOffsetY: 9, numberAlign: 'left', numberOffsetX: -22,
  },
];

/**
 * LA MIDA DE LLETRA DEL TITOL DE COLLECCIO, en unitats de carril.
 *
 * MESURAT A LA PAGINA VELLA, i es la troballa que explica per que l'aire entre
 * galeries no sortia constant:
 *
 *     mida     carril   font h2   sobreeixit del text   en UNITATS DE CARRIL
 *     1920     1350,0     84,5          27,0                   27,0
 *     1440     1012,5     63,4          21,0                   28,0
 *     1280      900,0     56,3          18,0                   27,0
 *     1024      720,0     45,1          15,0                   28,1
 *      768      540,0     33,8          11,0                   27,5
 *
 * El SOBREEIXIT del text (el que el text puja per sobre de la seva caixa, per
 * `line-height: 0.85`) es constant en unitats de carril: 27. El que no ho es, es
 * el `font-size`, que estava escrit `4.4vw`: el 4,4 % de la FINESTRA. Com que la
 * finestra i el carril nomes son proporcionals fins a 1920 (a partir d'alla el
 * carril te un topall de 1350 i la finestra no), el text del titol es l'unic
 * element de la galeria que no escala amb el carril.
 *
 * Escrivint la mida en unitats de carril, tot el bloc escala junt: el text, el
 * seu sobreeixit i el voladis de la pindola. I aleshores l'aire entre galeries
 * es constant de debò, i no cal cap correccio per mida.
 *
 * La mida de disseny es 84,5 px sobre 1350, i el carril es `--esp-4 * 11,25`
 * (1350 / 120): per aixo la mida s'escriu com 84,5 / (120 * 11,25).
 */
export const TITOL_MIDA_U = 84.5;
export const TITOL_MIDA_ESP4 = TITOL_MIDA_U / 1350;

/**
 * EL MARGE ENTRE LA CAIXA DEL TITOL I LES FITXES, en unitats de disseny.
 *
 * Son 76,8, i no els 130 de la pagina vella, perque **la caixa del titol ha
 * deixat de desbordar-se**: amb `line-height: normal` la caixa conte el text, i
 * com que creix cap avall, el marge ha de disminuir exactament el que ha
 * crescut perque el TEXT quedi on era.
 *
 *     marge = 130 − (caixa_normal − caixa_0,85)
 *
 * I la diferencia es constant en unitats de disseny, perque la caixa i el cos
 * del titol escalen tots dos amb la mateixa unitat: 53,2 a 1920 i 40,1 a 1440.
 *
 * ES APLICA SOBRE L'AIRE DE LA SECCIO. Amb la caixa que conte el text, el text
 * del titol arrenca 76,8 unitats DESPRES de l'inici del seu bloc (el marge
 * propi del titol mes el que la seva caixa hi afegeix). O sigui que el bloc pot
 * pujar aquestes 76,8 unitats sense que el text es mogui, i el marge de la
 * seccio les ha de descomptar: `marge = aire × (76,8 / 120)`.
 *
 * MESURAT a 1920: marge = 120 × 0,64 = 76,8, i el TEXT queda 106,4 unitats sota
 * l'inici del bloc, que es exactament el que hi havia abans del canvi.
 */
export const TITOL_CARDS_FACTOR = 76.8 / 120;

/**
 * LES ICONES DE COLLECCIO.
 *
 * Son les cinc mateixes que la pagina vella dibuixa amb un `filter:
 * brightness(0)`, o sigui en negre, i amb la mida del grup d'Austen (70,4 px
 * d'alcada) com a referencia de volum. El dibuix de First Contact es mes ample
 * que alt i es mes gran (99 px), i per aixo porta la seva propia mida.
 */
export const ICONES_COLLECCIONS = [
  { id: 'first-contact', name: 'First Contact', href: '/first-contact', icon: '/custom_logos/collections/collection-first-contact-logo.webp' },
  { id: 'the-human-inside', name: 'The Human Inside', href: '/the-human-inside', icon: '/custom_logos/collections/collection-thin-logo.svg' },
  { id: 'austen', name: 'Austen', href: '/austen', icon: '/custom_logos/collections/collection-jean-austen-logo.svg' },
  { id: 'cube', name: 'Cube', href: '/cube', icon: '/custom_logos/collections/collection-cube-logo.svg' },
  { id: 'miscellania', name: 'Miscel·lània', href: '/miscellania', icon: '/custom_logos/collections/collection-miscellania-logo.svg' },
];

/** L'alcada de referencia de les icones, en unitats de disseny. */
export const ICONA_ALCADA_U = 70.4;
/** First Contact es mes ample que alt i es dibuixa mes gran. */
export const ICONA_ALCADA_FC_U = 99;
