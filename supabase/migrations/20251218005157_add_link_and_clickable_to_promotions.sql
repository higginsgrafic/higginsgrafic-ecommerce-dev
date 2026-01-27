/*
  # Add link and clickable fields to promotions_config

  1. Changes
    - Add `link` column (text, nullable) - URL to navigate when banner is clicked
    - Add `clickable` column (boolean, default false) - Controls if the banner is clickable
  
  2. Notes
    - Uses IF NOT EXISTS to prevent errors if columns already exist
    - Default value for clickable is false for safety
    - Link can be null if clickable is false
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'promotions_config' AND column_name = 'link'
  ) THEN
    ALTER TABLE promotions_config ADD COLUMN link text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'promotions_config' AND column_name = 'clickable'
  ) THEN
    ALTER TABLE promotions_config ADD COLUMN clickable boolean DEFAULT false;
  END IF;
END $$;
