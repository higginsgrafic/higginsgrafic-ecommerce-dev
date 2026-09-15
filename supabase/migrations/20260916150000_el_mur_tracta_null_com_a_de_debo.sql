-- ============================================================
-- El mur de les proves ha de tractar NULL com a «de debò»
-- ============================================================
--
-- PER QUÈ CAL
--
-- La funció `invoices_esborrany_coherent()` de la migració
-- `20260916130000_mode_de_proves.sql` comparava així:
--
--     IF es_prova IS DISTINCT FROM NEW.is_test THEN
--
-- i això té un error. Si `NEW.is_test` és NULL (un esborrany creat abans que la
-- columna existís, o una fila tocada per una eina antiga), la comparació
-- `false IS DISTINCT FROM NULL` és CERTA i la funció peta. O sigui que la
-- protecció pensada per a les proves acabaria ATURANT l'emissió d'una factura
-- de debò, que és exactament el contrari del que ha de fer.
--
-- La regla bona és aquesta: NULL vol dir «no és cap prova». Un document només
-- és una prova si ho diu explícitament (`is_test = true`). Amb aquesta
-- correcció, un esborrany antic s'emet sense entrebancs, i les proves
-- continuen quedant separades de les factures.
--
-- Aquest error es va detectar repassant el codi abans d'executar la migració,
-- i per això es corregeix en un fitxer a part i no editant el que ja s'havia
-- donat: una migració donada no es reescriu mai.
--
-- Com executar-ho: Supabase → SQL Editor → enganxar això SENCER → Run.
-- És segur repetir-ho.
-- ============================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.invoices_esborrany_coherent()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  factura_es_prova boolean;
  esborrany_es_prova boolean;
BEGIN
  IF NEW.emitted_invoice_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Si la taula de factures no existís, no hi ha res a comprovar.
  BEGIN
    EXECUTE 'SELECT is_test FROM public.invoices WHERE id = $1'
      INTO factura_es_prova USING NEW.emitted_invoice_id;
  EXCEPTION WHEN undefined_table THEN
    RETURN NEW;
  END;

  -- NULL vol dir «no és cap prova». Mai s'ha d'aturar un document de debò pel
  -- fet que la seva fila no porti la marca.
  factura_es_prova := COALESCE(factura_es_prova, false);
  esborrany_es_prova := COALESCE(NEW.is_test, false);

  IF factura_es_prova <> esborrany_es_prova THEN
    RAISE EXCEPTION
      'Un esborrany de prova només es pot emetre com a factura de prova, i un de real només com a factura real.'
      USING HINT = 'Una factura de prova no pot passar mai a definitiva, ni al revés.';
  END IF;

  RETURN NEW;
END;
$$;

COMMIT;

-- Comprovacions
-- 1. El disparador ha de continuar existint.
SELECT tgname AS disparador
FROM pg_trigger
WHERE tgrelid = 'public.invoice_drafts'::regclass
  AND NOT tgisinternal
ORDER BY tgname;

-- 2. La funció ha de citar el COALESCE (vol dir que és la versió corregida).
SELECT pg_get_functiondef('public.invoices_esborrany_coherent()'::regprocedure) LIKE '%COALESCE%' AS te_coalesce;
