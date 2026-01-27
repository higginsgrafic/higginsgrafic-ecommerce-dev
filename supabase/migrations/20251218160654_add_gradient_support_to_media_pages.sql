/*
  # Add Gradient Support to Media Pages

  1. Changes
    - Add `gradient_stops` column to store multiple gradient color stops as JSON
    - Add `gradient_angle` column to store the angle/direction of the gradient
    - The gradient_stops will be an array of objects: [{color: "#000000", position: 0}, {color: "#ffffff", position: 100}]
  
  2. Notes
    - Backward compatible: existing pages will continue using `background_color` for solid colors
    - When `gradient_stops` is null or empty, use `background_color` as solid color
    - When `gradient_stops` has values, use it to create a gradient
*/

DO $$
BEGIN
  -- Add gradient_stops column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_pages' AND column_name = 'gradient_stops'
  ) THEN
    ALTER TABLE media_pages ADD COLUMN gradient_stops jsonb DEFAULT NULL;
  END IF;

  -- Add gradient_angle column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_pages' AND column_name = 'gradient_angle'
  ) THEN
    ALTER TABLE media_pages ADD COLUMN gradient_angle integer DEFAULT 180;
  END IF;
END $$;