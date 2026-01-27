/*
  # Add image field to products table

  1. Changes
    - Add `image` column to `products` table to store product image URLs
    - Set default empty string for existing products
    
  2. Notes
    - Images will be updated separately after this migration
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'image'
  ) THEN
    ALTER TABLE products ADD COLUMN image text DEFAULT '';
  END IF;
END $$;