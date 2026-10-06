/*
# Create products and inventory table

1. New Tables
- `products`: Stores product/inventory data for the merchandising engine
  - `id` (uuid, primary key)
  - `sku` (text, unique, not null)
  - `product_name` (text, not null)
  - `category` (text, not null) - e.g. 'Electronics', 'Home', 'Personal Care', 'Accessories'
  - `sales_velocity` (numeric, not null) - units sold per week
  - `current_stock` (int, not null)
  - `safety_stock_threshold` (int, not null)
  - `unit_cost` (numeric, not null) - cost price in INR
  - `unit_price` (numeric, not null) - selling price in INR
  - `gross_margin_pct` (numeric) - gross margin percentage
  - `status` (text, default 'in_stock') - 'in_stock', 'low_stock', 'stockout', 'slow_mover'
  - `is_bundled` (boolean, default false) - whether product is part of a bundle
  - `bundle_partner` (text) - SKU of bundle partner if applicable
  - `region` (text, default 'All') - sales region
  - `created_at` (timestamptz)

2. Security
- Enable RLS on `products`.
- Allow anon + authenticated CRUD (single-tenant, no auth app).
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE NOT NULL,
  product_name text NOT NULL,
  category text NOT NULL,
  sales_velocity numeric NOT NULL DEFAULT 0,
  current_stock int NOT NULL DEFAULT 0,
  safety_stock_threshold int NOT NULL DEFAULT 0,
  unit_cost numeric NOT NULL DEFAULT 0,
  unit_price numeric NOT NULL DEFAULT 0,
  gross_margin_pct numeric DEFAULT 0,
  status text DEFAULT 'in_stock',
  is_bundled boolean DEFAULT false,
  bundle_partner text,
  region text DEFAULT 'All',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products
FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products
FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products
FOR DELETE
TO anon, authenticated USING (true);
