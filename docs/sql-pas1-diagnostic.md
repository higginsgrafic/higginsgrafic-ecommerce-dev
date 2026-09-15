# Pas 1 — Diagnòstic i neteja (per enganxar al SQL Editor de Supabase)

**Què és això.** El pas 1, partit en **quatre passos petits i numerats**. Cada
pas és **una execució diferent** al SQL Editor. No els barregis ni n'enganxis
dos alhora: si el bloc conté un error, el SQL Editor desfà **tot el bloc** i es
perden els resultats de les consultes. Ja ha passat dues vegades.

Cada pas diu **què has de veure** si tot va bé. Si el que veus no hi concorda,
atura't i passa-m'ho.

**Per què cal que ho facis tu.** El CLI de Supabase no està autenticat en aquest
entorn, i la clau de servei només arriba a PostgREST: no pot llegir `pg_trigger`
ni `pg_policies`, ni executar SQL lliure.

---

## El que ha passat fins ara (16/09/2026)

Dos intents, tots dos amb el mateix error:

> `P0001: Una factura emesa no es pot modificar ni esborrar.`

**Cap dels dos ha executat res.** El motiu és sempre el mateix: un sol error
desfà el bloc sencer, i per això no has vist mai cap resultat.

I la causa de fons, que és la troballa important:

**El disparador d'immutabilitat no mira la fila.** La funció que hi ha de debò a
la base de dades, sencera (`20260915220000_taula_factures.sql`, línia 67):

```sql
CREATE OR REPLACE FUNCTION public.invoices_immutable()
RETURNS trigger
AS $$
BEGIN
  RAISE EXCEPTION 'Una factura emesa no es pot modificar ni esborrar. Cal una factura rectificativa.';
END;
$$;
```

No mira el número, ni l'origen, ni si és de prova, ni qui la demana. **Qualsevol**
`UPDATE` o `DELETE` sobre `invoices` peta, sempre. La protecció fiscal és
perfecta, però també vol dir que **ningú pot esborrar res d'aquesta taula**, ni
una fila falsa amb imports que no quadren ni el propietari de la base de dades.

Això xoca amb el punt 7 del pla del mode de proves, que diu que una factura de
prova **sí** que s'ha de poder esborrar. Per tant el disparador s'ha de fer més
llest igualment, i el pas 1 i el pas 2 han resultat ser la mateixa feina.

**No és cap falsa alarma:** el disparador hi és i funciona; el que passa és que
fa **més** del que li toca.

---

## Pas A — Diagnòstic (només lectura)

Enganxa això tot sol i executa'l. **No esborra ni modifica res.**

**Què has de veure:**

- `invoices_no_update` i, si tot va bé, també `invoices_validacio_imports`.
- `invoices_immutable` i `invoices_validacio_imports` a la llista de funcions.
  **Si no hi surt `invoices_validacio_imports`, la migració
  `20260915260000` no s'ha executat mai.** Això és important: vol dir que avui
  una factura es podria desar amb imports que no quadren.
- La llista de polítiques que permeten escriure (inserció, modificació,
  esborrat). És l'única pregunta que la nota de la falsa alarma va deixar
  oberta.

```sql
-- ============================================================
-- PAS A — DIAGNÒSTIC (només lectura)
-- ============================================================

-- A1. Els disparadors que hi ha de debò a invoices.
SELECT tgname AS disparador
FROM pg_trigger
WHERE tgrelid = 'public.invoices'::regclass
  AND NOT tgisinternal
ORDER BY tgname;

-- A2. Les funcions de disparador de factures que existeixen.
SELECT p.proname AS funcio
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('invoices_validacio_imports', 'invoices_immutable')
ORDER BY p.proname;

-- A3. TOTES les polítiques que permeten escriure.
--     cmd: a = inserció, w = modificació, d = esborrat.
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND cmd IN ('a', 'w', 'd')
ORDER BY tablename, cmd, policyname;

-- A4. El resum complet de polítiques, per tenir-ho tot al davant.
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- A5. Quines taules de factures hi ha.
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'invoice%'
ORDER BY tablename;

-- A6. La fila falsa hi és? I què diuen els comptadors?
SELECT number, total, base_products, iva, issued_at
FROM public.invoices
ORDER BY issued_at;

SELECT * FROM public.invoice_series_counters;
SELECT * FROM public.invoice_counters;
```

**Passa'm el resultat.** Amb això tanco el diagnòstic.

---

## Pas B — Retirar el disparador i esborrar la fila falsa

**Fes-ho només després de llegir el resultat del pas A.**

Aquest pas fa **només dues coses**: treure el disparador i esborrar la fila
falsa. **No toca la funció**, i per tant no pot fallar pel mateix motiu que
abans.

**Què has de veure:** `DELETE 1`, i a la comprovació `files_invoices` = 0.

> **Nota, i és important:** entre el pas B i el pas C la taula `invoices` queda
> **sense cap protecció d'immutabilitat**. Són uns segons, i et demano que facis
> el pas C tot seguit. No deixis la base de dades així.

```sql
-- ============================================================
-- PAS B — RETIRAR EL DISPARADOR I NETEJAR
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
```

---

## Pas C — Tornar a posar el disparador, més llest

Enganxa'l **de seguida**, després del pas B. Fa una sola cosa: instal·la la
funció nova i torna a crear el disparador.

**La protecció no s'afluixa.** Una factura que formi part d'un circuit
(referenciada per un esborrany o per una rectificativa) continua sent
**intocable**, amb el mateix missatge d'error que abans. L'única cosa que canvia
és que una fila òrfena —com la falsa— ja no queda atrapada per sempre.

**Què has de veure:** `CREATE FUNCTION` i `CREATE TRIGGER`.

```sql
-- ============================================================
-- PAS C — TORNAR A POSAR EL DISPARADOR, MÉS LLEST
--
-- PER QUÈ:
-- la versió vella peta amb QUALSEVOL update o delete, sense mirar la fila.
-- Fins i tot impedeix netejar una fila òrfena que no forma part de cap
-- document. Aquesta versió protegeix exactament el mateix que abans, i una
-- mica més ben mirat:
--
--   * una factura que algun document referencia: INTOCABLE, com sempre
--   * una fila òrfena (sense cap document que la referenciï): es pot esborrar
--
-- NO s'hi fa servir is_test: aquesta columna encara no existeix. S'afegirà
-- quan es faci el mode de proves (pas 2), i aleshores la protecció de les
-- factures de prova quedarà tancada.
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
```

---

## Pas D — Comprovar que la protecció continua encesa (opcional)

Si el fas, ha de donar **error**: és exactament el que volem veure.

```sql
-- ============================================================
-- PAS D — PROVA DE LA PROTECCIÓ (opcional)
-- ============================================================

-- Crea una factura falsa que cap document referencia...
INSERT INTO public.invoices (number, invoice_type, document_kind, source, total, base_products, iva)
VALUES ('ZZZ-PROVA-PROTECCIO', 'simplified', 'invoice', 'manual', 121, 100, 21);

-- ...i mira que no es pugui esborrar. Això HA de donar error:
DELETE FROM public.invoices WHERE number = 'ZZZ-PROVA-PROTECCIO';
```

Si algun dia cal netejar aquesta segona fila, el camí és el pas B.

---

## Pas E — Reinstal·lar la validació d'imports (només si falta)

**No executis això encara.** Depèn del resultat del pas A: si a **A2** no hi
surt `invoices_validacio_imports`, llavors cal, i t'ho confirmaré. El bloc és
sencer al fitxer `supabase/migrations/20260915260000_validacions_dels_imports.sql`,
i és segur de repetir.

---

## Què he de fer jo amb el resultat

- **A1/A2:** si falta `invoices_validacio_imports`, et dic d'executar el pas E.
- **A3/A4:** si alguna política permet escriure on no toca (sobretot a `orders`,
  `staff` o `invoice_series_counters`), és un forat de debò i cal una migració.
- **A5:** si hi ha una taula que no hi hauria de ser, ho arreglo amb una migració.
- **B/C:** un cop la taula sigui buida i el disparador torni a ser-hi, continuo
  amb el mode de proves sense arrossegar la fila falsa.
