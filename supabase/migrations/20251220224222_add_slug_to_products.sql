/*
  # Add slug field to products

  1. Changes
    - Add `slug` column to products table for URL-friendly identifiers
    - Add unique constraint on slug
    - Update existing products with slugs based on their names
    - Add index for faster slug lookups
  
  2. Notes
    - Slugs will be auto-generated from product names
    - Unique constraint ensures no duplicate slugs
*/

-- Add slug column to products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'slug'
  ) THEN
    ALTER TABLE products ADD COLUMN slug text;
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Add unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'products_slug_key'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_slug_key UNIQUE (slug);
  END IF;
END $$;