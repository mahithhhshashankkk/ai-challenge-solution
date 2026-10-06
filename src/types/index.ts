export interface KPIMetric {
  id: string;
  metric_name: string;
  metric_label: string;
  metric_value: number;
  metric_unit: string | null;
  display_value: string | null;
  sort_order: number;
}

export interface ExecutiveAlert {
  id: string;
  alert_type: 'warning' | 'danger' | 'info' | 'success';
  title: string;
  description: string;
  recommended_action: string | null;
  financial_impact: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface CategoryProfitability {
  id: string;
  category_name: string;
  revenue: number;
  marketing_spend: number;
  gross_profit: number;
  net_profit: number;
  roas: number | null;
  net_margin_pct: number | null;
  sort_order: number;
}

export interface Product {
  id: string;
  sku: string;
  product_name: string;
  category: string;
  sales_velocity: number;
  current_stock: number;
  safety_stock_threshold: number;
  unit_cost: number;
  unit_price: number;
  gross_margin_pct: number;
  status: string;
  is_bundled: boolean;
  bundle_partner: string | null;
  region: string;
}

export interface Customer {
  id: string;
  customer_id: string;
  customer_name: string | null;
  age_group: string | null;
  tier: string;
  total_orders: number;
  total_revenue: number;
  total_profit: number;
  avg_order_value: number;
  days_inactive: number;
  is_at_risk: boolean;
  re_engagement_status: string;
  region: string;
  preferred_channel: string;
}

export interface Order {
  id: string;
  order_id: string;
  customer_id: string | null;
  product_name: string;
  sku: string | null;
  category: string | null;
  order_value: number;
  region: string;
  channel: string;
  order_date: string;
  days_in_transit: number;
  is_delayed: boolean;
  pre_dispatch_check: string;
  quality_check_status: string;
  proactive_alert_sent: boolean;
  is_returned: boolean;
  return_value: number;
  return_reason: string | null;
}

export interface DiscountElasticity {
  id: string;
  discount_pct: number;
  avg_margin_pct: number;
  avg_basket_size: number;
  order_count: number;
  sort_order: number;
}

export interface CustomerTierDistribution {
  id: string;
  tier_name: string;
  customer_count: number;
  total_profit: number;
  profit_share_pct: number;
  avg_profit_per_customer: number;
  description: string | null;
  sort_order: number;
}

export type TabKey = 'overview' | 'inventory' | 'vip' | 'fulfillment';

export interface GlobalFilters {
  channel: string;
  region: string;
  dateRange: string;
}

export type ActionType = 'restock' | 'clearance' | 're-engagement' | 'quality-check' | 'proactive-alert';

export interface ActionLog {
  id: string;
  action_type: ActionType;
  target_id: string;
  description: string;
  timestamp: string;
}
