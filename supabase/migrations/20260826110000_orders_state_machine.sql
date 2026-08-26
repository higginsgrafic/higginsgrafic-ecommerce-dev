-- ============================================================
-- Orders State Machine, Idempotency, Tracking Tokens, Rate Limiting
-- ============================================================
-- This migration is additive only:
--   1. Adds `processed_stripe_events` table for webhook idempotency
--   2. Adds `idempotency_key` column to orders
--   3. Adds `tracking_token` column to orders (high-entropy, expiring)
--   4. Adds `tracking_token_expires_at` column to orders
--   5. Adds `order_events` table for audit trail
--   6. Adds unique constraint on payment_intent_id (one order per PI)
--   7. Adds `rate_limit_log` table for durable rate limiting
--   8. Creates trigger to log order status changes into order_events
--
-- Forward-only. Does not drop or modify existing columns.
-- ============================================================

-- ============================================================
-- 1. processed_stripe_events — webhook idempotency
-- ============================================================

CREATE TABLE IF NOT EXISTS public.processed_stripe_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  payment_intent_id text,
  processed_at timestamptz NOT NULL DEFAULT now(),
  result jsonb,
  error text
);

ALTER TABLE public.processed_stripe_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage stripe events"
  ON public.processed_stripe_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 2. Orders — add columns for idempotency and tracking
-- ============================================================

-- idempotency_key: used by Netlify functions to deduplicate order creation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'idempotency_key'
  ) THEN
    ALTER TABLE orders ADD COLUMN idempotency_key text;
  END IF;
END $$;

-- tracking_token: high-entropy token for guest order tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'tracking_token'
  ) THEN
    ALTER TABLE orders ADD COLUMN tracking_token text;
  END IF;
END $$;

-- tracking_token_expires_at: when the tracking token expires
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'tracking_token_expires_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN tracking_token_expires_at timestamptz;
  END IF;
END $$;

-- Unique constraint on payment_intent_id (one order per PaymentIntent)
-- Only enforce for non-null values (NULL payment_intent_id = pre-payment order)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_payment_intent_id_unique'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_payment_intent_id_unique UNIQUE (payment_intent_id);
  END IF;
END $$;

-- Unique constraint on idempotency_key
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_idempotency_key_unique'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_idempotency_key_unique UNIQUE (idempotency_key);
  END IF;
END $$;

-- Index for tracking_token lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_token
  ON orders (tracking_token)
  WHERE tracking_token IS NOT NULL;

-- ============================================================
-- 3. order_events — audit trail for status changes
-- ============================================================

CREATE TABLE IF NOT EXISTS public.order_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  previous_status text,
  new_status text NOT NULL,
  event_type text NOT NULL DEFAULT 'status_change',
  metadata jsonb,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

-- Users can read events for their own orders
CREATE POLICY "Users can read own order events"
  ON order_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_events.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- Service role can read and write all order events
CREATE POLICY "Service role can manage order events"
  ON order_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_order_events_order_id
  ON order_events (order_id, created_at DESC);

-- ============================================================
-- 4. Trigger: log order status changes to order_events
-- ============================================================

CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.order_events (order_id, previous_status, new_status, event_type, metadata)
    VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      'status_change',
      jsonb_build_object(
        'changed_at', now(),
        'gelato_order_id', NEW.gelato_order_id,
        'tracking_number', NEW.tracking_number
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_log_order_status_change ON orders;
CREATE TRIGGER trigger_log_order_status_change
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION public.log_order_status_change();

-- ============================================================
-- 5. rate_limit_log — durable rate limiting via Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text NOT NULL,
  identifier text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb
);

ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Service role can read and write (Netlify functions use service_role)
CREATE POLICY "Service role can manage rate limit log"
  ON rate_limit_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Anyone can insert (rate limiter needs to log attempts without auth)
CREATE POLICY "Anyone can insert rate limit log"
  ON rate_limit_log FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Index for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_rate_limit_lookup
  ON rate_limit_log (bucket, identifier, created_at DESC);

-- ============================================================
-- 6. Function: generate_tracking_token
-- ============================================================

-- Generates a URL-safe random tracking token
CREATE OR REPLACE FUNCTION public.generate_tracking_token()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT encode(gen_random_bytes(32), 'hex')
$$;

-- ============================================================
-- 7. Function: check_rate_limit
-- ============================================================
-- Called by Netlify functions via service-role client.
-- Returns true if the request is within the limit, false if exceeded.
-- Parameters:
--   p_bucket: e.g. 'payment_intent', 'order_tracking', 'contact_form', 'auth', 'upload'
--   p_identifier: IP address or user ID
--   p_max_count: maximum allowed requests
--   p_window_seconds: time window in seconds

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_bucket text,
  p_identifier text,
  p_max_count integer DEFAULT 10,
  p_window_seconds integer DEFAULT 60
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT (
    SELECT COUNT(*)::integer
    FROM public.rate_limit_log
    WHERE bucket = p_bucket
      AND identifier = p_identifier
      AND created_at > now() - (p_window_seconds || ' seconds')::interval
  ) < p_max_count
$$;
