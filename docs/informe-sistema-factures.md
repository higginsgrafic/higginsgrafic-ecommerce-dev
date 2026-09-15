# Informe per continuar el sistema de factures — Higgins GRÀFIC

**Per a:** una IA que ha de mantenir i ampliar la interfície de gestió de factures
**Data:** setembre de 2026
**Projecte:** botiga en línia `higginsgrafic-ecommerce-dev`

---

## 1. Què se't demana

Mantenir la **interfície de gestió de factures** de la botiga. El sistema permet revisar factures emeses, preparar esborranys, emetre factures manuals, crear rectificatives, exportar i reenviar.

Aquest document descriu **què hi ha**, **per què està fet així** i **què queda pendent**, perquè no hagis de reconstruir res ni contradir decisions ja preses.

---

## 2. El negoci, en dues línies

Botiga de samarretes impreses sota demanda. El client compra a la web, es cobra amb Stripe i la comanda s'envia a **Gelato** (el proveïdor d'impressió i enviament). L'amo és **autònom** (persona física), de manera que el seu NIF és el seu DNI.

Xifres del catàleg, verificades: **63 productes**, **3.976 variants**, repartits en 5 col·leccions (Austen 27, First Contact 7, The Human Inside 14, Cube 10, Miscel·lània 5).

**Economia d'una peça:** es ven a **15,50 € IVA inclòs** (12,81 € nets). El cost del proveïdor depèn del color i de la talla (samarreta Gildan 64000, impressió DTF a la part davantera i al coll interior, descompte del pla Gelato+ ja aplicat): entre **7,57 €** i **8,76 €** a les talles S–XL, i entre **9,10 €** i **10,53 €** a la 2XL. La taula concreta, per grups de color, és a `scripts/sync-gelato-products.js`. L'enviament va **a preu de cost**: el client paga 4,29 € i el proveïdor en cobra 4,29 €.

---

## 3. Pila tècnica

| Capa | Tecnologia |
|---|---|
| Frontend | React 18 + Vite 7 + React Router 6 + Tailwind 3 |
| Components | Radix UI, Framer Motion, Lucide |
| Backend | Netlify Functions (Node, esbuild) |
| Base de dades | Supabase (Postgres + PostgREST + RLS) |
| Pagaments | Stripe |
| Proveïdor | Gelato (API v3) |
| Correu | Resend, amb plantilles React |

**Idioma del projecte:** els comentaris, els missatges de commit i les interfícies d'usuari són **en català**. Mantén-ho.

---

## 4. El sistema de factures: com funciona

### 4.1 El cicle complet

```
El client paga
      │
      ▼
Stripe envia l'avís ──► stripe-webhook
                            │
                            ├─ actualitza la comanda a "confirmada"
                            ├─ createInvoice()  ──► agafa el número correlatiu
                            │                        i desa la factura
                            ├─ envia el correu amb l'enllaç a la factura
                            └─ envia la comanda a Gelato
```

### 4.2 La numeració

Viu **a la base de dades**, no a la web. Raó: dues compradors simultanis no poden rebre el mateix número, i un comptador a la web sí que podria repetir-lo.

```sql
-- Taula comptadora, una fila per sèrie i any
public.invoice_series_counters (series text, year int, last_number int)

-- Funció que dona el número següent de FO, FS o FR
public.next_invoice_number(series) RETURNS text
-- FO-2026-000001 · FS-2026-000001 · FR-2026-000001
```

Detalls importants:

- El número **només s'agafa quan la factura s'emet de debò**. Com que la comanda es crea *abans* de pagar, si es numerés en aquell moment, cada intent abandonat deixaria un forat a la sèrie — i la sèrie fiscal no pot tenir forats.
- Es pot cridar des del servidor (`supabase.rpc('next_invoice_number')`). Els visitants anònims **no** hi tenen permís.
- Verificat: quatre crides simultànies retornen quatre números diferents.

### 4.3 La taula `invoices`

```sql
id                    uuid PRIMARY KEY DEFAULT gen_random_uuid()
number                text NOT NULL UNIQUE          -- FO/FS/FR-2026-000001
invoice_type          text NOT NULL                 -- 'full' | 'simplified'
document_kind         text NOT NULL                 -- 'invoice' | 'rectification'
rectifies_invoice_id  uuid REFERENCES invoices(id)
correction_reason     text
source                text NOT NULL                 -- 'order' | 'manual'
order_id              uuid REFERENCES orders(id) ON DELETE RESTRICT
order_number          text
user_id               uuid
issued_at             timestamptz NOT NULL DEFAULT now()
access_token          uuid NOT NULL DEFAULT gen_random_uuid()
-- Instantània del client (no canvia mai)
customer_name, customer_email, customer_tax_id, customer_company,
customer_address, customer_address2, customer_city,
customer_postal_code, customer_country
-- Instantània dels imports
base_products         numeric(10,2)
base_shipping         numeric(10,2)
iva                   numeric(10,2)
total                 numeric(10,2)
-- Instantània de les línies
items                 jsonb
created_at            timestamptz
```

**Dues decisions que no s'han de desfer:**

1. **És una còpia, no una referència.** La factura desa el nom, l'adreça i els imports del dia en què es va emetre. Si demà el client canvia d'adreça o el preu d'un producte canvia, la factura d'ahir continua dient el mateix. Això és el que fa un document fiscal.
2. **És immutable.** Un disparador (`invoices_no_update`) impedeix modificar-la o esborrar-la:

```sql
CREATE TRIGGER invoices_no_update
  BEFORE UPDATE OR DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.invoices_immutable();
```

Per corregir una errada cal una **factura rectificativa**, que és una factura nova de la sèrie FR. La interfície la crea com a esborrany vinculat a l’original.

### 4.4 Seguretat

- **El client** veu les seves factures gràcies a una política RLS que compara `user_id` o `customer_email` amb l'usuari autenticat. La pàgina del client no comprova res pel seu compte: ho filtra la base de dades.
- **L'administrador** ho veu tot, però no des del navegador (les polítiques no ho permeten): ho serveix una funció de servidor amb la clau de servei, que abans comprova `verifyAdmin(event)`.
- **El client sense compte** obre la seva factura amb un **testimoni d'accés**: un UUID aleatori a l'adreça (`/factura/<token>`). Qui el té, veu la factura; qui no, no la troba. És el mateix sistema que fan servir Stripe o Amazon.

---

## 5. Fitxers del sistema

### Base de dades (migracions)

Totes a `supabase/migrations/`, i totes executades al projecte de Supabase:

| Fitxer | Què fa |
|---|---|
| `20260915190000_columnes_factura_a_orders.sql` | `invoice_company` i `invoice_tax_id` a `orders` |
| `20260915200000_tipus_de_factura_a_orders.sql` | `invoice_type` a `orders` |
| `20260915210000_numeracio_de_factures.sql` | `invoice_counters` + `next_invoice_number()` |
| `20260915220000_taula_factures.sql` | La taula `invoices` + immutabilitat + RLS |
| `20260915230000_testimoni_dacces_a_les_factures.sql` | `access_token` |
| `20260915240000_gestio_i_series_de_factures.sql` | Sèries FO/FS/FR, esborranys i emissió manual atòmica |
| `20260915260000_validacions_dels_imports.sql` | Validació d'imports... **no es va executar mai** (vegeu la nota) |
| `20260916120000_la_validacio_dimports_endarrerida.sql` | La mateixa validació, en un sol bloc i amb la prova a dins |
| `20260916130000_mode_de_proves.sql` | Mode de proves: `is_test`, comptador PROVA i el mur que impedeix promoure una prova |

**Convenció:** cada migració porta un comentari que explica *per què* cal, i acaba amb una consulta de comprovació. S'executen **a mà** al SQL Editor de Supabase (vegeu §9).

**Atenció, i és una lliçó apresa:** una migració escrita **no vol dir** una
migració executada. La de `20260915260000` tenia quatre instruccions separades i
en aquest entorn només se n'executava l'última: la funció i el disparador no es
van crear mai, i com que l'última instrucció era una comprovació que no donava
error, ningú no se'n va adonar. Es va detectar el 16/09/2026 provant la base de
dades de debò.

Per això, les migracions noves **van dins d'un sol bloc** (`DO` o
`BEGIN`/`COMMIT`) i, quan es pot, **es validen elles mateixes** amb una prova a
dins. I per això, abans de confiar en una columna o un disparador, es comprova
contra la base de dades.

### Funcions de servidor

| Fitxer | Què fa |
|---|---|
| `netlify/functions/create-payment-intent.js` | Crea la comanda. Desa empresa i CIF, i calcula `invoice_type` |
| `netlify/functions/stripe-webhook.js` | En confirmar-se el pagament, crida **`createInvoice()`** (exportada per poder-la testejar) |
| `netlify/functions/get-invoice.js` | Retorna **una** factura pel seu testimoni. Valida el format abans de tocar la base |
| `netlify/functions/admin-invoices.js` | Totes les factures, amb filtres, cerca, detall i totals |
| `netlify/functions/admin-invoice-drafts.js` | Crea, modifica, elimina i emet esborranys |
| `netlify/functions/admin-invoice-actions.js` | Reenvia una factura per correu |

### Pàgines

| Fitxer | Ruta | Per a qui |
|---|---|---|
| `src/pages/InvoicePage.jsx` | `/factura/:token` | El client, sense compte. Imprimible en A4 |
| `src/pages/MyInvoicesPage.jsx` | `/compte/factures` | El client, amb compte. Llistat agrupat per any |
| `src/pages/AdminInvoicesPage.jsx` | `/admin/factures` | Factures, esborranys, filtres, CSV i accions |
| `src/pages/AdminInvoiceEditorPage.jsx` | `/admin/factures/nova` | Creació manual i rectificatives abans d’emetre |

### Configuració i registre de rutes

| Fitxer | Què hi ha |
|---|---|
| `src/config/issuer.js` | Les dades fiscals de l'emissor, en un sol lloc |
| `src/config/pricing.js` | Preu de venda, IVA, descompte del proveïdor |
| `src/routes/lazyPages.js` | Registre de pàgines amb càrrega diferida |
| `src/routes/AppRoutes.jsx` | Les rutes |
| `src/api/authHeaders.js` | Capçalera `Authorization: Bearer <token>` per a les crides d'admin |

### Tests

`tests/unit/`, 31 fitxers, **248 tests que passen**. Els nous:

| Fitxer | Què comprova |
|---|---|
| `invoice-generation.test.js` | El número, el tipus segons el CIF, les línies i que **no es cremi cap número** si falta la taula |
| `get-invoice.test.js` | Validació del testimoni, 400/404/500 |
| `invoice-allocation.test.js` | El repartiment del transport entre unitats |
| `invoice-email-link.test.js` | L'enllaç al correu, i el rebuig d'enllaços perillosos |
| `admin-invoices.test.js` | El rebuig de qui no és admin, la neteja de la cerca i els totals per trimestre |

---

## 6. Decisions de disseny, i per què

| Decisió | Motiu |
|---|---|
| **Sèries FO, FS i FR separades** | La normativa exigeix separar ordinàries, simplificades i rectificatives quan conviuen el mateix any |
| El número s'agafa **en emitir**, no en comprar | Els intents abandonats deixarien forats a la sèrie |
| **Còpia** en comptes de referència | Un document fiscal no pot canviar quan canvia la comanda |
| **Immutabilitat** per disparador | Per corregir cal rectificativa; el document original es conserva |
| **Testimoni** a la URL | El client ha de poder obrir la factura des del correu sense compte |
| `get-invoice` retorna **una** factura, mai la llista | Així no serveix per esbrinar quantes n'hi ha ni de qui són |
| El text de cerca **es neteja** | Els filtres de PostgREST es componen amb comes i parèntesis; un text que els porti podria alterar la consulta |
| L'última línia **s'ajusta uns cèntims** | La suma de les línies ha de donar exactament el total desat. En un document fiscal els cèntims no poden ballar |

---

## 7. Què està verificat i què no

**Verificat amb eines:**

- 248 tests passant i `npm run build` sense errors.
- L'esquema de la base de dades, comprovat des de fora (les columnes existeixen i responen).
- La numeració: crides simultànies donen números diferents; un visitant anònim rep "permís denegat".
- La suma de les línies quadra amb el total en els casos provats.

**NO verificat:**

- **El circuit complet amb un pagament real.** Cap comanda ha passat mai pel sistema, perquè la botiga encara no ha venut res. El pas final només es pot comprovar amb una comanda de prova (Stripe, targeta `4242 4242 4242 4242`).
- No s'ha creat cap factura de prova a la base de dades, **a posta**: el bloqueig d'immutabilitat no permet esborrar-la i gastaria el primer número de la sèrie corresponent.
- Res no està desplegat a producció (vegeu §9).

---

## 8. Estat de la interfície de gestió

### Implementat

1. **Factura rectificativa.** Es crea com a esborrany vinculat a l’original i s’emet amb la sèrie `FR`.
2. **Factura manual.** Es pot desar incompleta i editar fins al moment d’emetre-la.
3. **Reenviament i exportació.** L’administrador pot reenviar l’enllaç i exportar el conjunt filtrat en CSV.
4. **Mode de proves i editor dedicat.** Vegeu §8bis.
5. **Validació d'imports a la base de dades.** El motor atura una factura amb imports que no quadren.

### Important

6. **Generar el PDF** com a fitxer, no només com a pàgina imprimible. Avui la factura és una pàgina HTML que s'imprimeix des del navegador; un PDF desat permetria adjuntar-lo al correu.
7. **Paginar** la pantalla d'admin. Ara té un límit de 1.000 files i **avisa quan l'assoleix** perquè els totals deixarien de ser de tot el conjunt.

### Desitjable

8. **Enllaç a la factura a la pàgina de seguiment de la comanda** (`/track`), perquè el client la trobi des d'allà.
9. **Filtres de data** (a més de l'any) i **per client**.
10. **Resum anual** pensat per a la declaració: vendes, IVA repercutit i nombre de factures.

---

## 8bis. El mode de proves

Detall complet a `docs/pla-mode-de-proves.md`.

**Què és.** Poder fer el circuit sencer —comanda, factura i correu— sense gastar
cap número de la sèrie fiscal, sense enviar res a Gelato i sense que res compti
a les declaracions.

**Dues pantalles separades, i per què.**

| | De debò | Proves |
|---|---|---|
| Editor | `/admin/factures/nova` | `/admin/factures/proves/nova` |
| Llista | `/admin/factures` | `/admin/factures/proves` |

L'amo ho va demanar així amb un motiu concret: «la diferència entre enviar una
factura o no, poden ser 3 cm». En un editor compartit, desar un esborrany i
emetre una factura de debò queden a tocar.

**Els murs no són la pantalla.** Una pantalla diferent no atura res: un error de
programació la pot saltar. Els murs de debò són a la base de dades:

- `invoice_drafts_coherencia`: un esborrany de prova no pot emetre una factura
  real, ni al revés.
- `invoices_test_number_check`: un número `PROVA-` no pot acabar en una factura
  de debò, ni un número fiscal en una prova.
- La política RLS del client filtra amb `is_test = false` **explícit**.

I al servidor: el correu d'una prova només va a `TEST_EMAIL`, i si `TEST_EMAIL`
no està configurada no s'envia enlloc. Reenviar una factura de prova no pot
enviar res a un client.

**El que no es pot fer, mai:** promoure una prova a factura de debò. Si cal una
factura de debò, s'emet una de nova.

---

## 9. Regles del projecte que has de respectar

1. **No es desplega.** L'amo va demanar explícitament que **no es faci cap desplegament** a Netlify. Es fa `git commit` i `git push` i prou. El desplegament el decideix ell.
2. **Cada canvi, amb tests.** La suite ha de continuar verda. Es corre amb `npx vitest run`.
3. **Les migracions s'executen a mà.** El CLI de Supabase **no està autenticat** en aquest entorn. El procediment és: escriure el fitxer a `supabase/migrations/` **i** donar a l'amo el bloc SQL per enganxar al **SQL Editor de Supabase**. Cal avisar-lo sempre que una migració sigui necessària.
4. **L'amo no és tècnic.** Les explicacions són curtes, en català, i s'ha de dir clarament **què ha de fer ell** i què fas tu. Val més dir "això és una consulta de gestor" que improvisar assessorament fiscal.
5. **Els comentaris expliquen el perquè.** Al projecte hi ha el costum d'escriure, al costat del codi, quin problema resolia. Mantén-ho: és el que evita que algú desfaci una decisió sense saber per què es va prendre.

---

## 10. Com treballar-hi

```bash
npm run dev                 # servidor de desenvolupament (port 3003)
npx vitest run              # tots els tests
npx vitest run tests/unit/invoice-generation.test.js   # un de sol
npx eslint <fitxer>         # comprovar un fitxer
npm run build               # comprovar que compila
```

**Provar la factura de debò:** cal una comanda de pagament amb la targeta de prova de Stripe. Un cop feta, la factura apareixerà a `/admin/factures` amb un número de la sèrie `FO` o `FS`.

**Fitxers de referència per al disseny:** `docs/model-factura.html` és el model de factura que va servir per dissenyar la pàgina; inclou un selector per veure les dues versions (amb CIF / sense).

---

## 11. Vocabulari, perquè no et perdis

| Terme | Què vol dir aquí |
|---|---|
| **Factura simplificada** | La que es fa a un particular. No porta CIF. És el cas normal |
| **Factura** (normal) | La que es fa a una empresa o autònom, amb el seu CIF |
| **Base** | L'import sense IVA. A la factura del projecte hi ha base de productes i base de transport, separades |
| **Transport** | El que costa l'enviament, sense IVA. Es reparteix per unitat: la primera peça paga la tarifa sencera i les altres la reduïda |
| **Testimoni d'accés** | El codi aleatori de l'adreça que permet obrir una factura sense compte |
| **Rectificativa** | Una factura nova que corregeix una d'anterior |
| **Sèrie** | El conjunt de números d'un mateix tipus de document. Aquí n'hi ha una de sola |
| **Gelato** | El proveïdor que imprimeix i envia les samarretes |
| **Gelato+** | El pla de pagament del proveïdor, que aplica un descompte del 20 % sobre el preu de catàleg |

---

## 12. Estat del catàleg (context, no facturació)

Ho trobaràs si has de tocar la botiga:

- El proveïdor **encara té les fitxes muntades amb una samarreta diferent** (Gildan 5000) de la que es ven (Gildan 64000), i amb la tècnica vella (DTG en comptes de DTF). **L'amo ho ha de refer a la seva interfície de Gelato.** Quan ho faci, caldrà tornar a sincronitzar i revisar la taula de costos de `scripts/sync-gelato-products.js`.
- La sincronització es fa amb `npm run sync-gelato`.
- La taula de costos reals del proveïdor (grups A, B i C segons el color) està escrita al mateix script, amb un comentari que explica quan es pot treure.

---

*Informe elaborat a partir de l'estat real del repositori. Els commits del sistema de factures són del `43210af` al `02832c9`. Res no està desplegat.*
