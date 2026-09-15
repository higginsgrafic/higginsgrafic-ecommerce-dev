# Pas 1 — Diagnòstic i neteja (per enganxar al SQL Editor de Supabase)

**Què és això.** El bloc de SQL del pas 1. S'executa **a mà**: Supabase → SQL
Editor → enganxar → Run.

**Per què cal.** El CLI de Supabase no està autenticat en aquest entorn, i la
clau de servei només arriba a PostgREST (no pot llegir `pg_trigger` ni
`pg_policies`, ni executar SQL lliure). Sense això, no es pot afirmar res sobre
els disparadors ni sobre les polítiques d'escriptura.

**Què s'hi comprova, i per què:**

1. **Els disparadors d'`invoices`.** Sospita forta que
   `invoices_validacio_imports` **no hi és**: un `INSERT` amb imports que no
   quadraven (base 100 + IVA 21, total 1) va respondre correctament en comptes
   de ser rebutjat. El fitxer existeix al repositori, però el fitxer no és la
   base de dades.
2. **Les polítiques d'escriptura.** És l'única pregunta que la nota de la falsa
   alarma va deixar oberta. Serveix per tancar-la de debò.
3. **Quines taules de factures hi ha.** Per saber si alguna migració va quedar
   a mitges.
4. **La fila falsa.** Un `INSERT` de prova meu (`ZZZ-PROVA-NO-QUADRA`) es va
   desar de debò. Cal esborrar-la. **No ha gastat cap número de sèrie**: tots
   dos comptadors estan buits (comprovat).

---

## Bloc per enganxar (sencer, d'una tirada)

```sql
-- ============================================================
-- PAS 1 — DIAGNÒSTIC I NETEJA
-- Segur de repetir: no crea ni modifica res, només llegeix,
-- tret de la neteja final, que només toca la fila falsa.
-- ============================================================

-- ------------------------------------------------------------
-- 0a. Els disparadors que hi ha de debò a invoices
-- Han de sortir DOS: invoices_no_update i invoices_validacio_imports.
-- ------------------------------------------------------------
SELECT tgname AS disparador
FROM pg_trigger
WHERE tgrelid = 'public.invoices'::regclass
  AND NOT tgisinternal
ORDER BY tgname;

-- ------------------------------------------------------------
-- 1b. Hi ha el disparador d'imports? (llegeix la seva definició)
-- Si no torna cap fila, la migració 20260915260000 NO s'ha executat.
-- ------------------------------------------------------------
SELECT p.proname AS funcio, pg_get_functiondef(p.oid) AS definicio
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('invoices_validacio_imports', 'invoices_immutable');

-- ------------------------------------------------------------
-- 2. TOTES les polítiques: què es pot escriure i qui ho pot fer
--    cmd: r = lectura, a = inserció, w = modificació, d = esborrat
--    Es mira amb lupa qualsevol 'a', 'w' o 'd'.
-- ------------------------------------------------------------
SELECT tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND cmd IN ('a', 'w', 'd')
ORDER BY tablename, cmd, policyname;

-- I el resum complet, per tenir-ho tot al davant:
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- ------------------------------------------------------------
-- 3. Quines taules de factures hi ha
-- Ha de sortir: invoices, invoice_drafts, invoice_series_counters
-- i invoice_counters (aquesta darrera és la vella, sense ús).
-- ------------------------------------------------------------
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'invoice%'
ORDER BY tablename;

-- ------------------------------------------------------------
-- 4. NETEJA: esborrar la fila falsa del meu INSERT de prova.
--
--    Vegeu: docs/on-ho-vam-deixar.md i la nota de seguretat.
--    La fila és falsa (imports que no quadren, número ZZZ-), no ha
--    gastat cap número de sèrie i no és cap document fiscal.
--    El filtre és deliberadament estret: si la fila no és
--    exactament aquesta, no s'esborra res.
-- ------------------------------------------------------------
DELETE FROM public.invoices
WHERE number = 'ZZZ-PROVA-NO-QUADRA'
  AND total = 1
  AND base_products = 100
  AND iva = 21
  AND order_id IS NULL;

-- Comprovació: ha de tornar 0 files.
SELECT count(*) AS files_invoices FROM public.invoices;

-- I els comptadors han de continuar tots dos buits:
SELECT * FROM public.invoice_series_counters;
SELECT * FROM public.invoice_counters;
```

---

## Què he de fer jo amb el resultat

- **Consulta 0a:** si surten menys de dos disparadors, falta la validació
  d'imports. Llavors cal executar el fitxer
  `supabase/migrations/20260915260000_validacions_dels_imports.sql` (ja està
  escrit i és segur de repetir). **Avisa'm i t'ho confirmo abans que ho facis.**
- **Consulta 2:** si alguna política permet escriure a `orders`, `invoices`,
  `staff` o `invoice_series_counters` amb la clau pública, és un forat de debò.
  Amb la llista al davant decideixo si cal una migració.
- **Consulta 3:** si hi ha una taula que no hi hauria de ser, o no hi és la que
  hi hauria de ser, ho arreglo amb una migració.
- **Consulta 4:** un cop neta, ja puc continuar amb el mode de proves sense
  arrossegar la fila falsa.
