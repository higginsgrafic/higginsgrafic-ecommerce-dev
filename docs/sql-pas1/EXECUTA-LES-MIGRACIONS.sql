-- ============================================================
-- MODE DE PROVES — TOTES LES MIGRACIONS, EN ORDRE
-- ============================================================
--
-- AQUEST FITXER ES GENERA TOT SOL. No l'editis a mà.
--   node scripts/genera-sql-mode-de-proves.mjs
-- La font són els fitxers de supabase/migrations/.
--
-- COM S'EXECUTA
--
--   1. Supabase → SQL Editor
--   2. Enganxa AQUEST FITXER SENCER
--   3. Run
--   4. Després, al terminal:  npm run verifica:proves
--
-- CADA BLOC VA DINS D'UNA TRANSACCIÓ: o s'aplica, o no s'aplica. Si un falla,
-- no queda res a mitges. És segur tornar-lo a passar sencer.
--
-- QUÈ FA, EN ORDRE
--
--   1. La validació d'imports de les factures (que no s'havia executat mai).
--   2. El mode de proves: is_test, comptador PROVA- i els murs.
--   3. Les rectificatives no poden creuar el mur de les proves.
--   4. El mur tracta NULL com a «de debò» (abans hauria aturat factures reals).
--
-- QUÈ NO FA
--
--   * No esborra cap factura ni cap comanda.
--   * No toca la sèrie FO/FS/FR: el comptador de proves és una taula a part.
--   * No envia res a Gelato ni cap correu.
--

-- ############################################################################
-- BLOC 1 de 4: 20260916120000_la_validacio_dimports_endarrerida.sql
-- ############################################################################

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

-- ############################################################################
-- BLOC 2 de 4: 20260916130000_mode_de_proves.sql
-- ############################################################################

-- ============================================================
-- Mode de proves
-- ============================================================
--
-- PER QUÈ CAL
--
-- Avui no es pot provar el circuit sencer sense fer una venda de debò. I una
-- venda de debò gasta un número de la sèrie fiscal, que no es pot recuperar:
-- les factures emeses són immutables.
--
-- El perill no és teòric: `createInvoice()` es crida sempre que Stripe confirma
-- un pagament, i `MODE_PROVES_STRIPE` només atura l'enviament a Gelato. Una
-- compra de prova amb la targeta 4242 cremaria avui un número FO o FS.
--
-- QUÈ FA
--
--   1. `is_test` a orders, invoices i invoice_drafts.
--   2. Un comptador PROPI per a les proves (`invoice_test_counters`), amb la
--      seva funció `next_test_invoice_number()`: PROVA-2026-000001.
--      La sèrie fiscal no es toca mai des d'aquí.
--   3. Una restricció que impedeix el pitjor cas possible: que una factura de
--      prova es col·li com a factura real. I al revés, que una factura real
--      quedi marcada com a prova (una venda sense document fiscal).
--   4. La política del client, amb el filtre EXPLÍCIT `is_test = false`. Sense
--      això, un compte de debò veuria factures de prova a /compte/factures.
--   5. El disparador d'immutabilitat, que ara deixa esborrar les proves: una
--      factura de prova no és un document fiscal.
--
-- REGLES QUE NO ES PODEN TRENCAR (del pla del mode de proves)
--
--   * Una factura de prova no pot passar mai a definitiva.
--   * Cap factura de prova pot agafar un número de la sèrie real.
--   * Els totals de les declaracions no poden incloure proves: el filtre ha de
--     ser explícit (`is_test = false`), mai implícit.
--
-- Com executar-ho: Supabase → SQL Editor → enganxar això SENCER → Run.
-- Va tot dins d'una transacció: o s'aplica tot, o no s'aplica res. No pot
-- quedar a mitges com va passar amb la validació d'imports.
-- És segur repetir-ho.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. Les columnes
-- ------------------------------------------------------------
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

ALTER TABLE public.invoice_drafts
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

-- Un número de prova no s'ha de poder confondre mai amb un de real, ni pel
-- prefix ni per la sèrie. Aquesta restricció és la xarxa de seguretat de la
-- numeració: encara que una funció s'equivoqui, la base de dades ho atura.
DO $migracio$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'invoices_test_number_check'
      AND conrelid = 'public.invoices'::regclass
  ) THEN
    ALTER TABLE public.invoices
      ADD CONSTRAINT invoices_test_number_check
      CHECK (
        (is_test = true  AND number LIKE 'PROVA-%')
        OR
        (is_test = false AND number NOT LIKE 'PROVA-%')
      );
  END IF;
END;
$migracio$;

CREATE INDEX IF NOT EXISTS invoices_is_test_idx ON public.invoices (is_test);
CREATE INDEX IF NOT EXISTS orders_is_test_idx ON public.orders (is_test);

-- ------------------------------------------------------------
-- 2. El comptador de proves
-- ------------------------------------------------------------
-- Taula pròpia, separada de `invoice_series_counters`. Així és impossible que
-- una prova toqui la sèrie fiscal, ni per error de codi.
CREATE TABLE IF NOT EXISTS public.invoice_test_counters (
  year int PRIMARY KEY,
  last_number int NOT NULL DEFAULT 0
);

ALTER TABLE public.invoice_test_counters ENABLE ROW LEVEL SECURITY;
-- Sense cap política: només el servidor (service role) hi arriba.

CREATE OR REPLACE FUNCTION public.next_test_invoice_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_year int := EXTRACT(YEAR FROM now())::int;
  next_number int;
BEGIN
  INSERT INTO public.invoice_test_counters AS counters (year, last_number)
  VALUES (current_year, 1)
  ON CONFLICT (year)
  DO UPDATE SET last_number = counters.last_number + 1
  RETURNING last_number INTO next_number;

  RETURN 'PROVA-' || current_year::text || '-' || LPAD(next_number::text, 6, '0');
END;
$$;

REVOKE EXECUTE ON FUNCTION public.next_test_invoice_number() FROM anon, public, authenticated;
GRANT EXECUTE ON FUNCTION public.next_test_invoice_number() TO service_role;

-- ------------------------------------------------------------
-- 3. La política del client
-- ------------------------------------------------------------
-- El filtre de les proves és EXPLÍCIT, com mana el pla: mai implícit.
-- Un client no ha de veure mai una factura de prova, ni tan sols si el correu
-- de la prova és el seu.
DROP POLICY IF EXISTS "Invoices: select own" ON public.invoices;
CREATE POLICY "Invoices: select own" ON public.invoices
  FOR SELECT USING (
    is_test = false
    AND (
      user_id = auth.uid()
      OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- ------------------------------------------------------------
-- 4. El disparador d'immutabilitat, amb les proves a dins
-- ------------------------------------------------------------
-- Igual que la versió anterior (que mira si algun document referencia la
-- fila), però amb una porta per a les proves: no són documents fiscals i s'han
-- de poder esborrar.
CREATE OR REPLACE FUNCTION public.invoices_immutable()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  id_fila uuid;
  referencia boolean := false;
BEGIN
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;

  id_fila := OLD.id;

  IF id_fila IS NULL THEN
    RETURN NULL;
  END IF;

  -- Una factura de prova no és un document fiscal: es pot esborrar.
  IF TG_OP = 'DELETE' AND OLD.is_test IS TRUE THEN
    RETURN OLD;
  END IF;

  -- Comprovem si algun document la referencia. Es fa amb SQL dinàmic i amb un
  -- EXCEPTION perquè si la taula d'esborranys no existís no volem bloquejar-ho
  -- tot: es bloqueja només el que se sap del cert.
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

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS invoices_no_update ON public.invoices;
CREATE TRIGGER invoices_no_update
  BEFORE UPDATE OR DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.invoices_immutable();

-- ------------------------------------------------------------
-- 5. El mur: una prova no es pot convertir en factura de debò
-- ------------------------------------------------------------
-- Aquesta és la peça important. Els murs de la interfície es poden saltar amb
-- una errada de programació; aquest no.
--
-- Quan un esborrany s'emet, la factura que en surt ha de ser DEL MATEIX TIPUS.
-- Si un esborrany de prova generés una factura real, estaria gastant un número
-- fiscal amb un document que no ho és. I si un esborrany real generés una
-- factura de prova, aquella venda quedaria sense document fiscal.
--
-- Aquest mur es recolza en dos controls: aquest comprova que l'esborrany i la
-- factura són del mateix tipus, i la restricció `invoices_test_number_check`
-- comprova que el número concorda amb la marca.
CREATE OR REPLACE FUNCTION public.invoices_esborrany_coherent()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  es_prova boolean;
BEGIN
  IF NEW.emitted_invoice_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Si la taula de factures no existís, no hi ha res a comprovar.
  BEGIN
    EXECUTE 'SELECT is_test FROM public.invoices WHERE id = $1'
      INTO es_prova USING NEW.emitted_invoice_id;
  EXCEPTION WHEN undefined_table THEN
    RETURN NEW;
  END;

  IF es_prova IS DISTINCT FROM NEW.is_test THEN
    RAISE EXCEPTION
      'Un esborrany de prova només es pot emetre com a factura de prova, i un de real només com a factura real.'
      USING HINT = 'Una factura de prova no pot passar mai a definitiva, ni al revés.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS invoice_drafts_coherencia ON public.invoice_drafts;
CREATE TRIGGER invoice_drafts_coherencia
  BEFORE UPDATE ON public.invoice_drafts
  FOR EACH ROW EXECUTE FUNCTION public.invoices_esborrany_coherent();

-- ------------------------------------------------------------
-- 6. Emetre un esborrany, amb el mode de proves a dins
-- ------------------------------------------------------------
-- Aquesta és la funció que emet els esborranys manuals. La diferència amb la
-- versió anterior és una sola cosa, però decisiva: una prova NO crida mai
-- `next_invoice_number()`. Agafa el número del comptador de proves.
--
-- Aquí és on es guanyava el forat que descriu el pla: el camí manual gastava
-- un número fiscal per a qualsevol esborrany que s'emetés.
CREATE OR REPLACE FUNCTION public.issue_invoice_draft(p_draft_id uuid)
RETURNS public.invoices
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  draft public.invoice_drafts%ROWTYPE;
  issued public.invoices%ROWTYPE;
  invoice_number text;
  invoice_series text;
BEGIN
  SELECT * INTO draft
  FROM public.invoice_drafts
  WHERE id = p_draft_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Esborrany no trobat';
  END IF;
  IF draft.status <> 'draft' THEN
    RAISE EXCEPTION 'Aquest esborrany ja ha estat emès';
  END IF;
  IF NULLIF(TRIM(draft.customer_name), '') IS NULL THEN
    RAISE EXCEPTION 'Falta el nom del client';
  END IF;
  IF jsonb_array_length(draft.items) = 0 THEN
    RAISE EXCEPTION 'La factura ha de tenir almenys una línia';
  END IF;
  IF draft.invoice_type = 'full' AND NULLIF(TRIM(draft.customer_tax_id), '') IS NULL THEN
    RAISE EXCEPTION 'Una factura ordinària necessita el NIF del client';
  END IF;
  IF draft.document_kind = 'rectification' AND (
    draft.rectifies_invoice_id IS NULL OR NULLIF(TRIM(draft.correction_reason), '') IS NULL
  ) THEN
    RAISE EXCEPTION 'La rectificativa necessita la factura original i el motiu';
  END IF;

  invoice_series := CASE
    WHEN draft.document_kind = 'rectification' THEN 'FR'
    WHEN draft.invoice_type = 'full' THEN 'FO'
    ELSE 'FS'
  END;

  -- La línia que ho canvia tot: una prova no toca la sèrie fiscal.
  IF draft.is_test THEN
    invoice_number := public.next_test_invoice_number();
  ELSE
    invoice_number := public.next_invoice_number(invoice_series);
  END IF;

  INSERT INTO public.invoices (
    number, invoice_type, document_kind, rectifies_invoice_id, correction_reason,
    order_number, customer_name, customer_email, customer_tax_id, customer_company,
    customer_address, customer_address2, customer_city, customer_postal_code,
    customer_country, base_products, base_shipping, iva, total, items, source,
    is_test
  ) VALUES (
    invoice_number, draft.invoice_type, draft.document_kind, draft.rectifies_invoice_id,
    draft.correction_reason, draft.order_number, draft.customer_name, draft.customer_email,
    draft.customer_tax_id, draft.customer_company, draft.customer_address,
    draft.customer_address2, draft.customer_city, draft.customer_postal_code,
    draft.customer_country, draft.base_products, draft.base_shipping, draft.iva,
    draft.total, draft.items, 'manual',
    draft.is_test
  )
  RETURNING * INTO issued;

  UPDATE public.invoice_drafts
  SET status = 'issued', emitted_invoice_id = issued.id, updated_at = now()
  WHERE id = draft.id;

  RETURN issued;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.issue_invoice_draft(uuid) FROM anon, public, authenticated;
GRANT EXECUTE ON FUNCTION public.issue_invoice_draft(uuid) TO service_role;

COMMIT;

-- ------------------------------------------------------------
-- Comprovacions
-- ------------------------------------------------------------
-- Han de sortir les tres columnes noves.
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'is_test'
ORDER BY table_name;

-- Ha de sortir el comptador de proves, i els de la sèrie fiscal han de
-- continuar buits.
SELECT 'invoice_test_counters' AS taula, count(*) AS files FROM public.invoice_test_counters
UNION ALL
SELECT 'invoice_series_counters', count(*) FROM public.invoice_series_counters
UNION ALL
SELECT 'invoices', count(*) FROM public.invoices;

-- ############################################################################
-- BLOC 3 de 4: 20260916140000_rectificatives_del_mateix_tipus.sql
-- ############################################################################

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

-- ############################################################################
-- BLOC 4 de 4: 20260916150000_el_mur_tracta_null_com_a_de_debo.sql
-- ############################################################################

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


-- ============================================================
-- FI. Ara comprova-ho:
--
--     npm run verifica:proves
--
-- Si tot surt verd, el mode de proves està instal·lat. Si surt vermell,
-- passa el resultat a qui mantingui el projecte.
-- ============================================================
