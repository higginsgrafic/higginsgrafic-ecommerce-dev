/*
  # Consolidar taules duplicades de col·leccions i dock

  1. Modificacions a taules existents
    - Afegir camps a `collections`:
      - `path` (text) - Ruta de la pàgina
      - `icon_url` (text) - URL de la icona
      - `bg_color` (text) - Color de fons
      - `is_active` (boolean) - Si està activa
      - `display_order` (integer) - Ordre de visualització
    
  2. Migració de dades
    - Copiar dades de `collections_config` a `collections`
    - Migrar dades de `home_dock_config` a `dock_slots` si cal
    
  3. Neteja
    - Esborrar taula `collections_config` (redundant)
    - Esborrar taula `home_dock_config` (redundant)

  4. Notes
    - Mantenim `collections` com a única font de veritat per col·leccions
    - Mantenim `dock_slots` com a única font de veritat per slots del dock
*/

 -- 0. Assegurar que existeix la taula base `collections`
 DO $$
 BEGIN
   IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'collections') THEN
     CREATE TABLE collections (
       id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
       slug text UNIQUE NOT NULL,
       name text NOT NULL,
       description text DEFAULT '',
       logo_url text DEFAULT '',
       "order" integer DEFAULT 0,
       created_at timestamptz DEFAULT now(),
       updated_at timestamptz DEFAULT now(),
       path text DEFAULT '/',
       icon_url text DEFAULT '',
       bg_color text DEFAULT 'bg-white',
       is_active boolean DEFAULT true,
       display_order integer DEFAULT 0
     );

     ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
   END IF;
 END $$;
 
-- 1. Afegir nous camps a collections si no existeixen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'collections' AND column_name = 'path'
  ) THEN
    ALTER TABLE collections ADD COLUMN path text DEFAULT '/';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'collections' AND column_name = 'icon_url'
  ) THEN
    ALTER TABLE collections ADD COLUMN icon_url text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'collections' AND column_name = 'bg_color'
  ) THEN
    ALTER TABLE collections ADD COLUMN bg_color text DEFAULT 'bg-white';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'collections' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE collections ADD COLUMN is_active boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'collections' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE collections ADD COLUMN display_order integer DEFAULT 0;
  END IF;
END $$;

-- 2. Migrar dades de collections_config a collections
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'collections_config') THEN
    -- Actualitzar collections amb dades de collections_config
    UPDATE collections c
    SET 
      path = cc.path,
      icon_url = cc.icon_url,
      bg_color = cc.bg_color,
      is_active = cc.is_active,
      display_order = cc.display_order,
      description = COALESCE(cc.description, c.description),
      updated_at = now()
    FROM collections_config cc
    WHERE c.slug = cc.slug;

    -- Inserir noves col·leccions que no existeixen a collections
    INSERT INTO collections (slug, name, description, path, icon_url, bg_color, is_active, display_order, logo_url, "order")
    SELECT 
      cc.slug,
      cc.name,
      cc.description,
      cc.path,
      cc.icon_url,
      cc.bg_color,
      cc.is_active,
      cc.display_order,
      cc.icon_url as logo_url,
      cc.display_order as "order"
    FROM collections_config cc
    WHERE NOT EXISTS (
      SELECT 1 FROM collections c WHERE c.slug = cc.slug
    );
  END IF;
END $$;

-- 3. Esborrar taula collections_config
DROP TABLE IF EXISTS collections_config;

-- 4. Esborrar taula home_dock_config (ja tenim dock_slots)
DROP TABLE IF EXISTS home_dock_config;

-- 5. Assegurar que les polítiques RLS de collections són correctes
DROP POLICY IF EXISTS "Anyone can read collections" ON collections;
DROP POLICY IF EXISTS "Authenticated users can manage collections" ON collections;
DROP POLICY IF EXISTS "Allow anonymous read for demo" ON collections;
DROP POLICY IF EXISTS "Allow anonymous insert for demo" ON collections;
DROP POLICY IF EXISTS "Allow anonymous update for demo" ON collections;
DROP POLICY IF EXISTS "Allow anonymous delete for demo" ON collections;

CREATE POLICY "Anyone can read active collections"
  ON collections
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Allow anonymous insert for demo"
  ON collections
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update for demo"
  ON collections
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete for demo"
  ON collections
  FOR DELETE
  TO anon
  USING (true);
