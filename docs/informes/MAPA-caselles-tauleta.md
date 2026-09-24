# Mapa de caselles de la versió tauleta — full de paper

**Data:** 2026-09-24 · **Estat:** proposta per decidir. **No hi ha cap línia de
codi tocada.**
**Ve de:** `PLA-versio-tauleta-megaslide.md` §3 («el primer pas, i és de paper»).

---

## 1. Què és aquest document

Un mapa de **15 caselles per a cada una de les quatre pàgines** del megaslide
(col·leccions, cerca, cistell i compte), amb **una etiqueta a cada casella**.
Serveix per decidir **què hi va** abans de dibuixar res: quan les 60 caselles
tinguin nom, cada casella serà una peça, i la feina serà mecànica.

**El que no és:** no és codi, no canvia cap píxel, i no és cap mesura nova de la
geometria del lloc.

**Una cosa que cal saber abans de llegir-lo:** de les quatre pàgines, avui
**només la 1 i la 2 tenen la retícula muntada** (`TaulaVerticalP1` i
`TaulaVerticalP2`). Les pàgines 3 i 4 (cistell i compte) encara no tenen taula:
el seu mapa és nou de trinca.

---

## 2. La mida de la casella, mesurada avui

Mesurat amb Chromium contra el servidor del 3003 (`?active=first_contact`, les
taules `[data-taula-vertical="1"]` i `[data-taula-vertical="2"]`, amb `hasTouch`):

| port | carril de la taula | columna | **casella amb marges** | **alçada de la casella** | taula | panell |
|---|---|---|---|---|---|---|
| 768×1024 | 688 | 137,6 | **117,6** | **118,1** | 688×354,2 | 753×434,2 |
| 834×1194 | 754 | 150,8 | **130,8** | **131,4** | 754×394,2 | 819×474,2 |
| 1024×1366 | 938,9 | 187,8 | **167,8** | **168,4** | 939×505,2 | 1009×585,2 |

**Dues coses que aquesta mesura corregeix:**

1. **El pla deia que la casella fa 137×137. La mesura diu 117,6×118,1 a 768.**
   Els 137,6 són la **columna** (688 ÷ 5); les caselles que porten selector o
   fletxes perden 20 px de marge, i l'alçada **no** és 137 sinó 118,1 (la taula
   fa l'alçada de `alturaTaulaVertical` menys 15 px, repartida en 3 files). A
   1024 la casella fa 167,8×168,4, o sigui pràcticament quadrada, com a 768.
2. **La casella no és el problema.** A 768 fa **2,7 vegades** la referència
   tàctil de 44 px, i a 1024 **3,8 vegades**. El que no hi cap és **el que s'hi
   posa a dins**: la pauta de l'escriptori fa caselles de 57 px i una graella
   de 16×4. Amb una decisió per casella, 117,6 px són de sobres.

---

## 3. Les quatre regles del mapa

1. **Una decisió per casella.** Una casella és un dit: es tria, s'obre o
   s'escriu. No hi ha caselles amb tres coses petites a dins.
2. **Cap casella conté una graella** (ni un desplaçament intern, ni un scroll).
   Si una casella demana una graella, és que la retícula no és la bona per a
   aquella pàgina.
3. **La fila de dalt són les cinc portes de la pàgina.** Les **dues files de
   baix són deu caselles de peces**, i l'última és **l'acció** (finalitza, desa,
   més...). Si un nivell té més de nou peces, la desena casella és **«més»** i el
   nivell següent és **una altra taula**, no un scroll dins d'una casella.
4. **La imatge o la llegenda de fons no és una casella.** Si una pàgina té una
   imatge que ho explica tot (la samarreta de la col·lecció) o una llegenda
   (els sis estats d'una comanda), va **al fons de la taula**; la seva feina no
   és triar-se, i no ha de robar cap decisió.

---

## 4. Pàgina 1 — Col·leccions

```
            col 1            col 2            col 3         col 4            col 5
 fila 1   FIRST CONTACT   THE HUMAN INSIDE   AUSTEN        CUBE          MISCEL·LÀNIA
 fila 2   Dibuix 1        Dibuix 2           Dibuix 3      Dibuix 4      Dibuix 5
 fila 3   ◀ Enrere        Blanc              Color         Negre         Endavant ▶
```

**Fons de la taula:** la samarreta de la col·lecció triada (una sola imatge).

| cel·la | etiqueta | què decideix |
|---|---|---|
| 1 | FIRST CONTACT | tria la col·lecció (porta) |
| 2 | THE HUMAN INSIDE | tria la col·lecció |
| 3 | AUSTEN | tria la col·lecció |
| 4 | CUBE | tria la col·lecció |
| 5 | MISCEL·LÀNIA | tria la col·lecció |
| 6 | Dibuix 1 | tria un dibuix |
| 7 | Dibuix 2 | tria un dibuix |
| 8 | Dibuix 3 | tria un dibuix |
| 9 | Dibuix 4 | tria un dibuix |
| 10 | Dibuix 5 | tria un dibuix |
| 11 | ◀ Enrere | passa a la pàgina anterior de dibuixos |
| 12 | Blanc | variant de la samarreta |
| 13 | Color | variant de la samarreta |
| 14 | Negre | variant de la samarreta |
| 15 | Endavant ▶ | passa a la pàgina següent de dibuixos |

**Què substitueix.** Avui la primera casella de la taula és la **graella de set
dibuixos** (una graella dins d'una graella: és el que la fa densa), la franja
sencera és una altra casella, i el selector i les fletxes en són dues més. Al
mapa, **cada dibuix és una casella**, la franja passa a ser el fons, i el
selector són tres caselles.

---

## 5. Pàgina 2 — Cerca

```
            col 1 + col 2 (fusionades)      col 3          col 4        col 5
 fila 1   CAMP DE TEXT                    Col·lecció      Color        Talla
 fila 2   Resultat 1   Resultat 2   Resultat 3   Resultat 4   Resultat 5
 fila 3   Resultat 6   Resultat 7   Resultat 8   Resultat 9   Més resultats
```

| cel·la | etiqueta | què decideix |
|---|---|---|
| 1-2 | Camp de text | escriure què es busca |
| 3 | Col·lecció | filtre |
| 4 | Color | filtre |
| 5 | Talla | filtre |
| 6 | Resultat 1 | obre el resultat |
| 7 | Resultat 2 | obre el resultat |
| 8 | Resultat 3 | obre el resultat |
| 9 | Resultat 4 | obre el resultat |
| 10 | Resultat 5 | obre el resultat |
| 11 | Resultat 6 | obre el resultat |
| 12 | Resultat 7 | obre el resultat |
| 13 | Resultat 8 | obre el resultat |
| 14 | Resultat 9 | obre el resultat |
| 15 | Més resultats | pàgina següent de resultats |

**Què substitueix.** Avui la pàgina 2 posa a la taula la **graella de dibuixos
de 16×4** (64 dibuixos dins d'una casella), la **graella de colors de 4×4**, la
llista de col·leccions, el selector i la franja. Al mapa, cada resultat és una
casella i els filtres són tres caselles; la resta passa a nivells propis.

---

## 6. Pàgina 3 — Cistell

```
            col 1 + col 2 + col 3 (fusionades)     col 4            col 5
 fila 1   TOT PLEGAT FA (el total)               Codi de descompte  Buida el cistell
 fila 2   Línia 1     Línia 2     Línia 3     Línia 4     Línia 5
 fila 3   Línia 6     Línia 7     Línia 8     Línia 9     Finalitza la comanda
```

| cel·la | etiqueta | què decideix |
|---|---|---|
| 1-3 | TOT PLEGAT FA | mostra el total (no es tria) |
| 4 | Codi de descompte | escriure un codi |
| 5 | Buida el cistell | buidar |
| 6 | Línia 1 | obre la línia (talla i quantitat, al seu nivell) |
| 7 | Línia 2 | obre la línia |
| 8 | Línia 3 | obre la línia |
| 9 | Línia 4 | obre la línia |
| 10 | Línia 5 | obre la línia |
| 11 | Línia 6 | obre la línia |
| 12 | Línia 7 | obre la línia |
| 13 | Línia 8 | obre la línia |
| 14 | Línia 9 | obre la línia |
| 15 | Finalitza la comanda | pagar |

**Què substitueix.** Avui el cistell és una **pauta de 21 files i 6 columnes de
1350 px**, amb la imatge, la talla, la quantitat i el preu de cada línia dins
d'una graella, i un selector de **sis talles** a cada línia. Al mapa, cada línia
és una casella i la talla viu al nivell de la línia (on hi cap), no a dins.

---

## 7. Pàgina 4 — Compte

```
            col 1        col 2       col 3        col 4              col 5
 fila 1   Comandes     Missatges   Compte       (cinquena porta)   Tanca sessió
 fila 2   Peça 1       Peça 2      Peça 3       Peça 4             Peça 5
 fila 3   Peça 6       Peça 7      Peça 8       Peça 9             L'acció
```

| cel·la | etiqueta | què decideix |
|---|---|---|
| 1 | Comandes | entra a les comandes |
| 2 | Missatges | entra als missatges |
| 3 | Compte | entra a les dades (contacte i enviament) |
| 4 | (cinquena porta) | **per decidir** |
| 5 | Tanca sessió | sortir |
| 6-14 | Nou peces de l'entrada triada | una comanda, un missatge o un camp, una per casella |
| 15 | L'acció de l'entrada | Més (comandes) · Rebuts/Enviats (missatges) · Desa (dades) |

**Fons de la taula:** la llegenda dels sis estats, quan l'entrada oberta és
Comandes.

**Què substitueix.** Avui el compte és **una taula de comandes de cinc columnes**
(nombre, estat, seguiment, data, preu) amb **una llegenda de sis estats** dins la
columna, uns **missatges amb dues pestanyes** (rebuts i enviats) i **dues taules
de camps** (contacte i enviament). Al mapa, cada comanda és una casella, la
llegenda passa al fons i les pestanyes són una acció.

---

## 8. El que les quatre pàgines comparteixen

- **Fila 1: les cinc portes.** Sempre cinc, sempre a dalt, sempre amb el mateix
  pes. Canviar de porta canvia les deu caselles de sota sense sortir de la taula.
- **Files 2 i 3: nou peces i una acció.** L'acció sempre a l'última casella.
- **Cap nivell no s'obre dins d'una casella.** Si una peça demana més coses (una
  línia demana talla, una comanda demana detall), s'obre **una altra taula**.
- **El fons porta el que no es tria:** la samarreta (pàgina 1) i la llegenda dels
  estats (pàgina 4).

---

## 9. El que queda per decidir (per a l'amo)

1. **Pàgina 1 — la samarreta.** Al mapa és el **fons** de la taula. L'altra
   opció és que sigui una casella gran fusionada (com avui). El fons deixa més
   caselles per triar; la casella la fa més protagonista.
2. **Pàgina 1 — quants dibuixos per pàgina.** Al mapa n'hi ha **cinc** més les
   fletxes. L'altra opció és **nou dibuixos i una casella «més»**, sense
   fletxes.
3. **Pàgina 2 — els filtres.** Al mapa són **tres** (col·lecció, color, talla).
   Avui el cercador de l'escriptori no filtra per talla: cal decidir si la
   tauleta n'hi afegeix un o si el tercer filtre és una altra cosa.
4. **Pàgina 3 — la talla d'una línia.** Sis talles (XS–XXL) no caben en una
   casella. Al mapa, la casella de la línia **obre una altra taula** amb les sis
   talles. Cal confirmar-ho.
5. **Pàgina 3 — més de nou línies.** Cal decidir si la desena casella passa a
   ser «i N més» o si les línies es paginen.
6. **Pàgina 4 — la cinquena porta.** N'hi ha quatre de clares (Comandes,
   Missatges, Compte, Tanca sessió). La cinquena és una decisió de l'amo.
7. **Pàgina 4 — la fila de portes.** Cal decidir si, amb una entrada oberta, la
   fila de dalt continua sent les portes o passa a ser la navegació pròpia
   d'aquella entrada.

---

## 10. Com s'ha mesurat, i què no s'ha tocat

- **Mesura:** Chromium (Playwright) contra el servidor del **3003** que ja
  corria, a 768×1024, 834×1194 i 1024×1366, amb `?active=first_contact`, les
  taules `[data-taula-vertical="1"]` i `[data-taula-vertical="2"]` i la
  superfície `[data-mega-panel-surface="1"]`. El guió és temporal
  (`scripts/_tmp-*.mjs`) **i no es commita**.
- **Codi:** cap fitxer de `src/` tocat. Per això **no s'ha passat la bateria**:
  no hi ha res que compilar ni cap prova que pugui canviar de resultat. El que
  sí que s'ha comprovat és que el mòdul és viu abans de mesurar
  (`MarcInici.jsx` → 200), per no repetir la trampa del mòdul que no compila.
- **El que aquest document no afirma:** cap número de la geometria del lloc.
  L'única mesura que hi ha és la de la casella de la taula (§2), i és d'avui.
