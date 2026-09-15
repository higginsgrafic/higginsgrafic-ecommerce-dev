CREATE TABLE IF NOT EXISTS public.invoice_series_counters (
  series text NOT NULL CHECK (series IN ('FO', 'FS', 'FR')),
  year int NOT NULL,
  last_number int NOT NULL DEFAULT 0,
  PRIMARY KEY (series, year)
);

CREATE OR REPLACE FUNCTION public.next_invoice_number(p_series text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_year int := EXTRACT(YEAR FROM now())::int;
  next_number int;
  normalized_series text := UPPER(TRIM(p_series));
BEGIN
  IF normalized_series NOT IN ('FO', 'FS', 'FR') THEN
    RAISE EXCEPTION 'Sèrie de factura no vàlida';
  END IF;

  INSERT INTO public.invoice_series_counters AS counters (series, year, last_number)
  VALUES (normalized_series, current_year, 1)
  ON CONFLICT (series, year)
  DO UPDATE SET last_number = counters.last_number + 1
  RETURNING last_number INTO next_number;

  RETURN normalized_series || '-' || current_year::text || '-' || LPAD(next_number::text, 6, '0');
END;
$$;

REVOKE EXECUTE ON FUNCTION public.next_invoice_number(text) FROM anon, public, authenticated;
GRANT EXECUTE ON FUNCTION public.next_invoice_number(text) TO service_role;
REVOKE EXECUTE ON FUNCTION public.next_invoice_number() FROM anon, public, authenticated, service_role;

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS document_kind text NOT NULL DEFAULT 'invoice',
  ADD COLUMN IF NOT EXISTS rectifies_invoice_id uuid REFERENCES public.invoices(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS correction_reason text,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'order';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'invoices_document_kind_check'
      AND conrelid = 'public.invoices'::regclass
  ) THEN
    ALTER TABLE public.invoices
      ADD CONSTRAINT invoices_document_kind_check
      CHECK (document_kind IN ('invoice', 'rectification'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'invoices_source_check'
      AND conrelid = 'public.invoices'::regclass
  ) THEN
    ALTER TABLE public.invoices
      ADD CONSTRAINT invoices_source_check
      CHECK (source IN ('order', 'manual'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'invoices_rectification_check'
      AND conrelid = 'public.invoices'::regclass
  ) THEN
    ALTER TABLE public.invoices
      ADD CONSTRAINT invoices_rectification_check
      CHECK (
        document_kind = 'invoice'
        OR (rectifies_invoice_id IS NOT NULL AND NULLIF(TRIM(correction_reason), '') IS NOT NULL)
      );
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS invoices_rectifies_idx ON public.invoices (rectifies_invoice_id);

CREATE TABLE IF NOT EXISTS public.invoice_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_type text NOT NULL CHECK (invoice_type IN ('full', 'simplified')),
  document_kind text NOT NULL DEFAULT 'invoice' CHECK (document_kind IN ('invoice', 'rectification')),
  rectifies_invoice_id uuid REFERENCES public.invoices(id) ON DELETE RESTRICT,
  correction_reason text,
  order_number text,
  customer_name text,
  customer_email text,
  customer_tax_id text,
  customer_company text,
  customer_address text,
  customer_address2 text,
  customer_city text,
  customer_postal_code text,
  customer_country text,
  base_products numeric(10,2) NOT NULL DEFAULT 0,
  base_shipping numeric(10,2) NOT NULL DEFAULT 0,
  shipping_total numeric(10,2) NOT NULL DEFAULT 0,
  iva numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued')),
  emitted_invoice_id uuid REFERENCES public.invoices(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invoice_drafts_status_idx ON public.invoice_drafts (status, updated_at DESC);
ALTER TABLE public.invoice_drafts ENABLE ROW LEVEL SECURITY;

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
  invoice_number := public.next_invoice_number(invoice_series);

  INSERT INTO public.invoices (
    number, invoice_type, document_kind, rectifies_invoice_id, correction_reason,
    order_number, customer_name, customer_email, customer_tax_id, customer_company,
    customer_address, customer_address2, customer_city, customer_postal_code,
    customer_country, base_products, base_shipping, iva, total, items, source
  ) VALUES (
    invoice_number, draft.invoice_type, draft.document_kind, draft.rectifies_invoice_id,
    draft.correction_reason, draft.order_number, draft.customer_name, draft.customer_email,
    draft.customer_tax_id, draft.customer_company, draft.customer_address,
    draft.customer_address2, draft.customer_city, draft.customer_postal_code,
    draft.customer_country, draft.base_products, draft.base_shipping, draft.iva,
    draft.total, draft.items, 'manual'
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

SELECT series, year, last_number
FROM public.invoice_series_counters
ORDER BY year DESC, series;
