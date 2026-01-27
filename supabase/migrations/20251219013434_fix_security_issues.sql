/*
  # Fix Security Issues

  1. Indexes
    - Drop unused indexes: `idx_products_category`, `idx_products_active`, `idx_hero_config_active`
    - Keep only actively used indexes for better performance

  2. Function Security
    - Fix `update_updated_at_column` function to have immutable search_path
    - Set explicit search_path to prevent security vulnerabilities

  Note: Auth DB Connection Strategy must be configured in Supabase Dashboard
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_products_category;
DROP INDEX IF EXISTS idx_products_active;
DROP INDEX IF EXISTS idx_hero_config_active;

-- Fix the update_updated_at_column function with secure search_path
-- First drop all existing versions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Recreate with secure configuration
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Recreate triggers that use this function
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
CREATE TRIGGER update_product_variants_updated_at
    BEFORE UPDATE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
