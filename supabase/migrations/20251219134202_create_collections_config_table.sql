/*
  # Create collections configuration table

  1. New Tables
    - `collections_config`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - Identificador únic de la col·lecció
      - `name` (text) - Nom visible de la col·lecció
      - `description` (text) - Descripció de la col·lecció
      - `path` (text) - Ruta de la pàgina de la col·lecció
      - `icon_url` (text) - URL de la icona/logo de la col·lecció
      - `bg_color` (text) - Color de fons per la secció
      - `is_active` (boolean) - Si la col·lecció està activa
      - `display_order` (integer) - Ordre de visualització
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `collections_config` table
    - Add policy for public read access
    - Add policy for authenticated admin write access
*/

CREATE TABLE IF NOT EXISTS collections_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  path text NOT NULL,
  icon_url text DEFAULT '',
  bg_color text DEFAULT 'bg-white',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE collections_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read collections config"
  ON collections_config
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert collections config"
  ON collections_config
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update collections config"
  ON collections_config
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete collections config"
  ON collections_config
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert default collections
INSERT INTO collections_config (slug, name, description, path, icon_url, bg_color, display_order) VALUES
  ('first-contact', 'First Contact', 'Explora el primer contacte amb altres civilitzacions', '/first-contact', '/collection-icon-first-contact.svg', 'bg-white', 1),
  ('the-human-inside', 'The Human Inside', 'Descobreix la humanitat que portes dins', '/the-human-inside', '/logo-the-human-inside.svg', 'bg-gray-50', 2),
  ('austen', 'Austen', 'Una col·lecció inspirada en els clàssics', '/austen', '/logo-austen.svg', 'bg-white', 3),
  ('cube', 'Cube', 'Formes geomètriques que desafien la percepció', '/cube', '/logo-cube.png', 'bg-gray-50', 4),
  ('outcasted', 'Outcasted', 'Per als que no encaixen en el motlle', '/outcasted', '/logo-outcasted.png', 'bg-white', 5),
  ('grafic', 'Gràfic', 'Disseny gràfic contemporani', '/grafic', '/logo-grafc.png', 'bg-gray-50', 6)
ON CONFLICT (slug) DO NOTHING;
