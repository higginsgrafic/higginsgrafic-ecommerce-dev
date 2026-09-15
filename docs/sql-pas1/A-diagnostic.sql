-- ============================================================
-- PAS A — DIAGNÒSTIC (NOMÉS LECTURA)
-- ============================================================
-- Aquest fitxer només llegeix. No pot modificar ni esborrar res.
--
-- Enganxa'l al SQL Editor de Supabase, tot sencer, i executa'l.
-- Passa'm el resultat de les sis consultes.
-- ============================================================

-- A1. Els disparadors que hi ha de debò a invoices.
SELECT tgname AS disparador
FROM pg_trigger
WHERE tgrelid = 'public.invoices'::regclass
  AND NOT tgisinternal
ORDER BY tgname;

-- A2. Les funcions de disparador de factures que existeixen.
SELECT p.proname AS funcio
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('invoices_validacio_imports', 'invoices_immutable')
ORDER BY p.proname;

-- A3. TOTES les polítiques que permeten escriure.
--     cmd: a = inserció, w = modificació, d = esborrat.
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND cmd IN ('a', 'w', 'd')
ORDER BY tablename, cmd, policyname;

-- A4. El resum complet de polítiques.
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- A5. Quines taules de factures hi ha.
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'invoice%'
ORDER BY tablename;

-- A6. La fila falsa hi és? I què diuen els comptadors?
SELECT number, total, base_products, iva, issued_at
FROM public.invoices
ORDER BY issued_at;

SELECT * FROM public.invoice_series_counters;
SELECT * FROM public.invoice_counters;
