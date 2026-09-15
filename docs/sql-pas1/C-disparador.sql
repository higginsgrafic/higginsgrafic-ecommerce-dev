-- ============================================================
-- PAS C — TORNAR A POSAR EL DISPARADOR, MÉS LLEST
-- ============================================================
-- Enganxa'l al SQL Editor, TOT SENCER, i executa'l just després del pas B.
--
-- PER QUÈ CAL:
-- la versió vella del disparador peta amb QUALSEVOL update o delete, sense
-- mirar la fila. Fins i tot impedeix netejar una fila òrfena que no forma
-- part de cap document. Aquesta versió protegeix exactament el mateix que
-- abans, i una mica més ben mirat:
--
--   * una factura que algun document referencia: INTOCABLE, com sempre
--   * una fila òrfena (sense cap document que la referenciï): es pot esborrar
--
-- NO s'hi fa servir is_test: aquesta columna encara no existeix. S'afegirà
-- quan es faci el mode de proves, i aleshores la protecció de les factures
-- de prova quedarà tancada.
--
-- Què has de veure:
--   CREATE FUNCTION
--   CREATE TRIGGER
--   I a l'última consulta: invoices_no_update
-- ============================================================

CREATE OR REPLACE FUNCTION public.invoices_immutable()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  id_fila uuid;
  referencia boolean := false;
BEGIN
  -- En un INSERT no hi ha cap document emès: no hi ha res a protegir.
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;

  id_fila := OLD.id;

  -- Una fila òrfena (sense id) no és cap document: fora.
  IF id_fila IS NULL THEN
    RETURN NULL;
  END IF;

  -- Comprovem si algun document la referencia. Es fa amb SQL dinàmic i amb
  -- un EXCEPTION, perquè si la taula d'esborranys no existís no volem
  -- bloquejar-ho tot: es bloqueja només el que se sap del cert.
  BEGIN
    EXECUTE $q$
      SELECT EXISTS (SELECT 1 FROM public.invoices r WHERE r.rectifies_invoice_id = $1)
          OR EXISTS (SELECT 1 FROM public.invoice_drafts d
                     WHERE d.emitted_invoice_id = $1 OR d.rectifies_invoice_id = $1)
    $q$ INTO referencia USING id_fila;
  EXCEPTION WHEN undefined_table THEN
    referencia := false;
  END;

  IF referencia THEN
    RAISE EXCEPTION
      'Una factura emesa no es pot modificar ni esborrar. Cal una factura rectificativa.';
  END IF;

  -- Segons si és un DELETE o un UPDATE, la fila que ha de seguir endavant
  -- és OLD o NEW. S'escriu amb un IF i no amb COALESCE perquè COALESCE,
  -- amb variables de disparador, pot donar problemes de tipus.
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS invoices_no_update ON public.invoices;
CREATE TRIGGER invoices_no_update
  BEFORE UPDATE OR DELETE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.invoices_immutable();

-- Comprovació: ha de sortir invoices_no_update.
SELECT tgname AS disparador
FROM pg_trigger
WHERE tgrelid = 'public.invoices'::regclass
  AND NOT tgisinternal
ORDER BY tgname;
