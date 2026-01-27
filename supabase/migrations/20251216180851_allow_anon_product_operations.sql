/*
  # Allow anonymous product operations for development
  
  1. Changes
    - Drop existing restrictive policies for products, product_images, and product_variants
    - Create new permissive policies that allow anonymous users to:
      - SELECT all products (not just active ones)
      - INSERT products
      - UPDATE products
      - Same for product_images and product_variants
  
  2. Security Notes
    - This is for DEVELOPMENT only
    - In production, you should restrict INSERT/UPDATE to authenticated admin users
    - For now, we allow anonymous access to facilitate testing and development
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;

DROP POLICY IF EXISTS "Anyone can view product images" ON product_images;
DROP POLICY IF EXISTS "Authenticated users can insert product images" ON product_images;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON product_images;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON product_images;

DROP POLICY IF EXISTS "Anyone can view available variants" ON product_variants;
DROP POLICY IF EXISTS "Authenticated users can insert variants" ON product_variants;
DROP POLICY IF EXISTS "Authenticated users can update variants" ON product_variants;
DROP POLICY IF EXISTS "Authenticated users can delete variants" ON product_variants;

-- Create new permissive policies for PRODUCTS
CREATE POLICY "Allow public read access to products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to products"
  ON products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to products"
  ON products FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to products"
  ON products FOR DELETE
  USING (true);

-- Create new permissive policies for PRODUCT_IMAGES
CREATE POLICY "Allow public read access to product images"
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to product images"
  ON product_images FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to product images"
  ON product_images FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to product images"
  ON product_images FOR DELETE
  USING (true);

-- Create new permissive policies for PRODUCT_VARIANTS
CREATE POLICY "Allow public read access to product variants"
  ON product_variants FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to product variants"
  ON product_variants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to product variants"
  ON product_variants FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to product variants"
  ON product_variants FOR DELETE
  USING (true);
