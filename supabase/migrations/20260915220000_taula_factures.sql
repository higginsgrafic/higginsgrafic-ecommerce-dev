-- ============================================================
-- Taula `invoices`: les factures emeses
-- ============================================================
--
-- PER QUÈ CAL
--
-- Cada venda ha de quedar documentada amb una factura numerada, i la factura
-- no pot canviar mai un cop emesa: si cal corregir-la, es fa una factura
-- rectificativa nova. Per això aquí no es desen referències a la comanda, sinó
-- una COPIA (instantània) de tot el que surt al document: el client, les línies
-- i els imports. Si demà canvia l'adreça del client o el preu d'un producte,
-- la factura d'ahir continua dient el mateix.
--
-- El número ve de `next_invoice_number()` i és correlatiu, sense forats.
--
-- Com executar-ho: Supabase → SQL Editor → enganxar això → Run.
-- És segur repetir-ho.

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Número correlatiu (2026-000001) i tipus de document.
  number text NOT NULL UNIQUE,
  invoice_type text NOT NULL CHECK (invoice_type IN ('full', 'simplified')),

  -- D'on surt. ON DELETE RESTRICT: mentre hi hagi una factura, la comanda no
  -- es pot esborrar.
  order_id uuid REFERENCES public.orders(id) ON DELETE RESTRICT,
  order_number text,
  user_id uuid,

  issued_at timestamptz NOT NULL DEFAULT now(),

  -- Instantània del client.
  customer_name text,
  customer_email text,
  customer_tax_id text,
  customer_company text,
  customer_address text,
  customer_address2 text,
  customer_city text,
  customer_postal_code text,
  customer_country text,

  -- Instantània dels imports.
  base_products numeric(10,2) NOT NULL DEFAULT 0,
  base_shipping numeric(10,2) NOT NULL DEFAULT 0,
  iva numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,

  -- Instantània de les línies.
  items jsonb NOT NULL DEFAULT '[]'::jsonb,

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invoices_issued_at_idx ON public.invoices (issued_at DESC);
CREATE INDEX IF NOT EXISTS invoices_type_idx ON public.invoices (invoice_type);
CREATE INDEX IF NOT EXISTS invoices_order_idx ON public.invoices (order_id);
CREATE INDEX IF NOT EXISTS invoices_email_idx ON public.invoices (customer_email);

-- ------------------------------------------------------------
-- Una factura no es pot modificar ni esborrar
-- ------------------------------------------------------------
-- Si mai s'ha de corregir, es fa una rectificativa (una factura nova). Així
-- el document original es conserva tal com es va emetre.
CREATE OR REPLACE FUNCTION public.invoices_immutable()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Una factura emesa no es pot modificar ni esborrar. Cal una factura rectificativa.';
END;
$$;

DROP TRIGGER IF EXISTS invoices_no_update ON public.invoices;
CREATE TRIGGER invoices_no_update
  BEFORE UPDATE OR DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.invoices_immutable();

-- ------------------------------------------------------------
-- Qui pot veure les factures
-- ------------------------------------------------------------
-- El client veu les seves; el servidor (service role) ho veu tot i és l'únic
-- que en pot crear.
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Invoices: select own" ON public.invoices;
CREATE POLICY "Invoices: select own" ON public.invoices
  FOR SELECT USING (
    user_id = auth.uid()
    OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Comprovació: ha de tornar 1 fila.
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'invoices';
