/*
  # Add images field to gelato_blank_products

  Afegir camp per guardar URLs d'imatges descarregades dels productes en blanc.

  1. Changes
    - Afegir camp `stored_images` (jsonb) per guardar array d'imatges amb tipus i URL
*/

-- Add stored_images field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gelato_blank_products' AND column_name = 'stored_images'
  ) THEN
    ALTER TABLE gelato_blank_products 
    ADD COLUMN stored_images jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
