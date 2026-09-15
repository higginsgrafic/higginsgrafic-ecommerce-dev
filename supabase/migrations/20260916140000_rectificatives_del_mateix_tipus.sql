-- ============================================================
-- Una rectificativa no pot creuar el mur de les proves
-- ============================================================
--
-- PER QUÈ CAL
--
-- La migració del mode de proves (`20260916130000`) impedeix que un esborrany
-- de prova emeti una factura de debò, i que un número PROVA- acabi en una
-- factura real. Però quedava un forat: una RECTIFICATIVA.
--
-- Una rectificativa és una factura nova que referencia una d'anterior, i la
-- restricció que hi havia només comprovava que portés motiu i factura original
-- (`invoices_rectification_check`). No comprovava que les dues fossin del
-- mateix tipus. O sigui que es podia fer:
--
--   * una rectificativa de PROVA que assenyalés una factura de debò
--   * una rectificativa de debò que assenyalés una factura de prova
--
-- La segona és la perillosa: un document fiscal que corregeix una prova no vol
-- dir res, i a sobre gastaria un número de la sèrie FR. I la primera deixaria
-- una factura de debò amb un document de prova penjant.
--
-- Això també importa per una altra cosa: la política RLS del client amaga les
-- factures de prova. Una rectificativa de debò que apuntés a una prova seria
-- una factura visible que referencia un document invisible.
--
-- Com executar-ho: Supabase → SQL Editor → enganxar això SENCER → Run.
-- És segur repetir-ho.
-- ============================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.invoices_rectificativa_mateix_tipus()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  original_es_prova boolean;
BEGIN
  -- Només ens interessa quan és una rectificativa.
  IF NEW.document_kind <> 'rectification' OR NEW.rectifies_invoice_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- La factura original ha d'existir (ho garanteix la clau forana), i ha de
  -- ser del mateix tipus que la rectificativa.
  SELECT is_test INTO original_es_prova
  FROM public.invoices
  WHERE id = NEW.rectifies_invoice_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION
      'La factura que es vol rectificar no existeix.'
      USING HINT = 'Comprova el número de la factura original.';
  END IF;

  IF original_es_prova IS DISTINCT FROM NEW.is_test THEN
    RAISE EXCEPTION
      'Una rectificativa de prova només pot rectificar una factura de prova, i una de debò només una de debò.'
      USING HINT = 'Les proves i les factures de debò no es poden barrejar.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS invoices_rectificativa_tipus ON public.invoices;
CREATE TRIGGER invoices_rectificativa_tipus
  BEFORE INSERT OR UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.invoices_rectificativa_mateix_tipus();

COMMIT;

-- Comprovacions
-- 1. Han de sortir els tres disparadors de la taula invoices.
SELECT tgname AS disparador
FROM pg_trigger
WHERE tgrelid = 'public.invoices'::regclass
  AND NOT tgisinternal
ORDER BY tgname;
