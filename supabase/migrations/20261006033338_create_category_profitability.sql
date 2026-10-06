/*
# Create category profitability table

1. New Tables
- `category_profitability`: Stores category-level profitability and marketing spend data
  - `id` (uuid, primary key)
  - `category_name` (text, not null)
  - `revenue` (numeric, not null)
  - `marketing_spend` (numeric, not null)
  - `gross_profit` (numeric, not null)
  - `net_profit` (numeric, not null)
  - `roas` (numeric)
  - `net_margin_pct` (numeric)
  - `sort_order` (int, default 0)
  - `created_at` (timestamptz)

2. Security
- Enable RLS on `category_profitability`.
- Allow anon + authenticated CRUD (single-tenant, no auth app).
*/

CREATE TABLE IF NOT EXISTS category_profitability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name text NOT NULL,
  revenue numeric NOT NULL,
  marketing_spend numeric NOT NULL,
  gross_profit numeric NOT NULL,
  net_profit numeric NOT NULL,
  roas numeric,
  net_margin_pct numeric,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE category_profitability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_category_profitability" ON category_profitability;
CREATE POLICY "anon_select_category_profitability" ON category_profitability FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_category_profitability" ON category_profitability;
CREATE POLICY "anon_insert_category_profitability" ON category_profitability
FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_category_profitability" ON category_profitability;
CREATE POLICY "anon_update_category_profitability" ON category_profitability
FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_category_profitability" ON category_profitability;
CREATE POLICY "anon_delete_category_profitability" ON category_profitability
FOR DELETE
TO anon, authenticated USING (true);
