-- ============================================================
-- PREFLIGHT CHECK: Run this BEFORE applying any migration
-- ============================================================
-- This script reports whether each required table, column, policy,
-- function, and constraint already exists in the database.
-- It is READ-ONLY — does not modify anything.
--
-- Run this in the Supabase Dashboard SQL Editor.
-- Review the output before applying migrations.
-- ============================================================

-- ============================================================
-- Migration 1: 20260826100000_authorization_model_and_rls_fix.sql
-- ============================================================

-- Table: staff
SELECT 'table:staff' AS object, EXISTS (
  SELECT 1 FROM information_schema.tables WHERE table_name = 'staff' AND table_schema = 'public'
) AS exists;

-- Function: is_admin()
SELECT 'function:is_admin' AS object, EXISTS (
  SELECT 1 FROM information_schema.routines
  WHERE routine_name = 'is_admin' AND routine_schema = 'public'
) AS exists;

-- RLS on staff
SELECT 'rls:staff' AS object, (
  SELECT relrowsecurity FROM pg_class WHERE relname = 'staff' AND relnamespace = 'public'::regnamespace
) AS enabled;

-- Policy: staff select own
SELECT 'policy:staff_select_own' AS object, EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'staff' AND policyname = 'Staff can read own row'
) AS exists;

-- Policy: staff service role manage
SELECT 'policy:staff_service_role_manage' AS object, EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'staff' AND policyname = 'Service role can manage staff'
) AS exists;

-- Corrective RLS on products
SELECT 'policy:products_admin_write' AS object, EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname LIKE '%admin%write%'
) AS exists;

-- Corrective RLS on product_variants
SELECT 'policy:variants_admin_write' AS object, EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'product_variants' AND policyname LIKE '%admin%write%'
) AS exists;

-- Corrective RLS on orders
SELECT 'policy:orders_service_role' AS object, EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname LIKE '%service_role%'
) AS exists;

-- Corrective RLS on messages
SELECT 'policy:messages_service_role' AS object, EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname LIKE '%service_role%'
) AS exists;

-- ============================================================
-- Migration 2: 20260826110000_orders_state_machine.sql
-- ============================================================

-- Table: processed_stripe_events
SELECT 'table:processed_stripe_events' AS object, EXISTS (
  SELECT 1 FROM information_schema.tables WHERE table_name = 'processed_stripe_events' AND table_schema = 'public'
) AS exists;

-- Column: orders.idempotency_key
SELECT 'column:orders.idempotency_key' AS object, EXISTS (
  SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'idempotency_key'
) AS exists;

-- Column: orders.tracking_token_hash
SELECT 'column:orders.tracking_token_hash' AS object, EXISTS (
  SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'tracking_token_hash'
) AS exists;

-- Column: orders.tracking_token_expires_at
SELECT 'column:orders.tracking_token_expires_at' AS object, EXISTS (
  SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'tracking_token_expires_at'
) AS exists;

-- Constraint: orders_payment_intent_id_unique
SELECT 'constraint:orders_payment_intent_id_unique' AS object, EXISTS (
  SELECT 1 FROM pg_constraint WHERE conname = 'orders_payment_intent_id_unique'
) AS exists;

-- Constraint: orders_idempotency_key_unique
SELECT 'constraint:orders_idempotency_key_unique' AS object, EXISTS (
  SELECT 1 FROM pg_constraint WHERE conname = 'orders_idempotency_key_unique'
) AS exists;

-- Index: idx_orders_tracking_token_hash
SELECT 'index:idx_orders_tracking_token_hash' AS object, EXISTS (
  SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_tracking_token_hash'
) AS exists;

-- Table: order_events
SELECT 'table:order_events' AS object, EXISTS (
  SELECT 1 FROM information_schema.tables WHERE table_name = 'order_events' AND table_schema = 'public'
) AS exists;

-- Trigger: trigger_log_order_status_change
SELECT 'trigger:log_order_status_change' AS object, EXISTS (
  SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_log_order_status_change'
) AS exists;

-- Function: log_order_status_change()
SELECT 'function:log_order_status_change' AS object, EXISTS (
  SELECT 1 FROM information_schema.routines WHERE routine_name = 'log_order_status_change' AND routine_schema = 'public'
) AS exists;

-- Table: rate_limit_log
SELECT 'table:rate_limit_log' AS object, EXISTS (
  SELECT 1 FROM information_schema.tables WHERE table_name = 'rate_limit_log' AND table_schema = 'public'
) AS exists;

-- Function: check_rate_limit()
SELECT 'function:check_rate_limit' AS object, EXISTS (
  SELECT 1 FROM information_schema.routines WHERE routine_name = 'check_rate_limit' AND routine_schema = 'public'
) AS exists;

-- Function: generate_tracking_token()
SELECT 'function:generate_tracking_token' AS object, EXISTS (
  SELECT 1 FROM information_schema.routines WHERE routine_name = 'generate_tracking_token' AND routine_schema = 'public'
) AS exists;

-- RLS on processed_stripe_events
SELECT 'rls:processed_stripe_events' AS object, (
  SELECT relrowsecurity FROM pg_class WHERE relname = 'processed_stripe_events' AND relnamespace = 'public'::regnamespace
) AS enabled;

-- RLS on order_events
SELECT 'rls:order_events' AS object, (
  SELECT relrowsecurity FROM pg_class WHERE relname = 'order_events' AND relnamespace = 'public'::regnamespace
) AS enabled;

-- RLS on rate_limit_log
SELECT 'rls:rate_limit_log' AS object, (
  SELECT relrowsecurity FROM pg_class WHERE relname = 'rate_limit_log' AND relnamespace = 'public'::regnamespace
) AS enabled;

-- ============================================================
-- SUMMARY: Count of missing objects
-- ============================================================
SELECT
  (SELECT count(*) FROM information_schema.tables WHERE table_name = 'staff' AND table_schema = 'public') +
  (SELECT count(*) FROM information_schema.routines WHERE routine_name = 'is_admin' AND routine_schema = 'public') +
  (SELECT count(*) FROM information_schema.tables WHERE table_name = 'processed_stripe_events' AND table_schema = 'public') +
  (SELECT count(*) FROM information_schema.tables WHERE table_name = 'order_events' AND table_schema = 'public') +
  (SELECT count(*) FROM information_schema.tables WHERE table_name = 'rate_limit_log' AND table_schema = 'public') +
  (SELECT count(*) FROM information_schema.routines WHERE routine_name = 'check_rate_limit' AND routine_schema = 'public') +
  (SELECT count(*) FROM information_schema.routines WHERE routine_name = 'generate_tracking_token' AND routine_schema = 'public') +
  (SELECT count(*) FROM information_schema.routines WHERE routine_name = 'log_order_status_change' AND routine_schema = 'public')
  AS total_existing_key_objects;
