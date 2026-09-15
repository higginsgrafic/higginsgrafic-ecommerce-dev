-- ============================================================
-- PAS B — RETIRAR EL DISPARADOR I NETEJAR LA FILA FALSA
-- ============================================================
-- Enganxa'l al SQL Editor, TOT SENCER, i executa'l.
--
-- IMPORTANT: aquest fitxer va seguit del pas C, immediatament.
-- Entre l'un i l'altre, la taula invoices queda sense la protecció
-- d'immutabilitat. Són uns segons: fes els dos passos seguits.
--
-- Què has de veure:
--   DROP TRIGGER      -> el primer missatge
--   DELETE 1          -> s'ha esborrat una fila (la falsa)
--   files_invoices    -> 0
-- ============================================================

DROP TRIGGER IF EXISTS invoices_no_update ON public.invoices;

-- Filtre estret: si la fila no és exactament aquesta, no s'esborra res.
DELETE FROM public.invoices
WHERE number = 'ZZZ-PROVA-NO-QUADRA'
  AND total = 1
  AND base_products = 100
  AND iva = 21
  AND order_id IS NULL;

SELECT count(*) AS files_invoices FROM public.invoices;
SELECT * FROM public.invoice_series_counters;
SELECT * FROM public.invoice_counters;
