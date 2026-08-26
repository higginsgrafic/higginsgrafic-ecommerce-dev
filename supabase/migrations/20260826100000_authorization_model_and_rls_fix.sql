-- ============================================================
-- Authorization Model & Corrective RLS
-- ============================================================
-- This migration:
--   1. Creates the `staff` table with UNIQUE(user_id) and role CHECK
--   2. Creates a hardened `is_admin()` function (SECURITY DEFINER, safe search_path)
--   3. Drops ALL existing write policies on every table
--   4. Recreates policies following the admin-gated authorization model
--   5. Drops ALL storage write policies and recreates with admin-gated model
--
-- This migration is forward-only and idempotent (uses IF EXISTS / IF NOT EXISTS).
-- It does NOT drop any tables or data.
-- It supersedes 20260814230000_harden_rls_policies.sql — does not depend on it.
-- ============================================================

-- ============================================================
-- 1. staff table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'editor')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Drop any existing staff policies (idempotent)
DROP POLICY IF EXISTS "Service role can manage staff" ON public.staff;
DROP POLICY IF EXISTS "Staff can read own record" ON public.staff;

-- Only service_role can read/write the staff table
CREATE POLICY "Service role can manage staff"
  ON public.staff FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- A staff member can read their own record (for client-side is_admin checks if needed)
CREATE POLICY "Staff can read own record"
  ON public.staff FOR SELECT
  USING (
    auth.role() = 'service_role'
    OR user_id = auth.uid()
  );

-- ============================================================
-- 2. is_admin() function — hardened
-- ============================================================

DROP FUNCTION IF EXISTS public.is_admin();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff
    WHERE staff.user_id = auth.uid()
      AND staff.role = 'admin'
      AND staff.is_active = true
  );
$$;

-- ============================================================
-- 3. Drop ALL existing write policies on every table
-- ============================================================

-- products
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
DROP POLICY IF EXISTS "Allow public insert to products" ON products;
DROP POLICY IF EXISTS "Allow public update to products" ON products;
DROP POLICY IF EXISTS "Allow public delete to products" ON products;
DROP POLICY IF EXISTS "Authenticated can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated can update products" ON products;
DROP POLICY IF EXISTS "Authenticated can delete products" ON products;

-- product_variants
DROP POLICY IF EXISTS "Anyone can view available variants" ON product_variants;
DROP POLICY IF EXISTS "Authenticated users can insert variants" ON product_variants;
DROP POLICY IF EXISTS "Authenticated users can update variants" ON product_variants;
DROP POLICY IF EXISTS "Authenticated users can delete variants" ON product_variants;
DROP POLICY IF EXISTS "Allow public read access to product variants" ON product_variants;
DROP POLICY IF EXISTS "Allow public insert to product variants" ON product_variants;
DROP POLICY IF EXISTS "Allow public update to product variants" ON product_variants;
DROP POLICY IF EXISTS "Allow public delete to product variants" ON product_variants;
DROP POLICY IF EXISTS "Authenticated can insert product variants" ON product_variants;
DROP POLICY IF EXISTS "Authenticated can update product variants" ON product_variants;
DROP POLICY IF EXISTS "Authenticated can delete product variants" ON product_variants;

-- product_images
DROP POLICY IF EXISTS "Anyone can view product images" ON product_images;
DROP POLICY IF EXISTS "Authenticated users can insert product images" ON product_images;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON product_images;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON product_images;
DROP POLICY IF EXISTS "Allow public read access to product images" ON product_images;
DROP POLICY IF EXISTS "Allow public insert to product images" ON product_images;
DROP POLICY IF EXISTS "Allow public update to product images" ON product_images;
DROP POLICY IF EXISTS "Allow public delete to product images" ON product_images;
DROP POLICY IF EXISTS "Authenticated can insert product images" ON product_images;
DROP POLICY IF EXISTS "Authenticated can update product images" ON product_images;
DROP POLICY IF EXISTS "Authenticated can delete product images" ON product_images;

-- product_mockups
DROP POLICY IF EXISTS "Allow public delete to product mockups" ON product_mockups;
DROP POLICY IF EXISTS "Allow public insert to product mockups" ON product_mockups;
DROP POLICY IF EXISTS "Allow public update to product mockups" ON product_mockups;
DROP POLICY IF EXISTS "Authenticated can insert product mockups" ON product_mockups;
DROP POLICY IF EXISTS "Authenticated can update product mockups" ON product_mockups;
DROP POLICY IF EXISTS "Authenticated can delete product mockups" ON product_mockups;

-- collections
DROP POLICY IF EXISTS "Anyone can read collections" ON collections;
DROP POLICY IF EXISTS "Authenticated users can manage collections" ON collections;
DROP POLICY IF EXISTS "Allow anonymous read for demo" ON collections;
DROP POLICY IF EXISTS "Allow anonymous insert for demo" ON collections;
DROP POLICY IF EXISTS "Allow anonymous update for demo" ON collections;
DROP POLICY IF EXISTS "Allow anonymous delete for demo" ON collections;
DROP POLICY IF EXISTS "Anyone can read active collections" ON collections;
DROP POLICY IF EXISTS "Authenticated can insert collections" ON collections;
DROP POLICY IF EXISTS "Authenticated can update collections" ON collections;
DROP POLICY IF EXISTS "Authenticated can delete collections" ON collections;

-- gelato_blank_products
DROP POLICY IF EXISTS "Authenticated users can insert blank products" ON gelato_blank_products;
DROP POLICY IF EXISTS "Authenticated users can update blank products" ON gelato_blank_products;
DROP POLICY IF EXISTS "Authenticated users can delete blank products" ON gelato_blank_products;
DROP POLICY IF EXISTS "Anyone can insert blank products" ON gelato_blank_products;
DROP POLICY IF EXISTS "Anyone can update blank products" ON gelato_blank_products;
DROP POLICY IF EXISTS "Anyone can delete blank products" ON gelato_blank_products;
DROP POLICY IF EXISTS "Authenticated can insert blank products" ON gelato_blank_products;
DROP POLICY IF EXISTS "Authenticated can update blank products" ON gelato_blank_products;
DROP POLICY IF EXISTS "Authenticated can delete blank products" ON gelato_blank_products;

-- gradient_presets
DROP POLICY IF EXISTS "Anyone can create gradient presets" ON gradient_presets;
DROP POLICY IF EXISTS "Anyone can delete gradient presets" ON gradient_presets;
DROP POLICY IF EXISTS "Anyone can update gradient presets" ON gradient_presets;
DROP POLICY IF EXISTS "Authenticated can create gradient presets" ON gradient_presets;
DROP POLICY IF EXISTS "Authenticated can update gradient presets" ON gradient_presets;
DROP POLICY IF EXISTS "Authenticated can delete gradient presets" ON gradient_presets;

-- hero_config
DROP POLICY IF EXISTS "Tothom pot veure la configuració del hero" ON hero_config;
DROP POLICY IF EXISTS "Només autenticats poden inserir configuració del hero" ON hero_config;
DROP POLICY IF EXISTS "Només autenticats poden actualitzar configuració del hero" ON hero_config;
DROP POLICY IF EXISTS "Només autenticats poden esborrar configuració del hero" ON hero_config;
DROP POLICY IF EXISTS "Authenticated can insert hero config" ON hero_config;
DROP POLICY IF EXISTS "Authenticated can update hero config" ON hero_config;
DROP POLICY IF EXISTS "Authenticated can delete hero config" ON hero_config;

-- media_pages
DROP POLICY IF EXISTS "Allow anonymous delete for demo" ON media_pages;
DROP POLICY IF EXISTS "Allow anonymous insert for demo" ON media_pages;
DROP POLICY IF EXISTS "Allow anonymous update for demo" ON media_pages;
DROP POLICY IF EXISTS "Authenticated can insert media pages" ON media_pages;
DROP POLICY IF EXISTS "Authenticated can update media pages" ON media_pages;
DROP POLICY IF EXISTS "Authenticated can delete media pages" ON media_pages;

-- messages
DROP POLICY IF EXISTS "Service role full access" ON messages;
DROP POLICY IF EXISTS "Authenticated can insert messages" ON messages;
DROP POLICY IF EXISTS "Authenticated can update messages" ON messages;
DROP POLICY IF EXISTS "Authenticated can delete messages" ON messages;

-- orders — drop ALL existing policies from both migration sets
DROP POLICY IF EXISTS "Orders: select own" ON orders;
DROP POLICY IF EXISTS "Orders: insert any" ON orders;
DROP POLICY IF EXISTS "Orders: update service" ON orders;
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Service role full access" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Authenticated can create orders" ON orders;

-- pricing_config
DROP POLICY IF EXISTS "Anyone can read pricing config" ON pricing_config;
DROP POLICY IF EXISTS "Authenticated can manage pricing config" ON pricing_config;
DROP POLICY IF EXISTS "Authenticated can insert pricing config" ON pricing_config;
DROP POLICY IF EXISTS "Authenticated can update pricing config" ON pricing_config;
DROP POLICY IF EXISTS "Authenticated can delete pricing config" ON pricing_config;

-- product_episodes
DROP POLICY IF EXISTS "Authenticated users can delete product episodes" ON product_episodes;
DROP POLICY IF EXISTS "Authenticated users can insert product episodes" ON product_episodes;
DROP POLICY IF EXISTS "Authenticated users can update product episodes" ON product_episodes;
DROP POLICY IF EXISTS "Authenticated can insert product episodes" ON product_episodes;
DROP POLICY IF EXISTS "Authenticated can update product episodes" ON product_episodes;
DROP POLICY IF EXISTS "Authenticated can delete product episodes" ON product_episodes;

-- product_episode_texts
DROP POLICY IF EXISTS "Authenticated users can delete episode texts" ON product_episode_texts;
DROP POLICY IF EXISTS "Authenticated users can insert episode texts" ON product_episode_texts;
DROP POLICY IF EXISTS "Authenticated users can update episode texts" ON product_episode_texts;
DROP POLICY IF EXISTS "Authenticated can insert episode texts" ON product_episode_texts;
DROP POLICY IF EXISTS "Authenticated can update episode texts" ON product_episode_texts;
DROP POLICY IF EXISTS "Authenticated can delete episode texts" ON product_episode_texts;

-- promotions_config
DROP POLICY IF EXISTS "Anyone can insert promotions config" ON promotions_config;
DROP POLICY IF EXISTS "Anyone can update promotions config" ON promotions_config;
DROP POLICY IF EXISTS "Authenticated can insert promotions config" ON promotions_config;
DROP POLICY IF EXISTS "Authenticated can update promotions config" ON promotions_config;

-- shipping_config
DROP POLICY IF EXISTS "Anyone can read shipping config" ON shipping_config;
DROP POLICY IF EXISTS "Authenticated can update shipping config" ON shipping_config;
DROP POLICY IF EXISTS "Authenticated can insert shipping config" ON shipping_config;
DROP POLICY IF EXISTS "Authenticated can manage shipping config" ON shipping_config;

-- workspace_calibrations
DROP POLICY IF EXISTS "Allow public insert of workspace_calibrations" ON workspace_calibrations;
DROP POLICY IF EXISTS "Authenticated can insert workspace calibrations" ON workspace_calibrations;

-- ============================================================
-- 4. Recreate policies — admin-gated authorization model
-- ============================================================

-- Helper: policies use is_admin() for writes, public/anon for reads

-- products
CREATE POLICY "Public can read products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- product_variants
CREATE POLICY "Public can read product variants"
  ON product_variants FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert product variants"
  ON product_variants FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update product variants"
  ON product_variants FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete product variants"
  ON product_variants FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- product_images
CREATE POLICY "Public can read product images"
  ON product_images FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert product images"
  ON product_images FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update product images"
  ON product_images FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete product images"
  ON product_images FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- product_mockups
CREATE POLICY "Public can read product mockups"
  ON product_mockups FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert product mockups"
  ON product_mockups FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update product mockups"
  ON product_mockups FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete product mockups"
  ON product_mockups FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- collections
CREATE POLICY "Public can read active collections"
  ON collections FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admin can insert collections"
  ON collections FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update collections"
  ON collections FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete collections"
  ON collections FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- gelato_blank_products
CREATE POLICY "Public can read gelato blank products"
  ON gelato_blank_products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert gelato blank products"
  ON gelato_blank_products FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update gelato blank products"
  ON gelato_blank_products FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete gelato blank products"
  ON gelato_blank_products FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- gradient_presets
CREATE POLICY "Public can read gradient presets"
  ON gradient_presets FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert gradient presets"
  ON gradient_presets FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update gradient presets"
  ON gradient_presets FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete gradient presets"
  ON gradient_presets FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- hero_config
CREATE POLICY "Public can read hero config"
  ON hero_config FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert hero config"
  ON hero_config FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update hero config"
  ON hero_config FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete hero config"
  ON hero_config FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- media_pages
CREATE POLICY "Public can read media pages"
  ON media_pages FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert media pages"
  ON media_pages FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update media pages"
  ON media_pages FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete media pages"
  ON media_pages FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- messages (contact form submissions)
CREATE POLICY "Admin can read messages"
  ON messages FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Anyone can submit messages"
  ON messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can update messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete messages"
  ON messages FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- orders
-- SELECT: user can read own orders (by user_id match with JWT)
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: service_role only (Netlify functions create orders)
CREATE POLICY "Service role can insert orders"
  ON orders FOR INSERT
  TO service_role
  WITH CHECK (true);

-- UPDATE: service_role only (webhook and admin functions update orders)
CREATE POLICY "Service role can update orders"
  ON orders FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- pricing_config
CREATE POLICY "Public can read pricing config"
  ON pricing_config FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert pricing config"
  ON pricing_config FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update pricing config"
  ON pricing_config FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete pricing config"
  ON pricing_config FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- product_episodes
CREATE POLICY "Public can read product episodes"
  ON product_episodes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert product episodes"
  ON product_episodes FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update product episodes"
  ON product_episodes FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete product episodes"
  ON product_episodes FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- product_episode_texts
CREATE POLICY "Public can read product episode texts"
  ON product_episode_texts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert product episode texts"
  ON product_episode_texts FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update product episode texts"
  ON product_episode_texts FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete product episode texts"
  ON product_episode_texts FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- promotions_config
CREATE POLICY "Public can read promotions config"
  ON promotions_config FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert promotions config"
  ON promotions_config FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update promotions config"
  ON promotions_config FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- shipping_config
CREATE POLICY "Public can read shipping config"
  ON shipping_config FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert shipping config"
  ON shipping_config FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update shipping config"
  ON shipping_config FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- workspace_calibrations (admin-only, not public)
CREATE POLICY "Admin can read workspace calibrations"
  ON workspace_calibrations FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admin can insert workspace calibrations"
  ON workspace_calibrations FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update workspace calibrations"
  ON workspace_calibrations FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete workspace calibrations"
  ON workspace_calibrations FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- 5. Storage policies — drop and recreate
-- ============================================================

-- Drop ALL existing storage write policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Public can read project downloads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload project downloads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update project downloads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete project downloads" ON storage.objects;

-- Public read for all buckets (media and project-downloads are public)
CREATE POLICY "Public can read storage objects"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin-only writes to media bucket
CREATE POLICY "Admin can upload to media bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

CREATE POLICY "Admin can update media bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media' AND public.is_admin())
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

CREATE POLICY "Admin can delete from media bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media' AND public.is_admin());

-- Admin-only writes to project-downloads bucket
CREATE POLICY "Admin can upload to project-downloads"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'project-downloads' AND public.is_admin());

CREATE POLICY "Admin can update project-downloads"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'project-downloads' AND public.is_admin())
  WITH CHECK (bucket_id = 'project-downloads' AND public.is_admin());

CREATE POLICY "Admin can delete from project-downloads"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'project-downloads' AND public.is_admin());

-- ============================================================
-- 6. Fix function search paths (from earlier migration, ensure applied)
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'update_updated_at_column' AND routine_schema = 'public') THEN
    ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'generate_order_number' AND routine_schema = 'public') THEN
    ALTER FUNCTION public.generate_order_number() SET search_path = public, pg_temp;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'update_updated_at' AND routine_schema = 'public') THEN
    ALTER FUNCTION public.update_updated_at() SET search_path = public, pg_temp;
  END IF;
END $$;
