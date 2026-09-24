# Enfocament: la versió tauleta del megaslide

**Data:** 2026-09-24 · **Estat:** proposta per decidir, sense codi començat.

---

## 1. El problema, mesurat

No és el breakpoint: és la densitat. A la tauleta vertical (768×1024, carril 688)
la pauta del megaslide dona:

| peça | mida | a qui ha de servir |
|---|---|---|
| panell sencer | 206–369 px d'alçada | un dit |
| graella de colors | **57×93 px** | un dit |
| casella de la taula vertical (5×3) | **137×137 px** | un dit |

O sigui: **la pauta fa caselles de 57 px i la taula en fa 137**. La referència
d'un objectiu tàctil és 44 px, però en una tauleta que es fa servir amb el dit i
amb la mà, 57 px vol dir encertar de miracle, i a sobre hi ha el selector, els
dibuixos i la franja competint pel mateix espai.

Per tant: el problema no es resol canviant el megaslide d'orientacio als
formats petits. **El que no cap es el contingut**, i allo demana una versio de
la disposicio, no un altre punt de tall.

## 2. La decisio de fons

**La versio tauleta es una TAULA de caselles grans, no la pauta encongida.**

Es a dir: en lloc d'encabir les peces de l'escriptori (graella, dibuixos,
selector, franja) en un panell baix, es reparteix **una decisio per casella** en
una reticula fixa i gran. Aixo ja esta comencat: `TaulaVertical.jsx` es una
reticula de **5 columnes x 3 files = 15 caselles** dins el carril de la tauleta.

La feina no es tant dibuixar la reticula (ja hi es) com **decidir que hi va a
cada casella**, i allo no es pot fer amb les peces de l'escriptori: s'han de
tornar a pensar per a la mida de la casella.

## 3. El primer pas, i es de paper

**Un mapa de caselles per a cada pagina.** Una graella de 5×3 amb una etiqueta a
cada casella dient que hi ha d'anar, i res mes. Sense codi, sense peces.

- **Pagina 1 — colleccions:** que es una colleccio, que es el selector, que es
  la imatge de la franja. (Avui la casella 1 es la graella de dibuixos, i allo
  es el que la fa densa: una graella dins d'una graella.)
- **Pagina 2 — cerca:** els resultats, el camp de text, els filtres.
- **Pagina 3 — cistell:** les linies, el total, el boto.
- **Pagina 4 — compte:** les entrades.

Quan les 15 caselles de cada pagina tinguin nom, la resta es mecanica: cada
casella es una peca, i cap peca pot contenir una altra graella.

## 4. La frontera

Amb el contingut resolt, la frontera deixa de ser urgent, pero ha de ser UNA:

| format | disposicio |
|---|---|
| escriptori (992 en amunt, apaïsat) | pauta |
| tauleta vertical (600–1024, h > w) | **taula** |
| apaïsat 768–991 | a decidir: pauta amb carril limitat (ja arreglat) o taula si hi ha alcada |
| apaïsat per sota de 768 | **full de mobil** (es el que ja fa el mateix mobil en vertical) |

## 5. El parany a evitar

Posar-hi les peces de l'escriptori a dins de les caselles. Es exactament el que
fa que avui sigui dens: una graella de dibuixos dins d'una casella d'una graella.
Si una casella demana una graella, es que la reticula no es la bona per a
aquella pagina.

## 6. Que ja esta fet i no s'ha de refer

- El carril de l'apaisada no pot ser mes ample que la finestra (commit
  `856946c`): a 768–932 apaïsat les icones de la capcalera queien fora de la
  pantalla i no es podia obrir ni el cistell.
- `CapaTaulaVertical` + `TaulaVertical` son la bastida de la versio tauleta:
  una capa absoluta, centrada al carril, que no mou el layout de sota.
- Les mides de la tauleta (106/116 px de capcalera, carril de 992, `--site-w`)
  estan calibrades i `compara-vistes` les vigila.
