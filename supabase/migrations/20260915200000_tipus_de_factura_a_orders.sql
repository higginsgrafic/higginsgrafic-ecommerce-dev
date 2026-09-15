-- ============================================================
-- Tipus de factura a la taula `orders`
-- ============================================================
--
-- PER QUÈ CAL
--
-- Fins ara, el tipus de factura s'havia de DEDUIR: si la comanda tenia CIF,
-- era una factura normal; si no en tenia, una de simplificada. Funciona, però
-- és endevinar, i no permet representar casos que la llei sí que contempla
-- (per exemple, una factura simplificada que tot i així porta les dades del
-- client).
--
-- Amb aquesta columna cada comanda diu EXPLÍCITAMENT quin document li toca:
--
--   'simplified'  el client no ha demanat factura (el cas normal)
--   'full'        el client ha demanat factura i ha donat el CIF
--
-- Així el generador de factures no ha de deduir res: llegeix aquest camp.
--
-- Com executar-ho: Supabase → SQL Editor → enganxar això → Run.
-- És segur repetir-ho: tot són `IF NOT EXISTS`.

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS invoice_type text;

-- Comprovació: ha de tornar 1 fila.
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'orders'
  AND column_name = 'invoice_type';
