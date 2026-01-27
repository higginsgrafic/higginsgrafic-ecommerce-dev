/*
  # Add design column to product_variants

  1. Changes
    - Add `design` column to `product_variants` table to store design/style variations
    - This allows products to have multiple designs (e.g., "Red Gradient", "Blue Gradient", etc.)
    - The column is optional (nullable) as not all products have design variants

  2. Notes
    - Existing data remains unchanged
    - New variants can specify a design option
*/

-- Add design column to product_variants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_variants' AND column_name = 'design'
  ) THEN
    ALTER TABLE product_variants ADD COLUMN design text;
  END IF;
END $$;
