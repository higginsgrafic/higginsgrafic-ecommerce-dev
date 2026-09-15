-- ============================================================
-- Columnes de facturació a la taula `orders`
-- ============================================================
--
-- PER QUÈ CAL
--
-- Quan un client marca "Necessites factura?" al checkout i omple l'empresa i el
-- CIF, aquestes dues dades s'enviaven només a les metadades del pagament de
-- Stripe. La taula `orders` no tenia columnes per a això, de manera que el
-- generador de factures —que llegeix la comanda— no podia saber:
--
--   1. Si el títol del document ha de dir "FACTURA" o "FACTURA SIMPLIFICADA".
--   2. Quin CIF hi ha de sortir.
--
-- Amb aquestes dues columnes el generador ho té tot en un sol lloc i no ha de
-- consultar dues fonts (la base de dades i Stripe).
--
-- Com executar-ho: Supabase → SQL Editor → enganxar això → Run.
-- És segur repetir-ho: tot són `IF NOT EXISTS`.

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS invoice_company text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS invoice_tax_id text;

-- Comprovació: ha de tornar 2 files.
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'orders'
  AND column_name IN ('invoice_company', 'invoice_tax_id')
ORDER BY column_name;
