/*
# Create KPI metrics table for Executive Overview

1. New Tables
- `kpi_metrics`: Stores aggregate KPI values for the executive dashboard
  - `id` (uuid, primary key)
  - `metric_name` (text, not null) - e.g. 'total_revenue', 'net_contribution_margin', 'active_vip_count', 'at_risk_profit_revenue'
  - `metric_label` (text, not null) - display label
  - `metric_value` (numeric, not null) - raw numeric value
  - `metric_unit` (text) - e.g. 'INR', '%', 'count'
  - `display_value` (text) - formatted display string e.g. "₹2.28 Cr"
  - `sort_order` (int, default 0) - ordering for KPI ribbon
  - `created_at` (timestamptz)

2. Security
- Enable RLS on `kpi_metrics`.
- Allow anon + authenticated CRUD (single-tenant, no auth app, data is intentionally shared).
*/

CREATE TABLE IF NOT EXISTS kpi_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_label text NOT NULL,
  metric_value numeric NOT NULL,
  metric_unit text,
  display_value text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE kpi_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_kpi_metrics" ON kpi_metrics;
CREATE POLICY "anon_select_kpi_metrics" ON kpi_metrics FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_kpi_metrics" ON kpi_metrics;
CREATE POLICY "anon_insert_kpi_metrics" ON kpi_metrics FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_kpi_metrics" ON kpi_metrics;
CREATE POLICY "anon_update_kpi_metrics" ON kpi_metrics FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_kpi_metrics" ON kpi_metrics;
CREATE POLICY "anon_delete_kpi_metrics" ON kpi_metrics FOR DELETE
TO anon, authenticated USING (true);
