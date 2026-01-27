/*
  # Create gradient presets table

  1. New Tables
    - `gradient_presets`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the preset
      - `stops` (jsonb) - Array of gradient stops with color and position
      - `angle` (integer) - Gradient angle in degrees
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
  
  2. Security
    - Enable RLS on `gradient_presets` table
    - Add policies for anonymous users to read presets
    - Add policies for anonymous users to create/update/delete presets
*/

CREATE TABLE IF NOT EXISTS gradient_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  stops jsonb NOT NULL,
  angle integer DEFAULT 90,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE gradient_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gradient presets"
  ON gradient_presets FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create gradient presets"
  ON gradient_presets FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update gradient presets"
  ON gradient_presets FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete gradient presets"
  ON gradient_presets FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_gradient_presets_created_at ON gradient_presets(created_at DESC);