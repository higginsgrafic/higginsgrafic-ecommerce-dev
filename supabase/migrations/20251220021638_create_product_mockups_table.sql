/*
  # Create product mockups table

  1. New Tables
    - `product_mockups`
      - `id` (uuid, primary key)
      - `collection` (text) - Collection name (First Contact, Austen, etc.)
      - `subcategory` (text, nullable) - First level subcategory (encreuats, frases)
      - `sub_subcategory` (text, nullable) - Second level subcategory (quotes, looking-for)
      - `design_name` (text) - Design identifier (NX-01, Persuasion, Blue-dark-gradient, etc.)
      - `drawing_color` (text) - Color of the design/drawing (black, white, blue, etc.)
      - `base_color` (text) - Base color of product (white, black, navy, red, etc.)
      - `product_type` (text) - Type of product (tshirt, mug, hoodie, etc.)
      - `file_path` (text) - Path to the mockup image file
      - `variant_id` (uuid, nullable) - Optional link to product_variants
      - `is_active` (boolean) - Whether the mockup is active
      - `display_order` (integer) - Order for display
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `product_mockups` table
    - Add policy for public read access (anyone can view mockups)
    - Add policy for authenticated insert/update/delete
*/

CREATE TABLE IF NOT EXISTS product_mockups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection text NOT NULL,
  subcategory text,
  sub_subcategory text,
  design_name text NOT NULL,
  drawing_color text NOT NULL,
  base_color text NOT NULL,
  product_type text NOT NULL DEFAULT 'tshirt',
  file_path text NOT NULL,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_product_mockups_collection ON product_mockups(collection);
CREATE INDEX IF NOT EXISTS idx_product_mockups_design ON product_mockups(design_name);
CREATE INDEX IF NOT EXISTS idx_product_mockups_variant ON product_mockups(variant_id);
CREATE INDEX IF NOT EXISTS idx_product_mockups_active ON product_mockups(is_active);

-- Enable RLS
ALTER TABLE product_mockups ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active mockups
CREATE POLICY "Anyone can view active mockups"
  ON product_mockups
  FOR SELECT
  USING (is_active = true);

-- Allow authenticated users to view all mockups
CREATE POLICY "Authenticated users can view all mockups"
  ON product_mockups
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert mockups
CREATE POLICY "Authenticated users can insert mockups"
  ON product_mockups
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update mockups
CREATE POLICY "Authenticated users can update mockups"
  ON product_mockups
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete mockups
CREATE POLICY "Authenticated users can delete mockups"
  ON product_mockups
  FOR DELETE
  TO authenticated
  USING (true);