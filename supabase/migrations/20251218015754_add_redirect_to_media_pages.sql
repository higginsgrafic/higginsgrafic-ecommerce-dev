/*
  # Afegir funcionalitat de redirecció a media_pages
  
  1. Canvis
    - Afegir columna `redirect_url` per emmagatzemar l'URL de redireccions
    - Afegir columna `auto_redirect` per controlar si la redireccions és automàtica
    
  2. Notes
    - `redirect_url` és l'URL on es redirigirà l'usuari quan acabi el vídeo
    - `auto_redirect` controla si la redireccions és automàtica o no
*/

DO $$
BEGIN
  -- Afegir redirect_url si no existeix
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_pages' AND column_name = 'redirect_url'
  ) THEN
    ALTER TABLE media_pages ADD COLUMN redirect_url text;
  END IF;
  
  -- Afegir auto_redirect si no existeix
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_pages' AND column_name = 'auto_redirect'
  ) THEN
    ALTER TABLE media_pages ADD COLUMN auto_redirect boolean DEFAULT false;
  END IF;
END $$;