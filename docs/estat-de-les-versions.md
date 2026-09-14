# Estat de les versions del checkout

Aquest fitxer és el recordatori de com està repartida la feina entre les quatre
versions de la botiga (escriptori, tauleta apaïsada, tauleta vertical i mòbil),
perquè no s'hagi de repetir cada cop.

## Versió vertical: CONGELADA

La **tauleta vertical està congelada**. No s'hi fa cap canvi tret que es demani
explícitament, i si es demana, es torna a congelar tot seguit.

Números verificats en el moment de congelar-la (1024×1366 i 820×1180):

| Què | Valor |
|---|---|
| Títol PAGAMENT | 128 px |
| Guia verda (títol + 20) | 177 |
| Guia blava (mega-slide − 20) | 405 |
| Bloc de productes | 177 → 405 (228 px d'alçada de fitxa) |
| Columnes del formulari | 509 |
| Alçada de tots els camps i del botó | 39 px |
| Amplada de la targeta de totals | 220 px |
| Gap entre fitxes | 5 px |
| Gap última fitxa → totals | 14 px |
| Enllaços de col·leccions (2n header) | 103 |
| "Necessites factura?" (tinta) ↔ Ciutat (fons) | 724 |
| Camp de CIF (fons) ↔ País (fons) | 812 |
| "Accepto els Termes" ↔ Correu | 817 |
| Botó de pagar (fons) ↔ Telèfon (fons) | 900 |

**Compte**: aquests números surten de constants fetes a mà. Si es canvia alguna
cosa compartida (l'alçada del header, els camps del formulari, la fitxa de
producte, la tipografia dels títols), cal tornar a comprovar la vertical.

## Versions en curs

- **Escriptori i tauleta apaïsada**: són les que es toquen ara.
- **Mòbil**: l'última de tot.

## Guies de color (temporals)

`src/components/dev/MegaslideEndGuide.jsx` dibuixa tres línies de referència al
checkout (títol + 20, mega-slide − 20 i el final del mega-slide). Estan
**apagades per defecte**: només surten amb `?megaslide=1` a l'adreça o prement
Alt+M. A la vertical no s'hi apliquen. **S'han d'esborrar quan s'acabi la
feina**: el component i la línia que l'importa a `CheckoutPage.jsx`.

## Regla de publicació

**No es puja res ni es desplega res si no ho demana explícitament.** La feina es
queda committed al despatx local i s'hi acumula; quan digui que sí, es puja i es
desplega tot de cop i es verifica contra el lloc publicat.

## Pendents apuntats

- **Esborrar les dades de prova**: el cistell i les comandes de proves fetes
  durant el desenvolupament (productes NX-01 / CYLON-78 / WORMHOLE, comandes de
  test a Supabase, etc.). Cal netejar-ho abans de publicar de debò.

- **El rebot del mega-slide** (apaisada i escriptori): l'alçada del panell surt
  d'una mesura del contingut de la columna 1 que va canviant mentre les imatges
  de la franja carreguen (428 -> 405 -> 365). El rebot no és el panell, sinó el
  header, que creix amb cada mesura. La vertical no el té perquè la seva alçada
  és fixa (269px). Solucions possibles: (a) esperar que les imatges de la franja
  estiguin carregades abans d'obrir, (b) guardar l'última alçada bona i fer-la
  servir des del primer fotograma.

## Feina pendent

Per ordre d'importància:

1. **Esborrar les dades de prova**. Inventari fet el 14/09 (nomes lectura):
   - `orders`: **0 files**. No hi ha cap comanda de prova.
   - `profiles`: 2 comptes.
   - `addresses`: 2 adreces (Granollers i Barcelona).
   - Cataleg: 63 productes, 3990 variants, 62 imatges, 152 mockups, 6 colleccions.
   Cal que en Marc digui quins dels 2 comptes, les 2 adreces i quins productes
   son de prova abans d'esborrar-hi res. El cistell del navegador tambe es de
   proves (es buida des del mateix navegador).
2. **El mega-slide de les col·leccions**: fa un ajust d'alçada en la PRIMERA
   obertura (347 -> 284 a l'apaisada, 395 -> 336 a l'escriptori). La causa és
   que la pàgina 1 del panell es munta ~300ms tard i fins llavors el panell fa
   servir la reserva. La via neta és muntar la pàgina 1 abans d'obrir.
3. **El mòbil**: el mateix ajust (270 -> 195). Allà el formulari no queda tapat.
4. **Les targetes clonades del rail** (`TambeRail`): el carrusel ja està fora
   (sense gestos ni fletxes), però per dins encara fa servir targetes clonades
   (`CLONE_COUNT = 3`): al DOM hi ha 10 enllaços i només 4 es veuen. Són
   enllaços duplicats que Google i els lectors de pantalla sí que veuen.
5. **Avisos antics de lint** que no s'han tocat: `react-hooks` (ordre i
   dependències dels efectes) i quatre apòstrofs sense escapar al checkout.
