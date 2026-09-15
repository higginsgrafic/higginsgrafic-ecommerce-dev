# Pas 1 — Diagnòstic i neteja (per enganxar al SQL Editor de Supabase)

**Què és això.** El bloc de SQL del pas 1, en **tres trossos separats**. És
important que siguin **tres execucions diferents**, no una de sola: si s'executa
tot junt i l'última part peta, el SQL Editor desfà **tot el bloc** i es perden
els resultats de les consultes. Ja ha passat exactament això.

**Per què cal.** El CLI de Supabase no està autenticat en aquest entorn, i la
clau de servei només arriba a PostgREST (no pot llegir `pg_trigger` ni
`pg_policies`, ni executar SQL lliure). Sense això, no es pot afirmar res sobre
els disparadors ni sobre les polítiques d'escriptura.

---

## El que ha passat (16/09/2026)

El primer intent va donar aquest error:

> `P0001: Una factura emesa no es pot modificar ni esborrar.`

**No s'ha executat res**: ni la neteja, ni les consultes. Tot el bloc va anar
dins d'una sola transacció, i l'error de la neteja el va desfer sencer.

I la causa val la pena entendre-la, perquè és una troballa:

**El disparador d'immutabilitat no distingeix cap fila de cap altra.** La funció
que hi ha de debò a la base de dades és així, sencera
(`20260915220000_taula_factures.sql`, línia 67):

```sql
CREATE OR REPLACE FUNCTION public.invoices_immutable()
RETURNS trigger
AS $$
BEGIN
  RAISE EXCEPTION 'Una factura emesa no es pot modificar ni esborrar. Cal una factura rectificativa.';
END;
$$;
```

No mira el número, ni l'origen, ni qui la demana, ni si és de prova. **Qualsevol**
`UPDATE` o `DELETE` sobre `invoices` peta, sempre. La protecció fiscal és
perfecta, però també vol dir que **ningú —ni tu, ni jo, ni el propietari de la
base de dades— pot esborrar res d'aquesta taula**, ni una fila falsa amb imports
que no quadren.

Això xoca de ple amb el punt 7 del pla del mode de proves, que diu que una
factura de prova **sí** que s'ha de poder esborrar. Per tant, el disparador s'ha
de fer més llest igualment. Aprofit-ho ara és el camí més curt i el més net.

**Nota important:** aquesta vegada no és cap falsa alarma. El disparador hi és i
funciona; el que passa és que fa **més** del que li toca.

---

## Tros 1 — Diagnòstic (només lectura)

Enganxa això **tot sol** i executa'l. No esborra ni modifica res.

```sql
-- ============================================================
-- PAS 1 / TROS 1 — DIAGNÒSTIC (només lectura)
-- ============================================================

-- 1a. Els disparadors que hi ha de debò a invoices.
--     Han de sortir DOS: invoices_no_update i invoices_validacio_imports.
SELECT tgname AS disparador
FROM pg_trigger
WHERE tgrelid = 'public.invoices'::regclass
  AND NOT tgisinternal
ORDER BY tgname;

-- 1b. Les funcions de disparador de factures que existeixen.
--     Si no hi surt invoices_validacio_imports, la migració
--     20260915260000 no s'ha executat mai.
SELECT p.proname AS funcio
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('invoices_validacio_imports', 'invoices_immutable')
ORDER BY p.proname;

-- 2. TOTES les polítiques que permeten escriure.
--    cmd: a = inserció, w = modificació, d = esborrat.
--    És la pregunta que la nota de la falsa alarma va deixar oberta.
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND cmd IN ('a', 'w', 'd')
ORDER BY tablename, cmd, policyname;

-- 2b. El resum complet de polítiques, per tenir-ho tot al davant.
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- 3. Quines taules de factures hi ha.
--    Han de sortir: invoices, invoice_drafts, invoice_series_counters
--    i invoice_counters (aquesta darrera és la vella, sense ús).
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'invoice%'
ORDER BY tablename;

-- 4. La fila falsa hi és? I què diuen els comptadors?
SELECT number, total, base_products, iva, issued_at
FROM public.invoices
ORDER BY issued_at;

SELECT * FROM public.invoice_series_counters;
SELECT * FROM public.invoice_counters;
```

**Passa'm el resultat dels quatre blocs.** Amb això tanco el diagnòstic.

---

## Tros 2 — Neteja de la fila falsa

Enganxa això **després d'haver llegit el diagnòstic**, com a segona execució.

Fa tres coses, en aquest ordre:

1. Substitueix la funció d'immutabilitat per una que **mira la fila** abans de
   bloquejar: protegeix igual que abans tota factura que formi part d'un
   circuit (referenciada per un esborrany o per una rectificativa), i deixa
   passar les files òrfenes.
2. Esborra la fila falsa `ZZZ-PROVA-NO-QUADRA` amb un filtre estret.
3. Torna a deixar el disparador dempeus i ho comprova.

**No afluixa res del que importa.** La regla de la constitució —una factura
emesa no es toca mai— queda intacta, amb el mateix missatge d'error.

**Per què no hi surt `is_test`.** La columna encara no existeix, i
referenciar-la aquí faria petar el bloc exactament igual que el primer intent.
El `is_test` és del pas 2 (mode de proves); s'hi afegirà quan la columna hi
sigui, i aleshores la protecció de les factures de prova quedarà tancada.

```sql
-- ============================================================
-- PAS 1 / TROS 2 — NETEJA
--
-- PER QUÈ CAL TOCAR EL DISPARADOR:
-- la versió vella peta amb QUALSEVOL update o delete, sense mirar la fila.
-- Fins i tot impedeix netejar una fila òrfena que no forma part de cap
-- document. Aquesta versió protegeix exactament el mateix que abans, i una
-- mica més ben mirat:
--
--   * una factura que algun document referencia: INTOCABLE, com sempre
--   * una fila òrfena (sense cap document que la referenciï): es pot
--     esborrar. És el cas de la fila falsa ZZZ-.
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

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- El disparador es torna a crear amb la funció nova, que mira la fila.
-- No cal cap condició WHEN: la funció decideix tota sola què fer.
DROP TRIGGER IF EXISTS invoices_no_update ON public.invoices;
CREATE TRIGGER invoices_no_update
  BEFORE UPDATE OR DELETE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.invoices_immutable();

-- Filtre estret: si la fila no és exactament aquesta, no s'esborra res.
DELETE FROM public.invoices
WHERE number = 'ZZZ-PROVA-NO-QUADRA'
  AND total = 1
  AND base_products = 100
  AND iva = 21
  AND order_id IS NULL;

-- Comprovacions: la taula ha de quedar buida i els comptadors també.
SELECT count(*) AS files_invoices FROM public.invoices;
SELECT * FROM public.invoice_series_counters;
SELECT * FROM public.invoice_counters;
```

**Com provar que la protecció continua funcionant** (opcional; si el fas,
executa'l com una tercera cosa, a part). Crea una factura falsa i mira que no
es pugui esborrar:

```sql
-- Crea una factura falsa sense cap document que la referenciï...
INSERT INTO public.invoices (number, invoice_type, document_kind, source, total, base_products, iva)
VALUES ('ZZZ-PROVA-PROTECCIO', 'simplified', 'invoice', 'manual', 121, 100, 21);

-- ...i mira que el disparador la protegeix. Això HA de donar error:
DELETE FROM public.invoices WHERE number = 'ZZZ-PROVA-PROTECCIO';
```

Si algun dia cal netejar aquesta segona fila falsa, el camí és el mateix que el
d'aquest tros 2.

---

## Tros 3 — Reinstal·lar la validació d'imports (només si falta)

**No executis això encara.** Depèn del resultat del tros 1: si a la consulta 1a
no hi surt `invoices_validacio_imports`, llavors cal. Espera que t'ho confirmi.

```sql
-- Només si la consulta 1a no ha mostrat invoices_validacio_imports.
-- El fitxer és supabase/migrations/20260915260000_validacions_dels_imports.sql
-- i és segur de repetir.
```

---

## Què he de fer jo amb el resultat

- **1a:** si falta `invoices_validacio_imports`, et dic d'executar el tros 3.
- **2:** si alguna política permet escriure on no toca (sobretot a `orders`,
  `staff` o `invoice_series_counters`), és un forat de debò i cal una migració.
- **3:** si hi ha una taula que no hi hauria de ser, ho arreglo amb una migració.
- **4:** un cop la taula sigui buida, continuo amb el mode de proves sense
  arrossegar la fila falsa.
