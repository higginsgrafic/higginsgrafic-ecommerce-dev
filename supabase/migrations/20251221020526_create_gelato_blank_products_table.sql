/*
  # Create Gelato Blank Products Table

  1. New Tables
    - `gelato_blank_products`
      - `id` (uuid, primary key)
      - `gelato_product_uid` (text, unique) - ID del producte a Gelato
      - `product_name` (text) - Nom del producte (ex: Gildan 5000)
      - `product_type` (text) - Tipus de producte (tshirt, hoodie, etc)
      - `brand` (text) - Marca (Gildan, Bella+Canvas, etc)
      - `full_data` (jsonb) - Totes les dades completes del producte
      - `variants_data` (jsonb) - Dades de variants/dimensions
      - `pricing_data` (jsonb) - Dades de preus
      - `available_sizes` (text[]) - Talles disponibles
      - `available_colors` (text[]) - Colors disponibles
      - `notes` (text) - Notes i observacions
      - `fetched_at` (timestamptz) - Quan es va obtenir la informació
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `gelato_blank_products` table
    - Add policy for anonymous read access (per comparar dades)
    - Add policy for authenticated users to manage records
*/

CREATE TABLE IF NOT EXISTS gelato_blank_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gelato_product_uid text UNIQUE NOT NULL,
  product_name text NOT NULL,
  product_type text DEFAULT 'tshirt',
  brand text DEFAULT '',
  full_data jsonb DEFAULT '{}'::jsonb,
  variants_data jsonb DEFAULT '[]'::jsonb,
  pricing_data jsonb DEFAULT '{}'::jsonb,
  available_sizes text[] DEFAULT ARRAY[]::text[],
  available_colors text[] DEFAULT ARRAY[]::text[],
  notes text DEFAULT '',
  fetched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE gelato_blank_products ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read (per comparar dades)
CREATE POLICY "Anyone can read blank products"
  ON gelato_blank_products
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert
CREATE POLICY "Authenticated users can insert blank products"
  ON gelato_blank_products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update
CREATE POLICY "Authenticated users can update blank products"
  ON gelato_blank_products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete
CREATE POLICY "Authenticated users can delete blank products"
  ON gelato_blank_products
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index on gelato_product_uid for faster lookups
CREATE INDEX IF NOT EXISTS idx_gelato_blank_products_uid 
  ON gelato_blank_products(gelato_product_uid);

-- Create index on product_name for searching
CREATE INDEX IF NOT EXISTS idx_gelato_blank_products_name 
  ON gelato_blank_products(product_name);
