-- ============================================================
-- UNA SOLA CONSULTA: els disparadors de la taula invoices
-- ============================================================
-- Només lectura. No modifica res.
--
-- N'hi ha d'haver DOS:
--   invoices_no_update            (immutabilitat)
--   invoices_validacio_imports    (imports que quadren)
--
-- Si només en surt un, falta la validació d'imports.
-- ============================================================

SELECT tgname AS disparador
FROM pg_trigger
WHERE tgrelid = 'public.invoices'::regclass
  AND NOT tgisinternal
ORDER BY tgname;
