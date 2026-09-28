# Informe: excés d'egress de Supabase (14,34 GB sobre un límit de 5,5 GB)

**Data:** 28/09/2026
**Projecte:** `jnuuejlxuyqhhkfucuxg` (organització `higginsgrafic`, ID `hjykjkntiubkdhcickbu`)
**Pla:** Free
**Període de facturació:** 14/09/2026 → 14/10/2026
**Avís de Supabase:** restricció del projecte el **30/09/2026** (402 a totes les peticions) si es continua per sobre de la quota

---

## 1. Resum

Supabase va avisar que havíem excedit el límit d'**egress** (ample de banda sortint): 5,5 GB al pla Free. La xifra del panell era de **14,34 GB**, un 260 % del límit. El projecte no està obert al públic, cosa que va ser la pista decisiva: **el tràfic el generava el propi desenvolupament**, no cap client.

La causa principal era una sola consulta: el catàleg de productes amb tots els seus variants (**3,02 MB**) es demanava a Supabase **a cada càrrega de pàgina**. Amb ~125 càrregues diàries de desenvolupament, això són ~380 MB al dia, mesos seguits.

S'han aplicat tres correccions (dues de fons i una de neteja) i el **ritme diari ha passat d'uns 2 GB a uns 500 MB, amb l'objectiu de desenes de MB**, segons la pròpia gràfica d'egress de Supabase.

---

## 2. Símptoma i magnitud

Del panell de Supabase (Usage → Egress):

| mètrica | valor | límit Free |
|---|---|---|
| **Egress (no cachejat)** | **14,34 GB (260 %)** | 5,5 GB |
| Egress cachejat | 0,72 GB | 5,5 GB |
| Database size | 0,07 GB | 1 GB |
| Storage | 0,07 GB | 1 GB |
| Edge function invocations | 1.006 | 500.000 |
| Monthly Active Users | 2 | 50.000 |

**Excessos del període: 9,34 GB.**

Un apunt sobre l'Storage: el panell el marca a 0,07 GB, però el bucket tenia **545,5 MB** abans de la neteja d'aquest mateix dia. O sigui que la xifra del panell és posterior a la migració, i la resta de la quota és marge sobrer del pla.

Egress diari dels últims dies, amb el desglossament que dona el ratolí del panell:

| dia | PostgREST | Storage | total |
|---|---|---|---|
| 26/09 | 2,088 GB (98,0 %) | 43,6 MB (2,0 %) | 2,132 GB |
| 27/09 | 1,188 GB (98,0 %) | 24,8 MB (2,0 %) | 1,213 GB |
| 28/09 | 499,7 MB (47,9 %) | 543,0 MB (52,1 %) | 1,043 GB |

Els dos primers dies són el règim antic. El canvi del 28/09 és la correcció entrant **més** la feina de migració (vegeu §5).

---

## 3. Diagnòstic

### 3.1 La causa principal: el catàleg sencer a cada càrrega de pàgina

`src/api/supabase-products.js`, `getAllProducts()`:

```js
.select(`
  *,
  product_images (id, url, position),
  product_variants (id, gelato_variant_id, sku, size, color, color_hex,
                     price, gelato_cost, stock, is_available, image_url, design)
`)
```

Mesurat amb Chromium (`performance.getEntriesByType('resource')`, 1920×946):

| consulta | pes |
|---|---|
| `products?select=*` | 239 KB |
| **`products?select=*,product_images(...),product_variants(*)`** | **3.759 KB (3,02 MB)** |

Dins d'aquella resposta, el **95 % són els 4.116 `product_variants`**, i el camp que més pesa és `image_url` (433 B per fila; 0,41 MB per cada 1.000 files).

Es demanava des de `ProductContext.loadProducts()`, que s'executa a cada muntatge de l'aplicació, o sigui a **cada càrrega de pàgina**.

**Compte del total:** 11,78 GB (primera mesura) ÷ 3,02 MB = **unes 3.900 càrregues de pàgina** en 31 dies, unes 125 al dia. És exactament el que fa un dia de desenvolupament amb Vite recarregant la pàgina a cada desament.

### 3.2 La causa secundària: el Storage sense cache

El bucket `media` tenia **307 fitxers, 545,5 MB**, tots **PNG de 3000×3000 d'1,4–2,7 MB**, i Supabase els servia amb **`Cache-Control: no-cache`**.

Es va comprovar amb tres vies i amb les dues claus (pública i de servei): capçalera `Cache-Control`, camp `cacheControl` del multipart i metadades de l'objecte. **La resposta sempre era `no-cache`**, o sigui que ni el navegador ni cap CDN guardaven res.

En canvi, els nostres fitxers propis (`public/`) sí que surten amb cache, perquè `public/_headers` i `netlify.toml` posen `public, max-age=31536000, immutable` a `/custom_logos/*`, `/placeholders/*`, `/assets/*` i `/video/*`.

### 3.3 El que NO era

- **No hi havia cap bot ni cap servei extern.** Els logs de Storage (§6) no mostren cap petició de tercers.
- **No era la base de dades** (0,07 GB) **ni l'Storage en repòs** (0,07 GB).
- **No eren les Edge Functions** (1.006 invocacions de 500.000).

---

## 4. Les correccions

### 4.1 Cache del catàleg — `daa9709`, ampliada a `16bbcfc`

Una cache de la resposta crua (memòria + `localStorage`) dins del mateix fitxer de l'API, seguint el patró que ja hi havia per a `pricing_config`.

- **La forma de les dades no canvia**: es desa exactament el que retornava la consulta, així que cap consumidor se n'adona.
- **Caducitat: 1 hora** (`VITE_PRODUCT_CACHE_MINUTES`, per defecte `60`). Es va començar amb 5 minuts i es va allargar quan es va confirmar que la botiga no està oberta al públic.
- `getAllProductsIncludingInactive` (la d'administració) **queda sense cache a posta**, perquè qui administra ha de veure els canvis de seguida.

**Mesurat** (mateix experiment, 5 pàgines: portada, botiga, cistell, checkout):

| | abans | després |
|---|---|---|
| Peticions a Supabase | 45 | 41 |
| Bytes | **15,08 MB** | **3,02 MB** |
| Consultes del catàleg | 5 (una per pàgina) | **1** |

### 4.2 Els mockups, del Storage al CDN propi — `75d01a8`

Els 307 fitxers del bucket s'han convertit a **WebP (qualitat 82)** i s'han mogut a `public/custom_logos/mockups/`:

| | abans | després |
|---|---|---|
| Fitxers al Storage | 307 | **0** |
| Mida del bucket | 545,5 MB | **0 MB** |
| Mockups a `public/` | 0 | **307 fitxers, 36 MB** |
| Cache | `no-cache` | `immutable`, 1 any |
| Origen | Supabase Storage | CDN de Netlify |

Conversió mesurada: 3.000×3.000 a 120 KB de mitjana, **93–94 % menys** de pes, amb verificació que les dimensions es conserven. Eina al repo: `scripts/mockups-a-local.mjs`.

### 4.3 Neteja del Storage i coherència de dades

- Les **55 files** de `product_mockups` amb `collection = 'outcasted'` s'han renombrat a `miscellania`: era la col·lecció viva amb el nom vell (`outcasted` → miscellània), i a la base de dades no hi havia cap fila amb el nom nou.
- S'han esborrat del Storage **167 fitxers (293,9 MB)** que no demanava cap fila i que tenien còpia local verificada, i després els **140 restants** que també en tenien.
- **Cap esborrat s'ha fet sense còpia local prèvia**: l'script saltava qualsevol fitxer sense correspondència a `public/`.

### 4.4 Cache de les pujades — `d9b4cdc`

Els quatre llocs on es puja al Storage (`src/api/storage.js` ×3 i `supabase/functions/upload-media`) passen de `cacheControl: '3600'` a `'31536000'`.

**Nota honesta:** mesurat, Supabase serveix els objectes amb `no-cache` igualment. Aquest canvi deixa la intenció escrita i només estalvia si el Storage ho respecta algun dia. El que de debò estalvia és no pujar PNG grossos, i això encara està pendent (§8).

---

## 5. Verificació

### 5.1 Al lloc desplegat (`https://dev.higginsgrafic.com`)

- **Assets**: els mockups responen `HTTP 200`, `content-type: image/webp`, `cache-control: public,max-age=31536000,immutable`, i `cache-status: "Netlify Edge"; fwd=miss; stored` (o sigui que el CDN els guarda).
- **Catàleg**: en 3 pàgines, **una sola consulta** `rest/v1/products` de 3,02 MB; la resta surten de cache.
- **Bundle**: el del lloc (`index-prod-DqTiNGTi.js`) coincideix amb el local, i conté la cache (`hg_products_cache_key` i el valor `60`).

### 5.2 Integritat de dades

- `product_mockups`: **152 files**, **0 rutes que faltin** a `public/`.
- `public/custom_logos/mockups`: **307 fitxers, 36 MB** (307 a git, 307 al disc, arbre net).
- Etiquetes de col·lecció: `{"first-contact":85,"miscellania":55,"proves":12}`, coherents amb els slugs de la botiga (`src/config/collectionVertical.js` fa servir `first-contact` amb guió).

### 5.3 Els logs de Storage del 28/09

Mil peticions en 41 minuts (10:47 → 11:28), repartides així:

| client | peticions | què |
|---|---|---|
| `node` (scripts de la migració) | **655** | 355 `POST /object/list/media` + **300 `DELETE /object/media/...`** |
| `[Lifecycle]: ObjectRemoved:Delete` | 306 | esdeveniments de sistema de les mateixes esborrades |
| HeadlessChrome (Playwright) | 26 | les mesures |
| **Firefox (navegador de l'amo)** | **12** | tràfic humà |
| Supabase mgmt-api | 1 | el panell |

**Conclusió:** el pic de Storage del dia 28 **el va generar la pròpia migració** (descarregar per convertir i esborrar). No hi ha cap fuita oculta ni cap consumidor extern del projecte.

### 5.4 Bateria del projecte

En verd després de cada canvi: **595 proves / 46 fitxers**, eslint amb els comptes de HEAD, `vite build`, `npm run compara-vistes` OK, `scripts/mesura-formats.mjs` 0 i 0, `_tmp-errors2` cap error i `_tmp-ancoratge` TOT AL SEU LLOC.

---

## 6. Estat i límits d'aquest informe

**El que està resolt i verificat:** la font principal d'egress (catàleg a cada pàgina) i la font de Storage (bucket buit). El ritme diari ha baixat i la gràfica de Supabase ho ensenya.

**El que no es pot desfer:** els **14,34 GB ja consumits** del període. Cap canvi de codi els torna enrere.

**El que no he pogut confirmar:** el total del període és el que decideix si s'aplica la restricció del 30/09, i això depèn de Supabase. Tampoc no he pogut veure el lloc amb els ulls: el navegador headless el bloqueja la protecció antirobots (el `curl` hi entra i respon 200 amb el HTML propi).

---

## 7. Què queda per fer

1. **Respondre a Supabase** amb aquest informe i la gràfica d'egress (text del correu a `INFORME-2026-09-28-supabase-correu.md`).
2. **Decidir sobre el pla Pro** com a xarxa, tenint en compte que la restricció afectaria també les eines d'administració (factures, comandes).
3. **Vigilar la barra diària** uns dies: si es queda en desenes de MB, el problema està tancat; si tornés a pujar, hi hauria una altra font i caldria tornar a mesurar.

## 8. Feina pendent (no urgent)

- **`upload-media` encara puja PNG** sense convertir. És l'única porta per on pot tornar a entrar material gros. Va amb desplegar la funció de Supabase (`supabase functions deploy upload-media`), que necessita el token del CLI.
- **El desplegament és manual.** El lloc de Netlify no està lligat a cap repositori: l'últim desplegament abans d'avui era del 16/09. Cada canvi s'ha de publicar amb `npx netlify deploy --prod`.
- **`public/` ha crescut** amb els mockups (36 MB); el `dist` fa 116 MB. No és cap problema per a Netlify, però és marge per aprimar si algun dia convé.

---

## 9. Cronologia del dia

| hora | fet |
|---|---|
| matí | Es descobreix el límit d'egress i es descarta la base de dades i l'Storage en repòs |
| matí | Es localitza la consulta de 3,02 MB a cada càrrega de pàgina |
| 11:xx | Migració dels mockups a WebP i a `public/` (`75d01a8`) |
| 11:xx | Cache del catàleg (`daa9709`), desplegada |
| 12:xx | Renombratge `outcasted` → `miscellania`; buidatge del bucket (545,5 MB → 0) |
| 13:xx | Cache de les pujades a un any (`d9b4cdc`) |
| 13:xx | Cache del catàleg a una hora (`16bbcfc`), desplegada |
| 13:24 | Logs de Storage: es confirma que el pic del dia 28 és la pròpia migració |

---

## 10. Referències

**Commits:**

| commit | què |
|---|---|
| `75d01a8` | Els mockups, de Supabase Storage a local (545 MB → 36 MB, i sense egress) |
| `daa9709` | Cache del catàleg: 3,02 MB per pàgina → un cop cada 5 minuts |
| `d9b4cdc` | La cache de les pujades, d'una hora a un any |
| `16bbcfc` | La cache del catàleg, de 5 minuts a una hora |

**Fitxers clau:**

- `src/api/supabase-products.js` — la cache del catàleg (`CACHE_PRODUCTES_*`)
- `src/api/storage.js` i `supabase/functions/upload-media/index.ts` — la cache de les pujades
- `public/_headers` i `netlify.toml` — les regles de cache del CDN
- `scripts/mockups-a-local.mjs` — l'eina de migració del Storage
- `public/custom_logos/mockups/` — els 307 mockups en WebP

**Informe relacionat:** el text del correu a Supabase, a `INFORME-2026-09-28-supabase-correu.md`.
