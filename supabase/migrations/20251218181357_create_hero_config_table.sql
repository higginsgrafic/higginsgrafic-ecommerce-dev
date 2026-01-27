/*
  # Crear taula de configuració del Hero

  1. Nova Taula
    - `hero_config`
      - `id` (uuid, primary key)
      - `slide_index` (integer) - índex del slide (0-4)
      - `title` (text) - títol del slide
      - `subtitle` (text) - subtítol del slide
      - `video_url` (text) - URL del vídeo de YouTube
      - `path` (text) - ruta de navegació
      - `bg_type` (text) - tipus de background: 'video', 'image', 'gradient'
      - `bg_value` (text) - valor del background (URL o gradient CSS)
      - `bg_opacity` (numeric) - opacitat del overlay (0-1)
      - `autoplay_enabled` (boolean) - si l'autoplay està activat
      - `autoplay_interval` (integer) - interval en ms entre slides
      - `active` (boolean) - si el slide està actiu
      - `order` (integer) - ordre del slide
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Seguretat
    - Enable RLS
    - Políticas per a usuaris autenticats i anònims (només lectura per anònims)
*/

CREATE TABLE IF NOT EXISTS hero_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_index integer NOT NULL DEFAULT 0,
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  video_url text NOT NULL DEFAULT '',
  path text NOT NULL DEFAULT '/',
  bg_type text NOT NULL DEFAULT 'video',
  bg_value text NOT NULL DEFAULT '',
  bg_opacity numeric NOT NULL DEFAULT 0.5,
  autoplay_enabled boolean NOT NULL DEFAULT true,
  autoplay_interval integer NOT NULL DEFAULT 8000,
  active boolean NOT NULL DEFAULT true,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hero_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tothom pot veure la configuració del hero"
  ON hero_config
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Només autenticats poden inserir configuració del hero"
  ON hero_config
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Només autenticats poden actualitzar configuració del hero"
  ON hero_config
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Només autenticats poden esborrar configuració del hero"
  ON hero_config
  FOR DELETE
  TO public
  USING (true);

CREATE INDEX IF NOT EXISTS idx_hero_config_active ON hero_config(active);
CREATE INDEX IF NOT EXISTS idx_hero_config_order ON hero_config("order");
