# Pla: mode de proves

**Per què.** Avui no es pot provar res de debò sense fer una venda real. I fer servir
una venda real per provar és perillós: gasta un número de la sèrie de factures,
i les factures emeses no es poden esborrar.

**Objectiu.** Poder generar una comanda sencera de prova —amb la seva factura i el
seu correu— sense tocar la numeració, sense enviar res a Gelato i sense que res
d'això surti als comptes.

## El que ja hi és

- **`MODE_PROVES_STRIPE`** (`stripe-webhook.js`): si la clau de Stripe comença per
  `sk_test_`, la comanda no s'envia a Gelato.
- **Els esborranys no consumeixen número** (`invoice_drafts`): el número s'agafa
  només en emetre.

## El que caldria fer

1. **Una columna `is_test`** (boolean, per defecte `false`) a `orders` i a `invoices`.
2. **No cridar `next_invoice_number()`** quan la comanda és de prova. En comptes
   d'això, un número propi: `PROVA-0001`.
3. **Excloure les proves dels recomptes.** Tots els totals de l'administració
   (anys, trimestres, IVA) han de filtrar `is_test = false`.
4. **Els correus, a una adreça de prova.** Una variable d'entorn, per exemple
   `TEST_EMAIL`, i en mode prova tots els avisos hi van a parar.
5. **Gelato, ni tocar-lo.** Ja ho fa `MODE_PROVES_STRIPE`, però cal assegurar-ho
   també per al camí manual.
6. **Un botó a l'administració**: «Generar comanda de prova». Crea la comanda,
   emet la factura marcada com a prova, envia el correu i deixa l'enllaç a mà.
7. **Esborrar les proves**, que sí que es pot fer: una factura de prova **no és un
   document fiscal** i per tant no li cal la immutabilitat. El disparador
   d'immutabilitat ha de deixar passar les files amb `is_test = true`.

## Regles que no es poden trencar

- Una factura de prova **no pot passar mai a definitiva**. Si cal una factura de
  debò, s'emet una de nova.
- Cap factura de prova pot agafar un número de la sèrie real.
- Els totals de les declaracions **no poden incloure proves**. Si mai hi ha un
  dubte, el filtre ha de ser explícit (`is_test = false`), mai implícit.

## Quan

Pendent de fer. És una feina d'una sessió, i val la pena fer-la abans de la
primera venda real, perquè permet provar tot el circuit diverses vegades.
