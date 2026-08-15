-- ============================================================
-- Harden RLS policies: restrict writes to authenticated only
-- Fix function search_path
-- ============================================================

-- 1. FIX FUNCTION SEARCH PATH
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.generate_order_number() SET search_path = public;
ALTER FUNCTION public.update_updated_at() SET search_path = public;

-- 2. HARDEN RLS POLICIES

-- collections
DROP POLICY IF EXISTS "Allow anonymous delete for demo" ON collections;
DROP POLICY IF EXISTS "Allow anonymous insert for demo" ON collections;
DROP POLICY IF EXISTS "Allow anonymous update for demo" ON collections;
CREATE POLICY "Authenticated can insert collections" ON collections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update collections" ON collections FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete collections" ON collections FOR DELETE TO authenticated USING (true);

-- gelato_blank_products
DROP POLICY IF EXISTS "Anyone can delete blank products" ON gelato_blank_products;
DROP POLICY IF EXISTS "Anyone can insert blank products" ON gelato_blank_products;
DROP POLICY IF EXISTS "Anyone can update blank products" ON gelato_blank_products;
CREATE POLICY "Authenticated can insert blank products" ON gelato_blank_products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update blank products" ON gelato_blank_products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete blank products" ON gelato_blank_products FOR DELETE TO authenticated USING (true);

-- gradient_presets
DROP POLICY IF EXISTS "Anyone can create gradient presets" ON gradient_presets;
DROP POLICY IF EXISTS "Anyone can delete gradient presets" ON gradient_presets;
DROP POLICY IF EXISTS "Anyone can update gradient presets" ON gradient_presets;
CREATE POLICY "Authenticated can create gradient presets" ON gradient_presets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update gradient presets" ON gradient_presets FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete gradient presets" ON gradient_presets FOR DELETE TO authenticated USING (true);

-- hero_config
DROP POLICY IF EXISTS "Només autenticats poden actualitzar configuració del hero" ON hero_config;
DROP POLICY IF EXISTS "Només autenticats poden esborrar configuració del hero" ON hero_config;
DROP POLICY IF EXISTS "Només autenticats poden inserir configuració del hero" ON hero_config;
CREATE POLICY "Authenticated can insert hero config" ON hero_config FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update hero config" ON hero_config FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete hero config" ON hero_config FOR DELETE TO authenticated USING (true);

-- media_pages
DROP POLICY IF EXISTS "Allow anonymous delete for demo" ON media_pages;
DROP POLICY IF EXISTS "Allow anonymous insert for demo" ON media_pages;
DROP POLICY IF EXISTS "Allow anonymous update for demo" ON media_pages;
CREATE POLICY "Authenticated can insert media pages" ON media_pages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update media pages" ON media_pages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete media pages" ON media_pages FOR DELETE TO authenticated USING (true);

-- messages (service role full access - restrict to authenticated)
DROP POLICY IF EXISTS "Service role full access" ON messages;
CREATE POLICY "Authenticated can insert messages" ON messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update messages" ON messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete messages" ON messages FOR DELETE TO authenticated USING (true);

-- orders
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
CREATE POLICY "Authenticated can create orders" ON orders FOR INSERT TO authenticated WITH CHECK (true);

-- pricing_config
DROP POLICY IF EXISTS "Authenticated can manage pricing config" ON pricing_config;
CREATE POLICY "Authenticated can insert pricing config" ON pricing_config FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update pricing config" ON pricing_config FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete pricing config" ON pricing_config FOR DELETE TO authenticated USING (true);

-- product_episode_texts
DROP POLICY IF EXISTS "Authenticated users can delete episode texts" ON product_episode_texts;
DROP POLICY IF EXISTS "Authenticated users can insert episode texts" ON product_episode_texts;
DROP POLICY IF EXISTS "Authenticated users can update episode texts" ON product_episode_texts;
CREATE POLICY "Authenticated can insert episode texts" ON product_episode_texts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update episode texts" ON product_episode_texts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete episode texts" ON product_episode_texts FOR DELETE TO authenticated USING (true);

-- product_episodes
DROP POLICY IF EXISTS "Authenticated users can delete product episodes" ON product_episodes;
DROP POLICY IF EXISTS "Authenticated users can insert product episodes" ON product_episodes;
DROP POLICY IF EXISTS "Authenticated users can update product episodes" ON product_episodes;
CREATE POLICY "Authenticated can insert product episodes" ON product_episodes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update product episodes" ON product_episodes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete product episodes" ON product_episodes FOR DELETE TO authenticated USING (true);

-- product_images
DROP POLICY IF EXISTS "Allow public delete to product images" ON product_images;
DROP POLICY IF EXISTS "Allow public insert to product images" ON product_images;
DROP POLICY IF EXISTS "Allow public update to product images" ON product_images;
CREATE POLICY "Authenticated can insert product images" ON product_images FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update product images" ON product_images FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete product images" ON product_images FOR DELETE TO authenticated USING (true);

-- product_mockups
DROP POLICY IF EXISTS "Allow public delete to product mockups" ON product_mockups;
DROP POLICY IF EXISTS "Allow public insert to product mockups" ON product_mockups;
DROP POLICY IF EXISTS "Allow public update to product mockups" ON product_mockups;
CREATE POLICY "Authenticated can insert product mockups" ON product_mockups FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update product mockups" ON product_mockups FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete product mockups" ON product_mockups FOR DELETE TO authenticated USING (true);

-- product_variants
DROP POLICY IF EXISTS "Allow public delete to product variants" ON product_variants;
DROP POLICY IF EXISTS "Allow public insert to product variants" ON product_variants;
DROP POLICY IF EXISTS "Allow public update to product variants" ON product_variants;
CREATE POLICY "Authenticated can insert product variants" ON product_variants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update product variants" ON product_variants FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete product variants" ON product_variants FOR DELETE TO authenticated USING (true);

-- products
DROP POLICY IF EXISTS "Allow public delete to products" ON products;
DROP POLICY IF EXISTS "Allow public insert to products" ON products;
DROP POLICY IF EXISTS "Allow public update to products" ON products;
CREATE POLICY "Authenticated can insert products" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update products" ON products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete products" ON products FOR DELETE TO authenticated USING (true);

-- promotions_config
DROP POLICY IF EXISTS "Anyone can insert promotions config" ON promotions_config;
DROP POLICY IF EXISTS "Anyone can update promotions config" ON promotions_config;
CREATE POLICY "Authenticated can insert promotions config" ON promotions_config FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update promotions config" ON promotions_config FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- shipping_config
DROP POLICY IF EXISTS "Authenticated can insert shipping config" ON shipping_config;
DROP POLICY IF EXISTS "Authenticated can update shipping config" ON shipping_config;
CREATE POLICY "Authenticated can insert shipping config" ON shipping_config FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update shipping config" ON shipping_config FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- workspace_calibrations
DROP POLICY IF EXISTS "Allow public insert of workspace_calibrations" ON workspace_calibrations;
CREATE POLICY "Authenticated can insert workspace calibrations" ON workspace_calibrations FOR INSERT TO authenticated WITH CHECK (true);
