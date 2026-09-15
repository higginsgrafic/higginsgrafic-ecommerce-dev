-- ============================================================
-- La validació d'imports de les factures, instal·lada de debò
-- ============================================================
--
-- PER QUÈ CAL AQUEST FITXER, SI JA N'HI HAVIA UN
--
-- La migració `20260915260000_validacions_dels_imports.sql` es va escriure i
-- es va donar per executada, però **no va arribar mai a la base de dades**.
-- Comprovat el 16/09/2026: la taula `invoices` només té el disparador
-- `invoices_no_update`, i un INSERT amb base 100 + IVA 21 i total 1 va ser
-- acceptat sense cap queixa.
--
-- La causa és el format: aquell fitxer té quatre instruccions separades
-- (CREATE FUNCTION, DROP TRIGGER, CREATE TRIGGER, SELECT). Si s'executa en un
-- entorn que només en corre l'última, la funció i el disparador no s'arriben a
-- crear mai i res no avisa.
--
-- PER AIXÒ TOT VA DINS D'UN SOL BLOC `DO`: s'executa sencer o no s'executa.
-- I al final es fa una PROVA de debò, dins d'una transacció que es desfà: si
-- el disparador no aturés la factura falsa, aquesta mateixa migració fallaria
-- i no deixaria res a mitges.
--
-- PER QUÈ CAL, DE TOTES MANERES
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
-- S'aplica a TOTES les factures, també a les de prova: si una prova no passés
-- aquest filtre, voldria dir que el càlcul té una errada de debò, i és
-- exactament el que volem detectar abans de vendre res.
--
-- Com executar-ho: Supabase → SQL Editor → enganxar això → Run.
-- És segur repetir-ho.
-- ============================================================

DO $migracio$
BEGIN
  EXECUTE $sql$
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
  $sql$;

  DROP TRIGGER IF EXISTS invoices_validacio_imports ON public.invoices;

  CREATE TRIGGER invoices_validacio_imports
    BEFORE INSERT ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.invoices_validacio_imports();

  -- ------------------------------------------------------------
  -- PROVA DE DEBÒ, dins d'una transacció que es desfà.
  -- Inserta una factura amb imports que NO quadren. El disparador l'ha
  -- d'aturar. Si no l'atura, aquesta migració peta i no s'instal·la res.
  -- ------------------------------------------------------------
  BEGIN
    INSERT INTO public.invoices
      (number, invoice_type, document_kind, source, base_products, base_shipping, iva, total)
    VALUES
      ('ZZZ-PROVA-VALIDACIO', 'simplified', 'invoice', 'manual', 100, 0, 21, 1);
    RAISE EXCEPTION 'FALLADA: el disparador no ha aturat una factura amb imports que no quadren';
  EXCEPTION
    WHEN raise_exception THEN
      IF SQLERRM LIKE 'FALLADA:%' THEN
        RAISE;
      END IF;
  END;

  RAISE NOTICE 'PROTECCIO OK: la factura amb imports que no quadren ha estat aturada.';
  RAISE NOTICE 'Validacio d imports instal-lada. Files que queden a invoices: %',
    (SELECT count(*) FROM public.invoices);
END;
$migracio$;

-- Comprovació: han de sortir DOS disparadors (l'immutable i aquest).
SELECT tgname AS disparador
FROM pg_trigger
WHERE tgrelid = 'public.invoices'::regclass
  AND NOT tgisinternal
ORDER BY tgname;
