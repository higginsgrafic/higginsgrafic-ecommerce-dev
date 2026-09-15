-- ============================================================
-- Validacions dels imports de les factures
-- ============================================================
--
-- PER QUÈ CAL
--
-- Els imports de la factura els calcula el codi de l'esborrany i la funció
-- d'emissió se'ls creu. Si aquell càlcul té una errada, la factura s'emet amb
-- xifres equivocades i, com que les factures emeses no es poden modificar,
-- queda malament per sempre.
--
-- Aquestes comprovacions viuen a la base de dades perquè valen per a QUALSEVOL
-- camí d'emissió: el manual, el de les comandes i el que s'afegeixi després.
-- Són dues:
--
--   1. Una rectificativa ha de portar imports negatius.
--      Els imports els escriu l'usuari en negatiu, perquè sovint se'n rectifica
--      només una part. Si algú s'oblida, la rectificativa sortiria en positiu i
--      no corregiria res.
--
--   2. Els imports han de quadrar.
--      El total ha de ser la suma de la base dels productes, la base del
--      transport i l'IVA. Es tolera un cèntim, per l'arrodoniment.
--
-- Com executar-ho: Supabase → SQL Editor → enganxar això → Run.
-- És segur repetir-ho.

CREATE OR REPLACE FUNCTION public.invoices_validacio_imports()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  suma numeric(10,2);
BEGIN
  IF NEW.document_kind = 'rectification' AND NEW.total >= 0 THEN
    RAISE EXCEPTION
      'Una factura rectificativa ha de portar imports negatius (total: %)', NEW.total
      USING HINT = 'Escriu les linies i el transport en negatiu, com a correccio de la factura original.';
  END IF;

  suma := ROUND(
    COALESCE(NEW.base_products, 0) + COALESCE(NEW.base_shipping, 0) + COALESCE(NEW.iva, 0),
    2
  );
  IF ABS(ROUND(NEW.total, 2) - suma) > 0.01 THEN
    RAISE EXCEPTION
      'Els imports de la factura no quadren: el total es % pero base + transport + IVA fan %',
      NEW.total, suma;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS invoices_validacio_imports ON public.invoices;
CREATE TRIGGER invoices_validacio_imports
  BEFORE INSERT ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.invoices_validacio_imports();

-- Comprovació: han de sortir dos disparadors (l'immutable i aquest).
SELECT tgname AS disparador
FROM pg_trigger
WHERE tgrelid = 'public.invoices'::regclass
  AND NOT tgisinternal
ORDER BY tgname;
