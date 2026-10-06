/*
# Create discount elasticity and tier distribution tables

1. New Tables
- `discount_elasticity`: Stores discount vs. margin data points for the elasticity curve
  - `id` (uuid, primary key)
  - `discount_pct` (numeric, not null) - discount percentage band
  - `avg_margin_pct` (numeric, not null) - resulting average margin
  - `avg_basket_size` (numeric, not null) - average basket size in INR
  - `order_count` (int, not null) - number of orders in this band
  - `sort_order` (int, default 0)
  - `created_at` (timestamptz)

- `customer_tier_distribution`: Stores customer tier summary data
  - `id` (uuid, primary key)
  - `tier_name` (text, not null) - 'VIP', 'Growth', 'Demographic Focus', 'Standard'
  - `customer_count` (int, not null)
  - `total_profit` (numeric, not null) - total profit contribution in INR
  - `profit_share_pct` (numeric, not null) - share of total profit
  - `avg_profit_per_customer` (numeric, not null)
  - `description` (text)
  - `sort_order` (int, default 0)
  - `created_at` (timestamptz)

2. Security
- Enable RLS on both tables.
- Allow anon + authenticated CRUD (single-tenant, no auth app).
*/

CREATE TABLE IF NOT EXISTS discount_elasticity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_pct numeric NOT NULL,
  avg_margin_pct numeric NOT NULL,
  avg_basket_size numeric NOT NULL,
  order_count int NOT NULL DEFAULT 0,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE discount_elasticity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_discount_elasticity" ON discount_elasticity;
CREATE POLICY "anon_select_discount_elasticity" ON discount_elasticity FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_discount_elasticity" ON discount_elasticity;
CREATE POLICY "anon_insert_discount_elasticity" ON discount_elasticity
FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_discount_elasticity" ON discount_elasticity;
CREATE POLICY "anon_update_discount_elasticity" ON discount_elasticity
FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_discount_elasticity" ON discount_elasticity;
CREATE POLICY "anon_delete_discount_elasticity" ON discount_elasticity
FOR DELETE
TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS customer_tier_distribution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name text NOT NULL,
  customer_count int NOT NULL DEFAULT 0,
  total_profit numeric NOT NULL DEFAULT 0,
  profit_share_pct numeric NOT NULL DEFAULT 0,
  avg_profit_per_customer numeric NOT NULL DEFAULT 0,
  description text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customer_tier_distribution ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_customer_tier_distribution" ON customer_tier_distribution;
CREATE POLICY "anon_select_customer_tier_distribution" ON customer_tier_distribution FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_customer_tier_distribution" ON customer_tier_distribution;
CREATE POLICY "anon_insert_customer_tier_distribution" ON customer_tier_distribution
FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_customer_tier_distribution" ON customer_tier_distribution;
CREATE POLICY "anon_update_customer_tier_distribution" ON customer_tier_distribution
FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_customer_tier_distribution" ON customer_tier_distribution;
CREATE POLICY "anon_delete_customer_tier_distribution" ON customer_tier_distribution
FOR DELETE
TO anon, authenticated USING (true);
