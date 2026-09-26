# PROMPT PER CONTINUAR — sessió del 26/09/2026 (vespre)

Ets un agent que continua la feina d'un altre al projecte `higginsgrafic-ecommerce-dev`
(React 19 + Vite). El servidor de desenvolupament de l'amo ja corre al **port 3003**: no
l'aturis ni n'aixequis cap altre (els guions de Playwright ja el fan servir).

Llegeix primer, per aquest ordre:

1. `docs/informes/COM-TREBALLO.md` — com es treballa amb aquest amo.
2. `docs/informes/PLA-neteja-calibratge-megaslide.md` — tot el context tècnic de la
   feina de les últimes sessions. Les seccions **6, 7, 10.1, 10.2, 10.3 i 10.3.1** són
   les que et fan falta.
3. `git log --oneline -12` — l'estat real del repositori.

---

## 1. Estat: què està fet i què no

**La pàgina 2 es va donar per bona** («Punt de recuperació: Pàgina dos estable»). El punt
estable és **`26442f5`**: si alguna cosa es desquadra, es torna aquí. Els commits que hi
porten són `3298b36` (el vel no taca mai una samarreta activa), `7c189ca` (el vel cau a
sobre de les samarretes), `e6c9806` (la franja arrenca centrada), `2c586cb` (la porta
d'obertura espera les imatges) i `26442f5` (el megaslide invisible fins que la composició
és quadrada).

**Fet després:** `7e0a696` (la franja i la tira de colors es mouen amb el dit, amb el
ganxo nou `src/hooks/useArrossegamentPas.js`), `97e2bd7` (el selector de la pàgina 1
torna a ser quadrat) i `bf9d46c` (màscara del vel «la samarreta que es veu», vegeu el
punt 2).

**Bateria en aquest punt:** `npx vitest run` = **570 proves, 45 fitxers, totes passen**;
eslint amb els comptes de sempre; `npx vite build` OK; `npm run compara-vistes` OK;
`node scripts/mesura-formats.mjs` = 0 i 0; `node scripts/_tmp-errors2.mjs` = cap error.

---

## 2. Tasca oberta número 1: els rombes a les mànigues (pàgina 2)

**Què diu l'amo:** «Les samarretes amb vel de la pàgina 2 tenen un rombe a les mànigues
que sembla una mena d'intersecció.» Ho ha tornat a veure després del commit `bf9d46c`,
o sigui que **la meva hipòtesi (la màscara del vel) no ho explica tot o no és la causa**.

**Què se sap segur:**

- les samarretes de la franja es trepitgen per les mànigues, i en una intersecció es veu
  la que està pintada més a la dreta;
- la màscara del vel (`generaVelDataUrl` i el `<mask>` de l'SVG vertical, a
  `src/components/fullwide/MegaStripePanel.jsx`) ara pinta casa per casa, en ordre, la
  silueta blanca si la casa demana vel i negra si és activa;
- el vel viu a `z-index: 6` i la capa de dibuixos a `z-index: 12`.

**La pregunta que cal fer a l'amo abans de tocar res** (val mitja feina):

> Els rombes surten TAMBÉ a les samarretes ACTIVES (les de la col·lecció activa, que no
> porten vel), o només a les velades?

- **Si surten a totes**: no és el vel. Mira, per aquest ordre, `ClicAreaOverlay` (les
  àrees de clic, `src/components/fullwide/ClicAreaOverlay.jsx`), les guies de calibratge
  de la franja (`id="stripe-guide-*"`), i la màscara del tint de la samarreta de color
  (`maskType="alpha"` amb la imatge de la franja, només a la vista vertical).
- **Si surten només a les velades**: és el vel i cal mirar la forma de les siluetes. En
  aquest cas, el camí més directe és **tornar a la silueta estreta** (l'àrea d'impressió,
  241,7 unitats) per a les cases del mig en comptes de la samarreta sencera (305,6): el
  vel no arribaria a les interseccions i no hi hauria rombe, a canvi de deixar les
  mànigues sense vel (que és el que hi havia abans de `7c189ca`).

**Eines:** `node scripts/_tmp-vel-png.mjs miscellania` desa la imatge del vel generada a
`_tmp-vel-img-miscellania.png` (fons transparent) i `node scripts/_tmp-vel-mapa.mjs
miscellania 1920x946` desa un mapa ampliat de la diferència «vel posat / vel tret» a
`_tmp-m-diff-miscellania.png`, que és on es veu de seguida si hi ha un forat amb forma de
rombe i on cau. Tots dos són temporals i **no es comitegen**.

---

## 3. Tasca oberta número 2: la composició de la pàgina 1

L'amo la vol com la de la pàgina 2. Dels cinc canvis:

- **fet**: el selector torna a ser quadrat (`97e2bd7`; pastilla 108x108 a 1920x946).
- **pendent (1)**: treure el selector de la malla de nou columnes
  (`CONTROL_TILE_BN` a `MegaColumn.jsx`) i posar-lo **al costat de la franja inferior**.
- **pendent (2, 3 i 4)**: la graella enganxada a la **vora esquerra del carril** (x381 a
  1920x946; ara arrenca a x415) i estesa fins al bloc de fletxes amb el seu gap, i el
  selector i les fletxes **alineats a la vora DRETA del carril** (x1524). Compte: a la
  pàgina 2 el selector va a l'esquerra, però a la pàgina 1 l'amo el vol a la **dreta**
  (està escrit a la secció 10.2 del pla).
- **pendent (5)**: convertir la graella en **dues fileres intercalades** com
  `CercadorDibuixosGraella` (pàgina 2), ocupant tota l'alçada del bloc de fletxes.

**Xifres d'abans** (1920x946, carril 1143 px, x381..1524), amb
`node scripts/_tmp-p1-composicio.mjs`:

    selector  pastilla 108x108 a x416   (dins la primera columna de la malla)
    graella   x415 y65 1074x123         (nou columnes)
    fletxes   bloc 109x109 a x1435..1544
    franja    x358 y233 1049x112

La **recepta pas a pas, amb els fitxers exactes, és a la secció 10.3.1 del pla**.

---

## 4. El mètode (no negociable)

1. Cada número nou **es declara** a `src/components/megaslide/geometriaMegaslide.js` com
   una funció pura, documentada en català, amb la seva prova a
   `tests/unit/geometria-megaslide.test.js` i amb la **mesura abans/després** al comentari.
2. Els components la consumeixen; la mesura del DOM queda només com a confirmació.
3. Bateria abans de cada commit: `npx vitest run`, `npx eslint` als fitxers tocats (els
   comptes no poden pujar), `npx vite build`, `npm run compara-vistes` (ha de dir OK),
   `node scripts/mesura-formats.mjs` (0 i 0), `node scripts/_tmp-errors2.mjs` (cap error).
4. **Una cosa per commit**, missatge en català explicant la causa i amb les xifres, i
   `git push` (hi ha permís permanent per pujar).
5. Els `scripts/_tmp-*.mjs` són temporals: mai no es comitegen.
6. La pàgina 2 és el punt estable: si un canvi seu es desquadra, es torna a `26442f5`.
7. Si una cosa no es pot deixar quadrada i verificada, **no es comiteja**: es desfà i
   s'explica què s'ha trobat.
