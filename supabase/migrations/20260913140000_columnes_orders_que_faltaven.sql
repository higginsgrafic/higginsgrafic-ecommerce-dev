-- ============================================================
-- Columnes de la taula `orders` que faltaven a la base de dades
-- ============================================================
--
-- PER QUÈ CAL
--
-- Aquestes cinc columnes estan definides des del principi a
-- `001_orders_schema.sql`, però mai no es van arribar a crear a la base de
-- dades de producció. El resultat era molt greu i difícil de veure:
--
--   1. La funció `stripe-webhook` actualitza l'estat de la comanda quan Stripe
--      confirma el pagament. Aquesta actualització dispara el disparador
--      `trigger_log_order_status_change` (creat per la migració
--      `20260826110000_orders_state_machine.sql`), que fa servir
--      `NEW.gelato_order_id`.
--   2. Com que la columna no existia, l'actualització fallava SEMPRE amb
--      "record new has no field gelato_order_id".
--   3. Conseqüència: el client pagava, la comanda es creava... i es quedava
--      'pendent' per sempre. No s'enviava el correu de confirmació i no
--      s'arribava a enviar mai res a Gelato.
--
-- També faltaven les columnes de seguiment, que fan servir l'avís de Gelato i
-- la pàgina de seguiment del client.
--
-- Com executar-ho: Supabase → SQL Editor → enganxar això → Run.
-- És segur repetir-ho: tot són `IF NOT EXISTS`.

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS gelato_order_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_carrier text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_url text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS estimated_delivery date;

-- Comprovació: ha de tornar 5 files.
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'orders'
  AND column_name IN ('gelato_order_id', 'tracking_number', 'tracking_carrier', 'tracking_url', 'estimated_delivery')
ORDER BY column_name;
