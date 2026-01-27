/*
  # Add global redirect field to media_pages

  1. Changes
    - Add `global_redirect` boolean field to control if visitors should be redirected to this page
    - Defaults to false for safety
  
  2. Purpose
    - Allows activating "Under Construction" mode that redirects all visitors to the EC preview page
    - Useful when the website is being updated or maintained
*/

ALTER TABLE media_pages 
ADD COLUMN IF NOT EXISTS global_redirect boolean DEFAULT false;

COMMENT ON COLUMN media_pages.global_redirect IS 'When true, all website visitors will be redirected to this page';
