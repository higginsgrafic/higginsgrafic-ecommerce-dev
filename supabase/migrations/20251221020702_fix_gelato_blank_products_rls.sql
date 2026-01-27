/*
  # Fix RLS policies for gelato_blank_products

  Ajustar les polítiques d'RLS per permetre que scripts automàtics puguin guardar dades
  de referència dels productes en blanc de Gelato.

  1. Changes
    - Permetre INSERT, UPDATE, DELETE a qualsevol (anònim o autenticat)
    - Aquestes són dades de referència pública de Gelato
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can insert blank products" ON gelato_blank_products;
DROP POLICY IF EXISTS "Authenticated users can update blank products" ON gelato_blank_products;
DROP POLICY IF EXISTS "Authenticated users can delete blank products" ON gelato_blank_products;

-- New policies: Allow anyone to manage these reference records
CREATE POLICY "Anyone can insert blank products"
  ON gelato_blank_products
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update blank products"
  ON gelato_blank_products
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete blank products"
  ON gelato_blank_products
  FOR DELETE
  USING (true);
