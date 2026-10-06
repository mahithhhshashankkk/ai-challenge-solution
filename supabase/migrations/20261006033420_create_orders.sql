/*
# Create orders and returns tables

1. New Tables
- `orders`: Stores order data for fulfillment monitoring
  - `id` (uuid, primary key)
  - `order_id` (text, unique, not null) - business order ID
  - `customer_id` (text) - reference to customer
  - `product_name` (text, not null)
  - `sku` (text)
  - `category` (text)
  - `order_value` (numeric, not null) - in INR
  - `region` (text, not null) - delivery region
  - `channel` (text, default 'Store') - 'Store', 'Website', 'Mobile App'
  - `order_date` (date, not null)
  - `days_in_transit` (int, default 0)
  - `is_delayed` (boolean, default false) - true if days_in_transit > 7
  - `pre_dispatch_check` (text, default 'pending') - 'pending', 'approved', 'rejected'
  - `quality_check_status` (text, default 'pending') - 'pending', 'photo_verified', 'inspected', 'failed'
  - `proactive_alert_sent` (boolean, default false)
  - `is_returned` (boolean, default false)
  - `return_value` (numeric, default 0) - value of returned item
  - `return_reason` (text)
  - `created_at` (timestamptz)

2. Security
- Enable RLS on `orders`.
- Allow anon + authenticated CRUD (single-tenant, no auth app).
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text UNIQUE NOT NULL,
  customer_id text,
  product_name text NOT NULL,
  sku text,
  category text,
  order_value numeric NOT NULL DEFAULT 0,
  region text NOT NULL DEFAULT 'North',
  channel text DEFAULT 'Store',
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  days_in_transit int DEFAULT 0,
  is_delayed boolean DEFAULT false,
  pre_dispatch_check text DEFAULT 'pending',
  quality_check_status text DEFAULT 'pending',
  proactive_alert_sent boolean DEFAULT false,
  is_returned boolean DEFAULT false,
  return_value numeric DEFAULT 0,
  return_reason text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders
FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_orders" ON orders;
CREATE POLICY "anon_update_orders" ON orders
FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_orders" ON orders;
CREATE POLICY "anon_delete_orders" ON orders
FOR DELETE
TO anon, authenticated USING (true);
