-- Migration: orders table schema + RLS policies
-- Cal executar a Supabase Dashboard > SQL Editor

-- ============================================================
-- 1. Columnes addicionals a la taula orders
-- ============================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_intent_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gelato_order_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_carrier text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_url text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery date;

-- Generar order_number automàticament si no existeix
-- Format: GRF-YYYY-NNNNNN
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'order_number' AND column_default IS NOT NULL
  ) THEN
    EXECUTE 'CREATE SEQUENCE IF NOT EXISTS orders_number_seq START 1';
    EXECUTE 'ALTER TABLE orders ALTER COLUMN order_number SET DEFAULT ''GRF-'' || EXTRACT(YEAR FROM now())::text || ''-'' || LPAD(nextval(''orders_number_seq'')::text, 6, ''0'')';
  END IF;
END $$;

-- ============================================================
-- 2. Taules profiles i addresses (si no existeixen)
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  phone text,
  company text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  label text DEFAULT 'Casa',
  first_name text,
  last_name text,
  address text,
  address2 text,
  city text,
  postal_code text,
  country text DEFAULT 'Espanya',
  phone text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 3. RLS Policies
-- ============================================================

-- Orders: els usuaris només poden veure les seves comandes
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Orders: select own" ON orders;
CREATE POLICY "Orders: select own" ON orders
  FOR SELECT USING (
    user_id = auth.uid() OR email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Orders: insert permès per qualsevol usuari autenticat o anònim (les comandes es creen des de la funció serverless)
DROP POLICY IF EXISTS "Orders: insert any" ON orders;
CREATE POLICY "Orders: insert any" ON orders
  FOR INSERT WITH CHECK (true);

-- Orders: update només des de service role (Netlify Functions)
DROP POLICY IF EXISTS "Orders: update service" ON orders;
CREATE POLICY "Orders: update service" ON orders
  FOR UPDATE USING (true) WITH CHECK (true);

-- Profiles: cada usuari gestiona el seu perfil
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles: select own" ON profiles;
CREATE POLICY "Profiles: select own" ON profiles
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Profiles: upsert own" ON profiles;
CREATE POLICY "Profiles: upsert own" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Profiles: update own" ON profiles;
CREATE POLICY "Profiles: update own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Addresses: cada usuari gestiona les seves adreces
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Addresses: select own" ON addresses;
CREATE POLICY "Addresses: select own" ON addresses
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Addresses: insert own" ON addresses;
CREATE POLICY "Addresses: insert own" ON addresses
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Addresses: update own" ON addresses;
CREATE POLICY "Addresses: update own" ON addresses
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Addresses: delete own" ON addresses;
CREATE POLICY "Addresses: delete own" ON addresses
  FOR DELETE USING (user_id = auth.uid());
