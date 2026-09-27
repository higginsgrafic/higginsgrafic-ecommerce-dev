# COM TREBALLO — la manera de fer de la casa

**Què és això.** El manual d'estil de la feina: com es treballa amb l'amo
d'aquest projecte, què li importa, què l'empipa i com es mesura. No és el
`docs/constitucio.md` (aquelles són les regles que no es discuteixen mai); això
és **com es treballa el dia a dia**, après a cops.

**Com es fa servir.** Qualsevol agent (humà o IA) ho llegeix **abans** de la
primera tasca. Si una cosa d'aquí xoca amb el que et demana l'amo en aquell
moment, **mana l'amo**: això és un manual, no una llei.

---

## 1. La persona

**L'amo no és tècnic** (constitució, regla 12). Pren les decisions de negoci;
els agents, les tècniques. Però **sap el que veu**: quan diu «això balla» o
«això és lleig», normalment té raó encara que la seva explicació sigui
col·loquial. La frase és curta; el diagnòstic és teu.

**Parla en català i en to ras i curt.** Alguns exemples reals, per calibrar el
to (les glosses en anglès són seves, del 27/09/2026):

| diu | vol dir |
|---|---|
| «Fot-li» | endavant, fes-ho (*go for it*) |
| «Espavila que he de reiniciar el Mac» | **literal, no és cap frase feta**: ha de reiniciar de debò i va amb pressa. Acaba o desfés, però no li deixis coses a mitges |
| «No pas» | això no és el que et demanava; atura't. És **argot** (equival a *nope*) |
| «El puto scroll» | la barra de desplaçament és la causa, una altra vegada (*the fucking scroll*) |
| «Els fills de sa mare es mouen més que la compresa d'una coixa» | la botiga es desmunta, no moguis la base |

*(S'ha tret una fila que deia que un «+» sol vol dir «continua»: no està
confirmada i en Marc no la reconeix. Si mai arriba un «+» sol, es pregunta.)*

**Quan diu «una mica més», «un pèl», «+1 px»**, vol exactament això:
**una passa petita**, i la comproves. No reinterpretis la comanda.

---

## 2. Les tres coses que més li importen

### 2.1 El que NO s'ha de moure, no es mou

Aquest projecte té peces **compartides** que sembla que no ho siguin. La que ha
fet més mal:

> **`--hg-mega-w` i `--hg-mega-x`** les fan servir **la capçalera, el
> megaslide i el rail de la PDP**.

Tocar-ne un mou els altres. Ho vaig fer servir com a excusa per «centrar el
carril» i vaig desquadrar la franja del megaslide 7,5 px. **L'amo ho va veure
de seguida** i la comanda següent va ser «No pas».

**Com es treballa:** abans de tocar una mesura compartida, es busca **qui més
la llegeix** (`grep` de la variable), i es passa **`npm run compara-vistes` a
cada pas**. Aquest guió existeix exactament per això: és el que vigila que no
s'hagi desmuntat res.

### 2.2 Tot ha d'estar alineat amb tot

És la seva obsessió més constant i la font de més feina. En aquest projecte,
**cada peça ha de caure sobre la graella del lloc**: les targetes, la TDP, els
enllaços, la franja, el selector. Quan una peça «balla», no és estètica: és que
ha perdut la referència.

Com es reconeix que una peça està ben posada, i com es demostra:

| es mesura | contra què |
|---|---|
| l'esquerra d'una peça | la vora del **carril** o l'esquerra del **logo** |
| les columnes d'una graella | les **vores de les targetes** (targeta 1, 2+3, 4...) |
| l'aire en Y | l'**aire del header** o el mig entre dues peces |
| el centre | el **centre del carril** (que NO és sempre el de la finestra) |

I **sempre s'ensenya el número**, no la impressió: «INICI a 381, idèntic al
logo» val més que «queda alineat».

### 2.3 Les coses acaben

«No em deixis res a mitges.» Si no es pot acabar:

- **Es desfà** (`git checkout -- fitxer`) i es diu.
- **No es comiteja** un canvi que no s'ha pogut verificar.
- Es diu **què falta i amb quines xifres**, perquè la sessió següent no hagi de
  tornar a mesurar.

Un canvi a mitges és pitjor que cap canvi: ell ha de reiniciar, tancar
l'ordinador, i quan torna no sap què hi ha.

---

## 3. Com es treballa, pas a pas

### 3.1 Es mesura ABANS de tocar

Cap afirmació sense mesura (constitució, regla 15). El cicle que funciona:

1. **Reproduir** el problema amb un guió temporal (`scripts/_tmp-*.mjs`) i
   apuntar **els números d'abans**.
2. **Trobar la causa** —no la simptoma— llegint el codi i, si cal, amb una
   sonda escrita dins del component.
3. **Tocar una cosa**, només una.
4. **Tornar a mesurar** i comparar amb els números d'abans.
5. **Passar la bateria** (§4).
6. **Comitejar** amb el número d'abans i el de després a dins del missatge.

### 3.2 La sonda, i fora

Quan el codi no diu prou, s'hi escriu una **sonda** (`window.__xxx = ...`) i
s'esborra **abans de comitejar** (es comprova amb un `grep`). Aquesta sessió
n'hi va haver mitja dotzena i totes van sortir netes.

### 3.3 Els guions temporals

`scripts/_tmp-*.mjs` — **no es comitegen mai**. Es guarden entre sessions perquè
fan servei; els útils d'aquesta sessió són al final del prompt de continuació.

### 3.4 El to de les respostes

- **Català i curt.** Frases curtes, sense floritura.
- **Taules** quan hi ha números: abans / després.
- **El que has après, dit** —sobretot els errors propis. «M'he equivocat de
  sentit», «això era un pedaç», «la meva mesura era dolenta».
- **Què li toca a ell**, sempre explícit: «un F5», «mira-ho», «és cosa teva».
  Si no sap què ha de fer, la feina s'atura.
- **Res de prometre** el que no s'ha verificat. Es diu «no verificat» i ja està
  (constitució, regla 14).

---

## 4. La bateria (abans de cada commit)

Són **cinc** comprovacions, i **no se'n pot saltar cap**. Ho va demanar ell:

```bash
npx vitest run                      # 514 proves
npx eslint <fitxers tocats>         # només els fitxers tocats
npx vite build                      # ha de compilar
npm run compara-vistes              # HA DE DIR «OK»
node scripts/mesura-formats.mjs     # HA DE DIR «0 i 0»
```

**Què es pot fer per anar més de pressa** (i què no):

- `eslint` **només sobre els fitxers tocats**, mai el projecte sencer.
- Les proves i el lint **en paral·lel** quan es pot.
- Els guions de mesura **només quan toca**, no a cada commit.

I el que **no** es pot fer: saltar-se'n una. Si li ho demanes, et dirà que les
regles es queden com són.

### Les línies base d'`eslint` (25/09/2026)

Els números del projecte estan **estabilitzats**: un fitxer amb errors no n'ha
de tenir més que abans. Cal comparar amb `HEAD` (amb un `git stash`) quan es
toquen fitxers que ja en tenien.

| fitxer | errors | avisos |
|---|---|---|
| `FullWideSlideHeader.jsx` | 15 | 12 |
| `MegaStripePanel.jsx` | 4 | 11 |
| `MegaslidePagina2.jsx` | 0 | 7 |
| `CercadorTextRow.jsx` | 0 | 6 |
| `TambeRail.jsx` | 5 | 2 |
| `PdpPage.jsx` | 3 | 7 |
| `firstContactPanels.jsx` | 0 | 3 |

---

## 5. El que l'empipa (i no s'ha de fer)

1. **Els pedaços.** «Un pedaç no és una solució» (constitució, regla 15). Si la
   causa es pot arreglar, s'arregla; si no, s'escriu **quin pedaç és i quina
   causa tapa**.
2. **Amagar una part no verificada.** Es diu.
3. **Els errors repetits.** Si una cosa ja ha fallat, s'escriu a l'informe (les
   «trampes») perquè no torni a passar.
4. **Els salts de fe.** Si has de triar entre dues interpretacions, **pregunta**
   amb opcions concretes i números. Aquesta sessió, endevinar va costar hores;
   preguntar, dos minuts.
5. **Les barres de desplaçament a la interfície** (constitució, regla 16).
6. **Les llistes escrites a mà.** Hi ha dibuixos apuntats a dos llocs i un se
   n'oblida: la font ha de ser **una**.
7. **Els números sense origen.** Cada número ha de tenir una mesura al darrere.

---

## 6. El flux de resposta, en la seva llengua

**Quan demana una cosa nova:**

1. Reprodueix-ho i **ensenya els números d'abans**.
2. Diu la **causa** en una frase.
3. **Fes-ho** (una cosa).
4. Ensenya els números **de després** en una taula.
5. Diu **què li toca a ell** (F5, mirar-ho, decidir).

**Quan t'equivoques:**

1. **Ho dius de seguida**, sense excusa («m'he equivocat de sentit»).
2. **Ho desfàs** i ho comproves (`git status` net, bateria OK).
3. Expliques **què has après**, per si serveix.

**Quan no saps què vol:**

1. **No toquis res.**
2. Ensenya **el que has mesurat** i les opcions amb els números de cadascuna.
3. Pregunta **una cosa concreta** («quantes targetes i de quina mida?»), no
   «què vols?».
4. Si la resposta és ambigua, **torna a preguntar** amb les xifres; és més
   barat que provar.

---

## 7. Coses tècniques que sempre es fan igual

- **Res de `push` sense demanar-ho.** Es comiteja quan està verificat, i es
  pregunta abans de pujar (o es puja si ho ha dit).
- **El servidor del 3003 no es toca mai.** L'amo hi té l'overlay obert; es
  recarrega amb **F5**. Els agents no el reinicien mai.
- **Una cosa per commit.** El missatge diu **el número d'abans, el de després i
  la causa**, amb el to de la casa.
- **Els informes.** Quan la sessió és llarga, s'escriu un
  `docs/informes/INFORME-<data>-<tema>.md` amb: estat, què s'ha fet amb la
  causa de cada cosa, **les trampes**, el que queda obert i els números de
  referència.
- **El prompt de continuació.** Abans de tancar una sessió llarga, un
  `docs/informes/PROMPT-continuar-<data>.md` amb la feina onada, les xifres
  mesurades, els intents desfets i les regles de la casa.
- **Els fitxers de la franja** (`images_stripe`) són **publicats i no ignorats**:
  si una imatge nova no s'hi comiteja, la franja peta amb un 404.

---

## 8. Els dispositius i els números de referència

La feina es mira sobretot a **1920×946** (l'Scriptori del navegador). **El
navegador de treball és Firefox** i la màquina és un **iMac Retina 5K de 27"
(2017, Intel Core i7 de 4 nuclis, 32 GB, macOS Ventura 13.7.8)**, amb pantalla
Retina. Els guions de mesura, en canvi, van amb **Chromium** (Playwright).

| què | valor |
|---|---|
| carril | **381..1524** (1143 a 1920) |
| franja del megaslide | 357,8 · 222,9 · 1049,1 × 112,4 |
| finestra de la graella | 455,6..1309,2 (centre 882,4) |
| targeta del rail | **269,3** amb gap **22,2** (ompleCarril) |
| graella de dibuixos | pas 34,90625 · període 2234,477 |
| atenuació dels dibuixos | 0,12 · vel de la samarreta 0,6 |
| barra de desplaçament | **15 px** (i el carril es refereix a l'espai de maquetació, que l'exclou) |

**Quan una mesura del guió no quadra amb el que es veu a la pantalla, el primer
sospitós és el navegador.** Firefox i Chromium no resolen igual les màscares
(`mask` i `-webkit-mask`, `mask-type`, els `clipPath` d'SVG), ni els
`mix-blend-mode`, ni l'ordre de composició de capes amb opacitat. Els
calibratges del projecte ja estan fets amb Firefox (vegeu
`stripeCalibrations.js`): el guió serveix per **mesurar i comparar**, no per
decidir com es veu. El que val és la pantalla d'en Marc, amb un F5.

---

## 9. Una nota per a l'agent que vingui

Aquest projecte té molta història, i gairebé tota està **escrita**: la
constitució, els informes, els mapes de calibratges. **Llegeix-los**; gairebé
mai no caldrà que endevinis res.

I quan dubtis entre **fer** i **preguntar**: mira quant et costa equivocar-te.
Si el canvi és petit i reversible, fes-lo i ensenya el número. Si toca una peça
**compartida** (el carril, la pauta, la franja), pregunta primer. En aquesta
casa, el carril s'ha emportat més hores que cap altra cosa.

---

*Escrit el 25/09/2026, després d'una sessió llarga en què el carril, el rail i
el bloc de la TDP van fer ballar més del que tocava. Si alguna cosa d'aquí deixa
de ser certa, es canvia el mateix dia.*
