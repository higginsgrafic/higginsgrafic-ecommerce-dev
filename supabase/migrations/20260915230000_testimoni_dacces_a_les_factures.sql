-- ============================================================
-- Testimoni d'accés a les factures
-- ============================================================
--
-- PER QUÈ CAL
--
-- El client rep la factura per correu i l'ha de poder obrir sense haver
-- d'entrar a la seva compte. Per això cada factura té un testimoni aleatori
-- que va a l'enllaç: qui el té, veu la factura; qui no, no la troba.
--
-- És el mateix sistema que fan servir Stripe o Amazon amb els enllaços de les
-- factures. Es pot revocar posant-hi un valor nou.
--
-- Com executar-ho: Supabase → SQL Editor → enganxar això → Run.
-- És segur repetir-ho.

ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS access_token uuid NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS invoices_access_token_idx ON public.invoices (access_token);

-- Comprovació: ha de tornar 1 fila.
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'access_token';
