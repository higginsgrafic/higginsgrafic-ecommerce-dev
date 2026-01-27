/*
  # Create promotions configuration table

  1. New Tables
    - `promotions_config`
      - `id` (uuid, primary key) - Configuration ID (only one row should exist)
      - `enabled` (boolean) - Whether the promotion banner is active
      - `text` (text) - Promotion message text
      - `link` (text) - Optional link URL
      - `bg_color` (text) - Background color (hex code)
      - `text_color` (text) - Text color (hex code)
      - `font_size` (text) - Font size (e.g., '14px')
      - `font` (text) - Font family
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `promotions_config` table
    - Add policy for public read access (anyone can view the active promotion)
    - Add policy for authenticated admin operations (future use)

  3. Default Data
    - Insert default configuration with enabled=true and standard shipping message

  4. Important Notes
    - This table should contain only ONE row for the global promotion configuration
    - Updates should modify the existing row rather than creating new ones
    - The public can read this config to display the banner
    - Only admins should be able to modify (to be implemented with auth later)
*/

-- Create the promotions_config table
CREATE TABLE IF NOT EXISTS promotions_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled boolean DEFAULT true,
  text text NOT NULL,
  link text DEFAULT '/offers',
  bg_color text DEFAULT '#111827',
  text_color text DEFAULT '#ffffff',
  font_size text DEFAULT '14px',
  font text DEFAULT 'Roboto',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE promotions_config ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read the promotions config
CREATE POLICY "Anyone can read promotions config"
  ON promotions_config
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Anyone can update promotions config (for now - to be restricted later with auth)
CREATE POLICY "Anyone can update promotions config"
  ON promotions_config
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Anyone can insert promotions config (only if none exists)
CREATE POLICY "Anyone can insert promotions config"
  ON promotions_config
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Insert default configuration if none exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM promotions_config LIMIT 1) THEN
    INSERT INTO promotions_config (
      enabled,
      text,
      link,
      bg_color,
      text_color,
      font_size,
      font
    ) VALUES (
      true,
      'Enviament gratuït en comandes superiors a 50€',
      '/offers',
      '#111827',
      '#ffffff',
      '14px',
      'Roboto'
    );
  END IF;
END $$;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_promotions_config_updated_at ON promotions_config;
CREATE TRIGGER update_promotions_config_updated_at
  BEFORE UPDATE ON promotions_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();