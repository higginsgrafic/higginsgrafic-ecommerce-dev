# INFORME — 04/10/2026 · Els flaixos en carregar, mesurats

En Marc: «Mira, quan refresco, què passa. Això és perquè l'iframe té retard o perquè carrega així
de malament?». **No és l'iframe**: la pàgina es pinta i tot seguit es recol·loca. Aquí hi ha la
línia de temps mesurada amb `scripts/_tmp-flaixos.mjs` (1376×954, 150 ms a 8 s).

## 1. El que ja està bé

Amb el megaslide **tancat**, tot queda estable de seguida i la hero té la mida bona des del primer
moment: `hero=[422,2; 1205; 473,6]` a 2,5 s, 3,5 s, 5 s i 8 s (idèntic). La mida de la hero ja no
fa cap flaix: és el `calc` del CSS.

## 2. El que encara es mou (megaslide obert, `?active=first_contact`)

| instant | vora | panell | hero (top) | p2franja | p2sel | cadenat |
|---|---|---|---|---|---|---|
| 1800 ms | **401** | **[27, 374]** | 422,2 | **115,6** | **47** | — |
| 2500 ms | 361 | [52,7, 309] | **460,3** | **328,2** | 72,7 | 384,1 |
| 3500 ms | 362 | [53, 309] | 421,3 | 203,2 | 73 | 369,5 |
| 8000 ms | 362 | [53, 309] | 421,3 | 203,2 | 73 | 369,5 |

La **mida** de la hero no es mou (473,6 a tots els instants ✓), però la seva **posició** sí (39 px
entre 2,5 s i 3,5 s). I el que més viatja és la franja de la p2 (**125 px**) i el panell, que a
1,8 s encara fa 374 px d'alçada començant a 27 (al final: 309 a 53).

## 3. La causa, en una frase

En carregar amb el megaslide obert, el panell **es munta tancat i s'obre amb l'animació**: les
peces hi viatgen a dins mentre el contingut (franja, selector, calibratges) acaba de convergir, i
això és el que es veu com un flaix. No és cap retard de l'iframe ni cap càrrega trencada.

## 4. Cap on va la solució

L'experiment de la branca **`feat/mega-escalfament`** (de Verdent) ataca exactament això: muntar
el panell **«dormint»** —fora del flux, invisible i sense clics, però amb la MATEIXA geometria que
obert— perquè tots els calibratges i resolucions convergeixin **abans** de la primera obertura.
El seu propi commit ho diu: «La pagina 2 del megaslide convergeix dins l'animacio d'obertura: fonts
escalfades i repas finals a 340/400 ms».

**Què cal decidir**: si s'agafa aquell experiment (merge) o si ho torno a fer a `main` amb el
mateix criteri, mesurant cada peça amb el guió nou. La segona opció és més lenta però deixa la
traça neta; la primera aprofita feina ja feta i verificada a mitges.

## 5. Nota del dia

Abans de mesurar res m'he trobat que **la pàgina no carregava** (22 imports reanomenats amb guió
baix que el mòdul no exporta, de la neteja del codi mort). Arreglat a `d078a9f6`; la bateria
(600/600 proves, eslint net, build OK) i la pàgina tornen a estar bé.
