-- ============================================================
-- PAS D — COMPROVAR QUE LA PROTECCIÓ CONTINUA ENCESA (opcional)
-- ============================================================
-- Aquest pas no deixa cap fila: crea una factura falsa, mira que el
-- disparador la protegeixi, i la treu.
--
-- Què has de veure, a la consola de missatges:
--   NOTICE: PROTECCIO OK
--   NOTICE: Fila de prova netejada. Files que queden: 0
--
-- Si veus "FALLADA: el disparador no ha protegit la factura", atura't
-- i passa-m'ho: voldria dir que la protecció no hi és.
-- ============================================================

DO $$
BEGIN
  INSERT INTO public.invoices (number, invoice_type, document_kind, source, total, base_products, iva)
  VALUES ('ZZZ-PROVA-PROTECCIO', 'simplified', 'invoice', 'manual', 121, 100, 21);

  BEGIN
    DELETE FROM public.invoices WHERE number = 'ZZZ-PROVA-PROTECCIO';
    RAISE NOTICE 'FALLADA: el disparador no ha protegit la factura';
  EXCEPTION WHEN raise_exception THEN
    -- És exactament el que volem: la protecció ha saltat.
    RAISE NOTICE 'PROTECCIO OK';
  END;

  -- Neteja: aquesta fila és falsa i no ha de quedar.
  DROP TRIGGER IF EXISTS invoices_no_update ON public.invoices;
  DELETE FROM public.invoices WHERE number = 'ZZZ-PROVA-PROTECCIO';
  CREATE TRIGGER invoices_no_update
    BEFORE UPDATE OR DELETE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.invoices_immutable();

  RAISE NOTICE 'Fila de prova netejada. Files que queden: %',
    (SELECT count(*) FROM public.invoices);
END;
$$;
