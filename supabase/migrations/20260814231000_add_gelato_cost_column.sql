-- Add gelato_cost column to product_variants
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS gelato_cost numeric(10,2) DEFAULT 5.91;

-- Backfill existing variants with default cost
UPDATE product_variants SET gelato_cost = 5.91 WHERE gelato_cost IS NULL;
