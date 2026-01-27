/*
  # Afegir camp product_type per separar productes mockup de fulfillment

  1. Canvis
    - Afegir columna `product_type` a la taula `products`
    - Valors permesos: 'mockup' o 'fulfillment'
    - Per defecte: 'mockup' (per compatibilitat amb productes existents)
  
  2. Raonament
    - Les pàgines de col·leccions (Austen, First Contact, etc.) només mostraran productes 'mockup'
    - FulfillmentSettingsPage només treballarà amb productes 'fulfillment'
    - Això permet treballar en els mockups sense que les dades de Gelato els afectin
*/

-- Afegir columna product_type si no existeix
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'product_type'
  ) THEN
    ALTER TABLE products ADD COLUMN product_type text DEFAULT 'mockup' CHECK (product_type IN ('mockup', 'fulfillment'));
  END IF;
END $$;

-- Crear índex per millorar les consultes filtrades per tipus
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);

-- Crear índex compost per col·lecció i tipus
CREATE INDEX IF NOT EXISTS idx_products_collection_type ON products(collection, product_type);