/*
  # Afegir camps de text a media_pages

  1. Canvis
    - Afegir camp `title` (text) - Títol principal de la pàgina
    - Afegir camp `subtitle` (text) - Subtítol de la pàgina
    - Afegir camp `description` (text) - Descripció addicional
    - Afegir camp `button_text` (text) - Text del botó (opcional)
    - Afegir camp `button_link` (text) - Enllaç del botó (opcional)
    - Afegir camp `show_button` (boolean) - Mostrar o no el botó
    - Afegir camp `text_color` (text) - Color del text
  
  2. Notes
    - Utilitza IF NOT EXISTS per evitar errors si els camps ja existeixen
    - Valors per defecte adequats per una pàgina "En Construcció"
    - Els camps són opcionals (nullable) per màxima flexibilitat
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_pages' AND column_name = 'title'
  ) THEN
    ALTER TABLE media_pages ADD COLUMN title text DEFAULT 'En Construcció';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_pages' AND column_name = 'subtitle'
  ) THEN
    ALTER TABLE media_pages ADD COLUMN subtitle text DEFAULT 'Estem treballant en aquesta pàgina. Aviat estarà disponible.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_pages' AND column_name = 'description'
  ) THEN
    ALTER TABLE media_pages ADD COLUMN description text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_pages' AND column_name = 'button_text'
  ) THEN
    ALTER TABLE media_pages ADD COLUMN button_text text DEFAULT 'Tornar a l''inici';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_pages' AND column_name = 'button_link'
  ) THEN
    ALTER TABLE media_pages ADD COLUMN button_link text DEFAULT '/';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_pages' AND column_name = 'show_button'
  ) THEN
    ALTER TABLE media_pages ADD COLUMN show_button boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_pages' AND column_name = 'text_color'
  ) THEN
    ALTER TABLE media_pages ADD COLUMN text_color text DEFAULT '#ffffff';
  END IF;
END $$;
