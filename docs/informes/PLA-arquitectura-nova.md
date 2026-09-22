# Pla d'arquitectura: refer la fonamenta de la pàgina

> Document de treball. **Cap canvi de codi no es fa fins que aquest pla estigui
> aprovat.** L'objectiu no és reescriure el projecte sinó treure'n l'orfebreria:
> que les coses funcionin perquè estan ben construïdes, no perquè algú hi va
> posar el número que tocava.

---

## 1. El diagnòstic, amb números

Mesurat al projecte (22/09/2026):

| fet | valor |
|---|---|
| fitxers de codi | 315 |
| línies | **86.616** |
| rutes definides | 98 |
| rutes del camí del client | **~12** |
| rutes d'eines (admin, dev, constructors) | 31 |

I el que de debò explica el problema, mesurat a la pàgina de col·lecció:

| | `/austen` (col·lecció) | `/austen/keep-calm` (PDP) |
|---|---|---|
| elements | 654 | 399 |
| `position: absolute` | **61** | 41 |
| posicions `top` en px fixos | **61** | — |
| alçades fixes > 40 px | **47** | — |
| graelles amb `aspect-ratio` fix | **3** | **0** |
| fondària d'anidament | **16 nivells** | — |

**Conclusió.** La PDP funciona perquè està **en flux**. La pàgina de col·lecció
no: està feta de 61 coordenades calibrades a mà sobre graelles d'aspecte fix,
amb marges negatius per sobreposar blocs. Per això **cada cop que el contingut
canvia una mica, un altre número deixa de quadrar**, i per això cada pedaç en
trenca dos. No hi ha cap columna vertebral de la pàgina: hi ha 61 acords
particulars.

**L'orfebreria no és a tot arreu: és concentrada.** L'inici (1.123 línies) està
en flux i es veu bé; les pàgines llegals, el checkout i les eines també. El pou
és el header (3.184 línies) i la composició de les col·leccions.

---

## 2. Abast: què es refà i què no

### Es refà (la fonamenta i les pàgines del client)

- el **marc de pàgina** (com es munten les pàgines, dalt a baix)
- el **sistema d'espaiat vertical** (4 números en un lloc, no 61 coordenades)
- la **composició de les 5 col·leccions**
- la **composició de l'inici** (quan toqui)
- la **composició de la PDP** (quan toqui)

### Es conserva (ha costat i està bé)

- el **header** i la barra de navegació (es refan **després**, en fase pròpia)
- el **megaslide** (el panell del cercador): va en flux i es veu bé
- les **targetes** de producte, preus, talles, noms partits
- la **hero**, la franja, els degradats, el pòster
- el **peu**
- les **dades**, els colors, les rutes, les imatges
- les **eines**: admin, dev, constructors, settings → **no es toquen**
- les pàgines **llegals**, checkout, compte → **no es toquen**
- els **462 tests**

### Es jubila (quan la nova pàgina estigui verificada)

- `CollectionVerticalPage.jsx` i la seva geometria calculada
- `Pauta4ColsOverlay` com a **esquelet** (es queda com a eina de depuració)
- els marges negatius de col·locació (`marginTop: -1366px` i companys)

---

## 3. Les regles de la fonamenta nova

1. **Una sola columna vertebral.** Cada pàgina és una successió de seccions
   **en flux normal**, en ordre de document. Res es col·loca amb `top` fix ni
   amb marge negatiu.
2. **L'alçada la mana el contingut.** Cap secció no té alçada pròpia; la treu
   del que hi ha a dins.
3. **Els aires es declaren, no es mesuren.** Una sola escala:
   `--esp-1` (petit), `--esp-2` (normal), `--esp-3` (secció), `--esp-4` (gran),
   una vegada per classe de dispositiu. Cap mesura de DOM per decidir un espai.
4. **Les graelles d'aspecte fix són decoració, mai esquelet.** El fons degradat
   d'una fitxa pot sortir de la seva caixa; el lloc on va la fitxa no.
5. **El peu cau sol**, perquè la pàgina acaba on acaba el contingut. Cap càlcul
   de marge.
6. **Una cosa, un lloc.** Si un número s'ha de tocar per canviar l'aspecte
   d'una pàgina, ha de ser a la configuració, amb nom, i en un sol lloc.

---

## 4. El full de ruta

| fase | què | porta de sortida |
|---|---|---|
| **0** | **Congelar la referència** | captures de les 5 col·leccions + inici a 768/1024/1440 |
| **1** | **La fonamenta**: marc de pàgina, escala d'espaiat, blocs buits | traces sense moviment a les 6 mides |
| **2** | **L'inici** (el cas més simple i compartit) | `/` idèntica o millor, verificada |
| **3** | **Una col·lecció** (`/cube`, la més curta) | `/cube` verificada a les 6 mides |
| **4** | **Les cinc col·leccions** | les 5 verificades i sense regressions |
| **5** | **El constructor de col·lecció** | `/constructor/colleccio` amb els mateixos aires |
| **6** | **La PDP i la resta del camí** | verificades |
| **7** | **El header** (fase pròpia i separada) | pla propi |

**Cada fase té la seva porta de sortida.** No es passa a la següent sense
complir-la.

---

## 5. Com es verifica

- **462 tests** (`npx vitest run`) — el nombre no pot baixar.
- `npm run compara-vistes` ha de dir **OK**.
- **Captures deterministes** de les 5 col·leccions × 5 mides
  (`scripts/captures-colleccions.mjs` + `compara-captures.mjs`).
- **Traces d'estabilitat**: cada element visible ha de tenir **un sol estat**
  (cap moviment) a 768/1024/1280/1440/1920.
- **Mesura d'aires**: una eina nova que comprova que les distàncies declarades
  es compleixen, i que **no hi ha cap element que desbordi el seu pare**.
- `npx vite build` ha de passar, i **no ha d'augmentar** de mida.

---

## 6. Com es construeix en paral·lel

- La pàgina vella **no es toca** mentre es construeix la nova.
- La nova viu al costat, **darrere d'una bandera de ruta** (es veu a
  `/nova/...` o amb un paràmetre), i es prova sense afectar ningú.
- Quan compleix la porta de sortida, **es canvia la ruta en un commit** (i es
  pot tornar enrere en un commit).
- **Cap esborrat** de codi vell fins que la ruta nova porta dies funcionant.

---

## 7. Fora d'abast (explícit)

- No es toquen les 31 rutes d'eines ni les pàgines llegals.
- No es toca la capa de dades ni el backend.
- No es canvia cap text, preu ni imatge.
- No es refan els tests existents; se n'afegeixen de nous per a la fonamenta.

---

## 8. Riscos i com els evito

| risc | mitigació |
|---|---|
| la pàgina nova no arriba a l'aspecte de l'actual | les captures de la fase 0 són el contracte |
| es trenca alguna cosa que funcionava | la ruta vella queda viva fins al final |
| el megaslide no encaixa a la pàgina nova | se li dona un forat net i no es toca per dins |
| el treball s'allarga i queda a mitges | cada fase deixa el projecte **en un estat millor o igual** |
| es perd el que s'ha après avui | tot el que hem après és aquí, com a regles |
