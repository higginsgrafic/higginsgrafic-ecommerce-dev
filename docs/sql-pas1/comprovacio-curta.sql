-- ============================================================
-- COMPROVACIÓ CURTA — disparadors, polítiques d'escriptura i taules
-- ============================================================
-- Només lectura. Enganxa'l sencer i executa'l.
-- Són tres consultes curtes; passa'm les tres.
-- ============================================================

-- 1. Tots els disparadors de la taula invoices.
--    N'hi ha d'haver DOS: invoices_no_update i invoices_validacio_imports.
SELECT tgname AS disparador
FROM pg_trigger
WHERE tgrelid = 'public.invoices'::regclass
  AND NOT tgisinternal
ORDER BY tgname;

-- 2. Totes les polítiques que permeten escriure (a = inserir, w = modificar,
--    d = esborrar). És la pregunta que va quedar oberta a la nota de seguretat.
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND cmd IN ('a', 'w', 'd')
ORDER BY tablename, cmd, policyname;

-- 3. Les taules de factures que hi ha.
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'invoice%'
ORDER BY tablename;
