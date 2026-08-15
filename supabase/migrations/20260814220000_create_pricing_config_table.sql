-- Create pricing_config table for global and collection-level pricing
CREATE TABLE IF NOT EXISTS pricing_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL DEFAULT 'global', -- 'global' or 'collection'
  collection text, -- null when scope = 'global'
  price numeric(10,2) NOT NULL DEFAULT 15.50,
  currency text DEFAULT 'EUR',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(scope, collection)
);

-- Enable RLS
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

-- Public can read pricing
CREATE POLICY "Anyone can read pricing config"
  ON pricing_config FOR SELECT
  USING (true);

-- Authenticated can write
CREATE POLICY "Authenticated can manage pricing config"
  ON pricing_config FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default global price
INSERT INTO pricing_config (scope, collection, price)
VALUES ('global', NULL, 15.50)
ON CONFLICT (scope, collection) DO NOTHING;
