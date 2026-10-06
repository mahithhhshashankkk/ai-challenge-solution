/*
# Create executive alerts table

1. New Tables
- `executive_alerts`: Stores alert messages for the executive overview
  - `id` (uuid, primary key)
  - `alert_type` (text, not null) - 'warning', 'danger', 'info', 'success'
  - `title` (text, not null)
  - `description` (text, not null)
  - `recommended_action` (text)
  - `financial_impact` (text) - e.g. "₹12.67 Lakh at risk"
  - `is_active` (boolean, default true)
  - `sort_order` (int, default 0)
  - `created_at` (timestamptz)

2. Security
- Enable RLS on `executive_alerts`.
- Allow anon + authenticated CRUD (single-tenant, no auth app).
*/

CREATE TABLE IF NOT EXISTS executive_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  recommended_action text,
  financial_impact text,
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE executive_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_executive_alerts" ON executive_alerts;
CREATE POLICY "anon_select_executive_alerts" ON executive_alerts FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_executive_alerts" ON executive_alerts;
CREATE POLICY "anon_insert_executive_alerts" ON executive_alerts FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_executive_alerts" ON executive_alerts;
CREATE POLICY "anon_update_executive_alerts" ON executive_alerts FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_executive_alerts" ON executive_alerts;
CREATE POLICY "anon_delete_executive_alerts" ON executive_alerts FOR DELETE
TO anon, authenticated USING (true);
