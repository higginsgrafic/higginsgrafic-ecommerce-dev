-- Create the orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pendent',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  shipping_cost numeric(10,2) NOT NULL DEFAULT 0,
  iva numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  shipping_zone text DEFAULT 'es_peninsula',
  -- Shipping address
  first_name text,
  last_name text,
  address text,
  address2 text,
  city text,
  postal_code text,
  country text DEFAULT 'Espanya',
  phone text,
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for querying by user
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
-- Index for querying by email (for guest orders)
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
-- Index for querying by status
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
-- Index for sorting by date
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own orders
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  USING (
    auth.uid() = user_id
    OR email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Policy: Users can insert their own orders
CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR user_id IS NULL
  );

-- Policy: Users can update their own orders
CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  USING (
    auth.uid() = user_id
    OR email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Policy: Service role can do everything (for Netlify functions)
CREATE POLICY "Service role full access"
  ON orders FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Trigger to auto-generate order_number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS trigger AS $$
DECLARE
  next_seq bigint;
BEGIN
  SELECT nextval('order_number_seq') INTO next_seq;
  NEW.order_number := '#' || lpad(next_seq::text, 25, '0');
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Trigger
DROP TRIGGER IF EXISTS trigger_generate_order_number ON orders;
CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_orders_updated_at ON orders;
CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
