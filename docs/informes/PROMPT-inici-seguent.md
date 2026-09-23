# PROMPT D'INICI PER A LA SESSIÓ SEGÜENT

> Copia i enganxa això tal qual com a primer missatge de la sessió nova.
> **Data de redacció:** 23/09/2026 · **Últim commit:** `dd60633`

---

Treballes al projecte **higginsgrafic-ecommerce-dev**
(`/Users/marc/EXTRA LOCAL/PROJECTES LOCAL/GRUP HIGGINS/GRÀFIC/BOTIGUES/ECOMMERCE/PROJECTE/ECOMMERCE-WEB/higginsgrafic-ecommerce-dev`).

## PRIMER DE TOT

Llegeix aquests quatre documents i **no facis res més** fins a haver-los llegit:

1. **`docs/informes/TESTIMONI-2026-09-23.md`** — què s'ha fet a la sessió anterior, amb
   la causa de cada cosa, **i sobretot la secció 4: «On NO s'ha de mirar per mesurar»**.
   Aquesta secció val més que la resta: són set trampes que van costar hores.
2. **`docs/informes/MAPA-calibratges.md`** — l'inventari dels números que governen la
   geometria, amb el seu origen de disseny.
3. **`docs/constitucio.md`** — **sobretot la regla 15: «Pedaços, si es poden evitar,
   no».**
4. **`docs/informes/PLA-arquitectura-nova.md`** — el pla de fons (secció 9 per a la hero,
   secció 10 per a l'informe de la sessió anterior).

## La feina pendent, i per on començar

**Decisió de l'amo:** acabar la **reestructuració** i deixar les **proporcions** per més
endavant («ja arreglarem les proporcions més endavant»).

### El següent pas, ja acordat amb l'amo

**Unificar les cinc seccions de la pàgina d'inici** en una sola peça `HomeColleccio`.

- Els blocs 02 a 05 són **107 línies × 4** (el 05 en té 148) i gairebé tot és còpia: el
  mateix embolcall, el mateix bloc de títol, els mateixos quatre `gridColumn`, la mateixa
  píndola.
- **El que és diferent:** títol, subtítol, `href`, `slug`, `editableIdPrefix`, el marge de
  dalt i els offsets del títol.
- **Els pedaços a treure:** els quatre marges `HOME_COLLECCIO_MARGIN_PX`
  (**129, 162, 104, 124**) i els ajustos que el codi encara anomena («+15 avall», «−1 fila
  amunt», «+20 avall»). **El codi ja diu que vol 190 px** (5 files del llenç:
  `5 × 74,53 × 0,51 = 190,0`).
- **Les distàncies no s'esborren: s'unifiquen i s'escriuen una sola vegada.**
- **Avís:** això mourà les col·leccions verticalment (el 129 passa a 190 i el 104 a 190),
  i **l'amo ho ha acceptat explícitament**.

### Després

3. **Una col·lecció** (`/cube`) i després les cinc. `CollectionVerticalPage` té **61
   posicions `top` en píxels fixos** i **10 marges negatius**: és el pou del pla.
4. El constructor de col·lecció, la PDP, i el header (fase 7, amb pla propi).
5. `TdpVariantsGallery`: encara té el `− 231` i el patró vell, és la germana de la
   galeria de l'inici que ja s'ha arreglat.

### Queda pendent, però NO s'ha de fer ara

**Les proporcions.** Estan mesurades i documentades (TESTIMONI §5.1): l'escala del
disseny és `finestra / 1920` **sense terra** (1,00 / 0,75 / 0,667 / 0,533 / 0,40), el
carril ja l'escala, i **la píndola, la fitxa i els tres aires no**. I no n'hi ha prou
d'escalar-ne un: **cal tot el tram alhora**.

## Regles de la casa (no negociables)

1. **Tot en català**: commits, comentaris i respostes.
2. **El servidor del 3003 ja corre. NO aixecar-ne cap altre i no reiniciar-lo.**
3. **Verificar amb les tres comandes:** `npx vitest run` (**474 proves**),
   `npm run compara-vistes` (ha de dir OK) i `npx vite build`.
4. **Els scripts temporals** van a `scripts/_tmp-*.mjs` i **s'esborren**. No es commitegen.
5. **Els commits expliquen la CAUSA**, no el símptoma.
6. **Una instrucció alhora.** L'amo ho ha demanat explícitament.
7. **No tocar el megaslide** sense que ho demani: està calibrat a un llenç de 1920.
8. **No tocar el `font-size` de l'arrel**: 315 fitxers fan servir `rem`.
9. **Els 15 errors d'eslint de `FullWideSlideHeader.jsx` són preexistents.** No n'has
   d'afegir cap.
10. **Pedaços, si es poden evitar, no** (regla 15 de la constitució).

## Com treballa l'amo

- **Verifica les afirmacions amb mesures.** Si dius que una cosa funciona, ha d'estar
  **mesurada a les cinc mides**: 1920×1080, 1440×900, 1280×720, 1024×768 i 768×1024.
  **La que es controla és 768×1024.**
- **Abans de tocar una pàgina, mesura'n l'estat i digue-li què has trobat.**
- **Si un número et surt absurd, atura't i no l'apliquis.**
- **No facis intents a cegues.** Si una cosa falla dues vegades, atura't i explica per
  què abans de provar una tercera.
- **No li calen captures** (ho veu en directe), però **si cal discutir una geometria,
  dibuixa-li els contenidors**.
- **Quan la mesura i l'ull no coincideixen en una cosa visual, mana l'ull.** Això va
  passar cinc vegades en una sola sessió.
- **Prefereix una decisió honesta que un pedaç.** Valora que es digui «això no ho puc
  acabar avui i aquí està el motiu».
- **Cometa tan bon punt una cosa està verificada**, no al final.

## Un avís sobre el mètode, après a cops

**Mesurar una posició i ajustar-la amb JavaScript no és estable**: cada correcció mou
allò que es mesura, i el resultat s'enfonsa o oscil·la. Va passar quatre vegades en una
sessió amb la píndola de l'inici. **Si una posició es pot declarar, es declara**; si cal
mesurar, es pren **una referència** i el càlcul se'n deriva sempre d'ella.
