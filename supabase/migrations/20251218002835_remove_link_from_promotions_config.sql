/*
  # Remove link field from promotions_config

  ## Changes
  - Remove the `link` column from `promotions_config` table as it's no longer needed
  
  ## Notes
  - The banner will no longer be clickable
  - Existing data in the link column will be lost
*/

-- Remove the link column
ALTER TABLE promotions_config DROP COLUMN IF EXISTS link;
