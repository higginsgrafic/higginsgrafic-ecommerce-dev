/*
  # Create shipping configuration table

  Stores shipping costs per zone, synced with Correos API.
  The Netlify function /api/shipping-rates updates these values.

  1. New Table
    - `shipping_config`
      - `id` (uuid, primary key)
      - `zone` (text, unique) - e.g. 'es_peninsula', 'es_canarias', 'eu', 'international'
      - `label` (text) - Display label e.g. 'Espanya (Península i Balears)'
      - `cost` (numeric) - Shipping cost in EUR
      - `free_threshold` (numeric) - Order subtotal above which shipping is free (NULL = never free)
      - `updated_at` (timestamptz)

  2. Security
    - Public read access (anyone can view shipping costs)
    - Authenticated write access (admin / serverless function with service role)

  3. Default Data
    - Insert default zones with current known values
*/

CREATE TABLE IF NOT EXISTS shipping_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone text UNIQUE NOT NULL,
  label text NOT NULL,
  cost numeric(10,2) NOT NULL DEFAULT 0,
  free_threshold numeric(10,2) DEFAULT 50.00,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shipping_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read shipping config"
  ON shipping_config
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can update shipping config"
  ON shipping_config
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can insert shipping config"
  ON shipping_config
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM shipping_config LIMIT 1) THEN
    INSERT INTO shipping_config (zone, label, cost, free_threshold) VALUES
      ('es_peninsula', 'Espanya (Península i Balears)', 4.95, 50.00),
      ('es_canarias', 'Espanya (Canàries, Ceuta, Melilla)', 6.95, NULL),
      ('eu', 'Unió Europea', 6.95, 50.00),
      ('international', 'Internacional', 12.95, NULL);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_shipping_config_updated_at ON shipping_config;
CREATE TRIGGER update_shipping_config_updated_at
  BEFORE UPDATE ON shipping_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
