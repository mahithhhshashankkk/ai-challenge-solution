/*
# Create customers table for VIP retention

1. New Tables
- `customers`: Stores customer segmentation and retention data
  - `id` (uuid, primary key)
  - `customer_id` (text, unique, not null) - business customer ID e.g. 'NM-VIP-001'
  - `customer_name` (text)
  - `age_group` (text) - e.g. '25-34', '35-44', '45-54', '55+'
  - `tier` (text, not null) - 'VIP', 'Growth', 'Standard', 'Demographic Focus'
  - `total_orders` (int, default 0)
  - `total_revenue` (numeric, default 0) - lifetime revenue in INR
  - `total_profit` (numeric, default 0) - lifetime profit contribution in INR
  - `avg_order_value` (numeric, default 0)
  - `days_inactive` (int, default 0) - days since last purchase
  - `is_at_risk` (boolean, default false) - flagged if days_inactive > 180
  - `re_engagement_status` (text, default 'none') - 'none', 'pending', 'sent', 'responded', 'won_back'
  - `region` (text, default 'All')
  - `preferred_channel` (text, default 'Store') - 'Store', 'Website', 'Mobile App'
  - `created_at` (timestamptz)

2. Security
- Enable RLS on `customers`.
- Allow anon + authenticated CRUD (single-tenant, no auth app).
*/

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text UNIQUE NOT NULL,
  customer_name text,
  age_group text,
  tier text NOT NULL DEFAULT 'Standard',
  total_orders int DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  total_profit numeric DEFAULT 0,
  avg_order_value numeric DEFAULT 0,
  days_inactive int DEFAULT 0,
  is_at_risk boolean DEFAULT false,
  re_engagement_status text DEFAULT 'none',
  region text DEFAULT 'All',
  preferred_channel text DEFAULT 'Store',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_customers" ON customers;
CREATE POLICY "anon_select_customers" ON customers FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_customers" ON customers;
CREATE POLICY "anon_insert_customers" ON customers
FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_customers" ON customers;
CREATE POLICY "anon_update_customers" ON customers
FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_customers" ON customers;
CREATE POLICY "anon_delete_customers" ON customers
FOR DELETE
TO anon, authenticated USING (true);
