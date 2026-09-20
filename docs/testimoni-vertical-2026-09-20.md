# Testimoni — la vista vertical del megaslide (sessió del 20/9)

Data: 20 de setembre de 2026, matinada. Aquest document és el **relleu** per a la
propera sessió: què s'ha fet, què s'ha revertit, **on s'ha quedat exactament** la
feina i quines regles ha posat l'amo. Es pot esborrar quan el tema estigui tancat.

> **Llegeix primer `docs/estat-megaslide.md`** (és el testimoni gran, amb tota la
> història del megaslide). Aquest full només cobreix la feina de la vertical.

---

## 0. Estat immediat: hi ha feina a mitges

**L'últim que s'ha fet NO està començat i acabat.** Just abans de tancar la
sessió s'estava muntant **la taula de la pàgina 1 al megaslide, amb la graella
de 5×3 dins de la cel·la del carrusel**.

- Fitxers tocats i **sense cometre**: `src/components/fullwide/MegaStripePanelP1.jsx`
  i `src/components/megaslide/TaulaVertical.jsx`.
- L'últim commit bo és **`b01f95d`** (la graella de 5×3 centrada, sense gutters
  i enganxada al bottom del segon header), i en aquell moment la taula **no**
  era dins del megaslide: només era a `/lab/vertical-taula`.
- L'amo va dir **«No veig la taula»** i s'hi va començar a respondre muntant-la
  dins de la pàgina 1, però **no s'ha verificat ni comès**.

**Primer que cal fer, doncs**: mirar el diff pendent, decidir si es tira
endavant o es reverteix, i comprovar-ho a 768 abans de dir que està fet.

---

## 1. Com treballa l'amo (i trampes que ja han mossegat)

- Tot en **català**: codi, comentaris, commits i conversa.
- **No fer push** sense que ho demani.
- **Abans de dir que una cosa està feta**: `npx vitest run` i `npx vite build`.
- **No aturar mai el servidor del 3003 sense avisar.** És el Vite de
  desenvolupament que veu l'amo (netlify dev al 8888 → Vite al 3003). Serveix
  `src/` amb HMR. Per provar coses, **engegar un `vite preview` en un altre port
  (s'ha fet servir el 3007) i aturar-lo en acabar**.
- **Mai** `lsof -ti :3003 | xargs kill`: mata també el navegador de l'amo.
  Si mai cal, només el que escolta:
  `lsof -nP -iTCP:3003 -sTCP:LISTEN -t | xargs -r kill`.
- **La regla més important d'aquesta sessió**: l'amo ha demanat diverses vegades
  **«no suposis, no infereixis; segueix les meves instruccions i prou»**. Quan ho
  digui, cal fer **exactament** el que diu, sense afegir-hi res pel seu compte, i
  preguntar només si la instrucció és impossible d'executar.
- L'amo va donant **instruccions d'una en una** (moure 100 px, centrar, treure
  gutters…). Convé fer **exactament** aquell canvi, verificar-lo amb una mesura i
  no aprofitar per «arreglar» altres coses.

---

## 2. El que l'amo ha decidit (respostes tancades)

- La composició vertical **substitueix el contingut de la pàgina 2** (el
  cercador). La **pàgina 1** tindrà la seva pròpia composició.
- **Dues composicions**, una per pàgina, amb una **taula de 3 files** dins del
  carril. Estructures que va dibuixar i etiquetar:

  | | **Pàgina 1** | **Pàgina 2** |
  |---|---|---|
  | **fila 1** | CARRUSEL | GRAELLA 16×4 |
  | **fila 2** | STRIPE · FLETXES | COL·LECCIONS · GRAELLA COLORS · STRIPE |
  | **fila 3** | STRIPE · SELECTOR | COL·LECCIONS · SELECTOR · STRIPE |

- **La stripe és UNA de sola per pàgina** (no dues): ocupa les **dues files**.
- **Pàgina 1**: la franja és **multicolor**. **Pàgina 2**: la franja és **d'un
  sol color**, i el color **el mana la graella de colors**.
- La **graella de colors només és a la pàgina 2**; a la 1 no n'hi ha.
- La **graella de dibuixos** ha de ser el **bloc de 16×4**.
- **Les graelles són les peces que ja tenim i no s'han de modificar.**
  (`MegaGridDibuixos` i la graella de colors del cercador.)
- Les **col·leccions són 9** (no 10).
- Per a **les dues stripes**, de moment, la base és la imatge que va passar:
  `public/placeholders/tablet vertical/stripe-curta-7+7.png` (1379×593, les 14
  samarretes en 7+7).
- La graella **5×3** que s'està muntant té les caselles de la **mida de la tile
  de les fletxes** (44 px), **centrada** i **sense gutters**.

---

## 3. Què s'ha fet, en ordre (i què s'ha revertit)

| commit | què |
|---|---|
| `69dc21c` | Primera versió de la composició vertical (a la pàgina 1, després moguda a la 2) |
| … | Diverses iteracions amb la graella i la franja |
| `288279b` | **Revertir tota la feina de la vertical** (l'amo va dir «tornar a començar de nou») |
| `45b1667` | **La taula de les dues pàgines, dibuixada** (`TaulaVertical.jsx` + `/lab/vertical-taula`) |
| `a01d02e` | La graella de dibuixos torna a ser el **bloc de 16×4** |
| `ef30194` | **Una sola franja per pàgina** (abans n'hi havia dues) |
| `0ce2574` | **Amagar el contingut de les pàgines 1 i 2** |
| `edef71d` … `2ecfde0` | Ajustos de la PDP (100 px amunt/avall i aire sobre la TDP) |
| `a8a4260` | Graella 5×3 a la PDP (mida de casella 44 px) |
| `8467044` | La graella 5×3, **moguda al megaslide** (pàgina 1), treta de la PDP |
| `d06acc7` | Graella 5×3 **centrada i sense gutters** |
| `b01f95d` | Graella 5×3 **pujada fins al bottom del segon header** |

**Revertits o deixats de banda** (no tornar-hi sense que ho demani):

- La segona via de `MegaGridDibuixos` per resoldre items sense producte al
  catàleg: **l'amo la va fer treure** («reverteix la graella»). El component ha
  de quedar **sense tocar**.
- El `bloc16x4` i el `cellPx`: es van afegir i treure diverses vegades. L'últim
  estat comès els té **posats** (commit `a01d02e`), però l'amo ha dit que la
  graella no es modifica: **confirmar-ho amb ell abans de tocar-ho**.
- Els contorns (`?contornsVertical=1`) i la retícula de quatre cel·les de la
  pàgina 1: eines de diagnòstic. Els contorns són a
  `src/components/megaslide/ContornsVertical.jsx`.

---

## 4. On és cada peça

| peça | fitxer |
|---|---|
| Taula de les dues pàgines | `src/components/megaslide/TaulaVertical.jsx` |
| Pàgina de proves de les taules | `src/pages/TaulaVerticalPage.jsx` → **`/lab/vertical-taula`** |
| Peces de la vertical (franja 2×7, colors, col·leccions, selector, fletxes, graella) | `src/components/megaslide/VerticalPieces.jsx` |
| Graella 5×3 (caselles de 44 px) | `src/components/megaslide/GraellaFletxes.jsx` |
| Contorns de diagnòstic | `src/components/megaslide/ContornsVertical.jsx` |
| Franja de la pàgina 1 | `src/components/fullwide/MegaStripePanelP1.jsx` |
| Franja de la pàgina 2 | `src/components/fullwide/MegaStripePanel.jsx` |
| Pàgina 2 del megaslide | `src/components/megaslide/MegaslidePagina2.jsx` |
| El panell i els viewports de les pàgines | `src/components/fullwide/MegaMenuPanel.jsx` |

**Números a 768** (mesurats al navegador):

- carril: **688 px** (768 − 2×40)
- graella de dibuixos 16×4: 688 × 168 (casella 37,4 px)
- franja 2×7: 442 × 182 (casella 57,6 × 86,4)
- col·leccions: 131 px d'ample; graella de colors: 103 × 93 (cercle 18,9 px)
- fletxes i selector: 127 × 135
- graella 5×3: 220 × 132 (casella 44 × 44, sense gutters)
- segon header: **acaba a y = 127**

---

## 5. Eines

```bash
npx vitest run                     # 462 proves
npx vite build                     # compila
node scripts/compara-vistes.mjs    # comparador (falla si les vistes de tauleta se separen)
npm run mesura:megaslide           # 833 xifres de regressió a 7 mides
```

Per provar sense tocar el servidor de l'amo: engegar `npx vite preview` en un
altre port i aturar-lo en acabar. S'ha fet servir el **3007**.

**Comprovacions fetes aquesta sessió**: `npx vitest run` → **462 proves OK** i
`npx vite build` → OK a cada pas.

---

## 6. El següent pas, concret

1. **Mirar el diff pendent** de `MegaStripePanelP1.jsx` i `TaulaVertical.jsx`
   (la taula dins del megaslide amb la graella 5×3 a la cel·la del carrusel).
2. **Verificar-ho a 768**: que la taula hi sigui, que la graella quedi dins de la
   cel·la del carrusel, i que res del 1024/1280/1440/1920 no s'hagi mogut.
3. **Ensenyar-ho a l'amo** (captura o el 3003) i esperar la seva instrucció
   següent. **No avançar-se.**
