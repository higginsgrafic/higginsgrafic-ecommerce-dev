# Pla: mode de proves — FET

**Estat: implementat el 16 de setembre de 2026.** Aquest document ja no és un
pla: és el resum del que es va fer i de com es comprova. Es conserva perquè
explica **per què** cada peça és com és.

**Per què calia.** No es podia provar res de debò sense fer una venda real. I una
venda real gasta un número de la sèrie fiscal, que no es pot recuperar.

**El perill era real, no teòric:** `createInvoice()` es cridava sempre que
Stripe confirmava un pagament, i `MODE_PROVES_STRIPE` només aturava l'enviament
a Gelato. Una compra de prova amb la targeta `4242` hauria cremat un número
`FO` o `FS`.

---

## Què s'ha fet

### Base de dades — `supabase/migrations/20260916130000_mode_de_proves.sql`

| # | Què | Per què |
|---|---|---|
| 1 | `is_test` a `orders`, `invoices` i `invoice_drafts` | Les tres taules ho han de saber |
| 2 | Restricció `invoices_test_number_check` | Un número de prova ha de començar per `PROVA-`, i un de debò no |
| 3 | Taula `invoice_test_counters` i funció `next_test_invoice_number()` | Comptador **propi**: és impossible que una prova toqui la sèrie FO/FS/FR |
| 4 | Política del client amb `is_test = false` **explícit** | Sense això, un compte de debò veuria proves a `/compte/factures` |
| 5 | Disparador d'immutabilitat amb porta per a les proves | Una prova no és un document fiscal: es pot esborrar |
| 6 | Disparador `invoice_drafts_coherencia` | **El mur**: un esborrany de prova no pot emetre una factura real, ni al revés |
| 7 | `issue_invoice_draft()` adaptada | El camí manual ja no gasta número fiscal per una prova |

La migració va tota dins d'una transacció: o s'aplica tota, o no s'aplica res.

### Base de dades — `supabase/migrations/20260916140000_rectificatives_del_mateix_tipus.sql`

Tanca un forat que quedava obert: una **rectificativa** també pot creuar el mur.
La restricció que hi havia només comprovava que portés motiu i factura original,
no que les dues fossin del mateix tipus. O sigui que es podia fer una
rectificativa de debò que assenyalés una factura de prova (un document fiscal
que corregeix una prova, i que a sobre gasta un número `FR`) o al revés.

Ara un disparador ho impedeix en tots dos sentits.

### Base de dades — `supabase/migrations/20260916150000_el_mur_tracta_null_com_a_de_debo.sql`

Correcció d'un error de la migració anterior, detectat repassant el codi abans
d'executar-lo. La comprovació del mur era:

```sql
IF es_prova IS DISTINCT FROM NEW.is_test THEN
```

Si `NEW.is_test` és `NULL` —una fila creada abans que la columna existís—
`false IS DISTINCT FROM NULL` és **cert**, i la funció hauria aturat l'emissió
d'una **factura de debò**. O sigui que la protecció de les proves hauria fet
exactament el contrari del que ha de fer.

La regla bona: **NULL vol dir «no és cap prova»**. Ara els dos costats es
normalitzen amb `COALESCE(..., false)` abans de comparar. No s'ha editat la
migració donada: una migració donada no es reescriu mai.

### Codi

| Fitxer | Què hi ha |
|---|---|
| `netlify/lib/gelato.js` | **Refusa enviar una comanda de prova a Gelato.** Segona barrera: el webhook ja ho atura amb les claus de prova, però així tampoc no hi passa cap altre camí |
| `netlify/functions/stripe-webhook.js` | `fulfillGelato()` retorna `skip` de seguida per a una comanda de prova. Sense això, l'error del guard feia que Stripe reintentés la comanda una i una altra vegada |
| `netlify/functions/stripe-webhook.js` | `createInvoice()` no crida mai `next_invoice_number()` si la comanda és una prova |
| `netlify/functions/create-payment-intent.js` | Marca la comanda, i **només un administrador** pot demanar una comanda de prova |
| `netlify/functions/admin-invoice-drafts.js` | Separació de proves i documents de debò: un esborrany només s'edita, s'emet i s'esborra des de la seva pantalla (si no, respon 409 i ho explica); la marca no es pot canviar editant |
| `netlify/functions/admin-invoices.js` | `is_test = false` explícit als totals, i `?test=true` per veure només les proves |
| `netlify/functions/admin-invoice-actions.js` | Reenviar una prova **no envia res a un client** |
| `netlify/lib/email.js` | `adrecaDestinataria()`: un correu de prova només va a `TEST_EMAIL`; sense `TEST_EMAIL`, no s'envia |
| `netlify/functions/admin-test-order.js` | Genera una prova sencera: comanda, factura i correu |
| `src/components/admin/InvoiceEditor.jsx` | L'editor, amb dos modes |
| `src/pages/AdminInvoiceTestEditorPage.jsx` | La pantalla de proves, dedicada |

### Les dues pantalles

| | De debò | Proves |
|---|---|---|
| Ruta | `/admin/factures/nova` | `/admin/factures/proves/nova` |
| Llista | `/admin/factures` | `/admin/factures/proves` |
| Números | FO / FS / FR | PROVA-AAAA-000000 |
| Correu | Al client | A `TEST_EMAIL`, i mai a un client |
| Esborrar | Mai | Sí |
| Al compte del client | Sí | **Mai** |
| Confirmació | `VALIDA LA FACTURA` | `CREA LA PROVA` |
| Totals fiscals | Sí | No s'hi mostren |

**Els murs no són només visuals.** Una pantalla diferent no n'hi hauria prou: un
error de programació la pot saltar. Els murs de debò són a la base de dades
(`invoice_drafts_coherencia`, `invoices_test_number_check`) i al servidor.

### El botó «Generar una prova»

A `/admin/factures/proves` hi ha un botó que fa el circuit sencer d'una tirada:
agafa una peça real del catàleg, calcula els imports amb les mateixes regles que
el checkout, crea la comanda marcada com a prova, emet la factura `PROVA-` i
envia el correu a `TEST_EMAIL`. **No passa per Stripe i no envia res a Gelato.**

Serveix per provar-ho tot sense targeta. Per provar el circuit **amb Stripe**, el
camí és el de sempre: la comanda de prova es crea amb la targeta
`4242 4242 4242 4242` i el webhook li dona un número `PROVA-` perquè la comanda
neix amb `is_test = true`.

**Detall important:** si la migració no està executada, el botó respon amb un
error i **no crea res**. Sense la marca `is_test` a `orders`, la factura hauria
gastat un número de la sèrie fiscal, i això no es pot permetre.

---

## Configuració que cal

A Netlify, una variable d'entorn:

```
TEST_EMAIL = higginsgrafic@gmail.com
```

Si no hi és, els correus de prova **no s'envien enlloc**. És a posta: val més no
enviar-los que enviar-los a un client de debò.

---

## Com s'instal·la (per al propietari)

**Un sol fitxer, una sola execució:**

1. Obre `docs/sql-pas1/EXECUTA-LES-MIGRACIONS.sql`
2. Copia-ho **tot**
3. Supabase → SQL Editor → finestra nova → enganxa → Run
4. Al terminal: `npm run verifica:proves`

El fitxer porta les quatre migracions en ordre i cada bloc va dins d'una
transacció: o s'aplica, o no s'aplica. No pot quedar a mitges.

**Es genera tot sol**, no s'edita a mà:

```bash
npm run genera:sql-proves
```

La font són els fitxers de `supabase/migrations/`. Un test comprova que el
fitxer generat no s'hagi quedat enrere respecte d'ells.

I una variable d'entorn a Netlify:

```
TEST_EMAIL = higginsgrafic@gmail.com
```

---

## Com es comprova

**Contra la base de dades de debò**, que és el que compta:

```bash
npm run verifica:proves
```

Aquest guió pregunta a la base de dades si el mode de proves hi és: les
columnes, el comptador, que la sèrie fiscal estigui intacta, i que els murs
rebutgin el que han de rebutjar. Cada prova que toca dades va dins d'una
transacció que s'ha de desfer, i **el guió comprova que s'ha desfet de debò**
—— perquè el 16/09/2026 una fila de prova es va quedar a `invoices` per donar
per fet que una transacció es desfaria sense comprovar-ho.

Si les columnes no hi són, el guió ho diu i surt amb codi d'error: serveix per
saber si les migracions estan executades sense haver de llegir cap document.

1. **Automàtic:** `npx vitest run`. Els tests del mode de proves són
   `tests/unit/test-mode-invoice.test.js`, `tests/unit/test-mode-walls.test.js`,
   `tests/unit/test-mode-test-order.test.js` i
   `tests/unit/test-mode-drafts-separation.test.js`.
2. **La sèrie fiscal, intacta:** després de fer proves,
   `SELECT * FROM public.invoice_series_counters;` ha de continuar **buit**.
3. **El mur:** intentar emetre un esborrany de prova i comprovar que la factura
   que en surt porta `PROVA-` i `is_test = true`.
4. **El correu:** fer una prova i mirar que l'avís arribi a `TEST_EMAIL` i no al
   correu que s'hagi escrit a la fitxa.

---

## Regles que no es poden trencar

- Una factura de prova **no pot passar mai a definitiva**. Si cal una factura de
  debò, s'emet una de nova.
- Cap factura de prova pot agafar un número de la sèrie real.
- Els totals de les declaracions **no poden incloure proves**. El filtre ha de
  ser sempre explícit (`is_test = false`), mai implícit.
- La marca de prova ve **sempre** de la comanda o de l'esborrany, mai es dedueix
  de les claus de Stripe: el dia que hi hagi claus de producció, una compra feta
  amb una targeta de prova deixaria una venda de debò sense factura.
