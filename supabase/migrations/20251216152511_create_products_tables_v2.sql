/*
  # Create Products Database Schema

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `gelato_product_id` (text, unique) - Gelato product UID
      - `name` (text) - Product name
      - `description` (text) - Product description
      - `price` (numeric) - Base price
      - `currency` (text) - Currency code
      - `category` (text) - Product category
      - `collection` (text) - Collection name (first-contact, austen, etc.)
      - `sku` (text) - SKU code
      - `is_active` (boolean) - Whether product is active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `product_images`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `url` (text) - Image URL
      - `position` (int) - Display order
      - `created_at` (timestamptz)
    
    - `product_variants`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `gelato_variant_id` (text) - Gelato variant UID
      - `sku` (text) - Variant SKU
      - `size` (text) - Size (XS, S, M, L, XL, XXL)
      - `color` (text) - Color name
      - `color_hex` (text) - Color hex code
      - `price` (numeric) - Variant price
      - `stock` (int) - Stock quantity (999 for unlimited)
      - `is_available` (boolean) - Availability
      - `image_url` (text) - Variant image URL
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (authenticated for write)
*/

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- Products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gelato_product_id text UNIQUE,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric NOT NULL DEFAULT 29.99,
  currency text DEFAULT 'EUR',
  category text DEFAULT 'apparel',
  collection text DEFAULT 'first-contact',
  sku text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product images table
CREATE TABLE product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  position int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Product variants table
CREATE TABLE product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  gelato_variant_id text,
  sku text,
  size text NOT NULL,
  color text NOT NULL,
  color_hex text DEFAULT '#FFFFFF',
  price numeric DEFAULT 29.99,
  stock int DEFAULT 999,
  is_available boolean DEFAULT true,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_products_collection ON products(collection);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Products policies (public read, authenticated write)
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Product images policies
CREATE POLICY "Anyone can view product images"
  ON product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_images.product_id
      AND products.is_active = true
    )
  );

CREATE POLICY "Authenticated users can insert product images"
  ON product_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update product images"
  ON product_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete product images"
  ON product_images FOR DELETE
  TO authenticated
  USING (true);

-- Product variants policies
CREATE POLICY "Anyone can view available variants"
  ON product_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_variants.product_id
      AND products.is_active = true
    )
  );

CREATE POLICY "Authenticated users can insert variants"
  ON product_variants FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update variants"
  ON product_variants FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete variants"
  ON product_variants FOR DELETE
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();