import { useEffect, useState } from 'react';
import {
  TrendingUp, DollarSign, Users, AlertTriangle, Crown, BarChart3,
  Percent, ArrowRight, Lightbulb, Target, Zap,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { formatINR } from '@/lib/format';
import type {
  ExecutiveAlert, CategoryProfitability, DiscountElasticity,
} from '@/types';
import KPICard from '@/components/ui/KPICard';
import SectionCard from '@/components/ui/SectionCard';
import BarChart from '@/components/ui/BarChart';
import LineChart from '@/components/ui/LineChart';
import Badge from '@/components/ui/Badge';

export default function ExecutiveOverview() {
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState<ExecutiveAlert[]>([]);
  const [categories, setCategories] = useState<CategoryProfitability[]>([]);
  const [elasticity, setElasticity] = useState<DiscountElasticity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [alertRes, catRes, elasticRes] = await Promise.all([
        supabase.from('executive_alerts').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('category_profitability').select('*').order('sort_order'),
        supabase.from('discount_elasticity').select('*').order('sort_order'),
      ]);

      if (alertRes.data) setAlerts(alertRes.data);
      if (catRes.data) setCategories(catRes.data);
      if (elasticRes.data) setElasticity(elasticRes.data);
      setLoading(false);
    }
    loadData();
  }, []);

  const kpiCards = [
    { label: 'Total Revenue', value: '₹2.28 Cr', icon: <DollarSign size={20} />, accent: 'accent' as const, trend: '+8.2% vs last period', trendDirection: 'up' as const },
    { label: 'Net Contribution Margin', value: '11.49%', icon: <Percent size={20} />, accent: 'success' as const, trend: '₹26.22 L net profit', trendDirection: 'up' as const },
    { label: 'Active VIP Customers', value: '124', icon: <Crown size={20} />, accent: 'primary' as const, trend: '63.8% of total profit', trendDirection: 'up' as const },
    { label: 'At-Risk Profit Revenue', value: '₹12.67 L', icon: <AlertTriangle size={20} />, accent: 'warning' as const, trend: '12 dormant VIPs', trendDirection: 'down' as const },
  ];

  const categoryBarData = categories.map((c) => ({
    label: c.category_name,
    value: c.net_profit,
    secondaryValue: c.marketing_spend,
    color: c.net_profit > 0 ? '#0ea5e9' : '#ef4444',
    secondaryColor: '#94a3b8',
  }));

  const elasticityLineData = elasticity.map((e) => ({
    label: `${e.discount_pct}%`,
    primary: e.avg_margin_pct,
    secondary: (e.avg_basket_size / 11200) * 16.63,
  }));

  const alertStyles = {
    danger: { bg: 'bg-danger-50', border: 'border-danger-200', icon: 'text-danger-600', iconBg: 'bg-danger-100' },
    warning: { bg: 'bg-warning-50', border: 'border-warning-200', icon: 'text-warning-600', iconBg: 'bg-warning-100' },
    info: { bg: 'bg-accent-50', border: 'border-accent-200', icon: 'text-accent-600', iconBg: 'bg-accent-100' },
    success: { bg: 'bg-success-50', border: 'border-success-200', icon: 'text-success-600', iconBg: 'bg-success-100' },
  };

  return (
    <div className="space-y-6">
      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <div key={i} style={{ animationDelay: `${i * 60}ms` }} className="animate-slide-up">
            <KPICard
              label={kpi.label}
              value={kpi.value}
              icon={kpi.icon}
              accentColor={kpi.accent}
              trend={kpi.trend}
              trendDirection={kpi.trendDirection}
            />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Category Profitability vs Marketing Spend"
          description="Net profit compared to ad spend by category"
          icon={<BarChart3 size={18} />}
          action={
            <button
              onClick={() => showToast('info', 'Report Exported', 'Category profitability report has been exported for review.')}
              className="btn btn-secondary text-xs"
            >
              Export Report
            </button>
          }
        >
          {loading ? (
            <div className="h-[240px] flex items-center justify-center text-neutral-400">
              <div className="animate-pulse-soft">Loading chart data...</div>
            </div>
          ) : (
            <BarChart
              data={categoryBarData}
              formatValue={formatINR}
              showSecondary
              primaryLabel="Net Profit"
              secondaryLabel="Marketing Spend"
              height={240}
            />
          )}
        </SectionCard>

        <SectionCard
          title="Discount vs Margin Elasticity"
          description="Profit margin drops sharply beyond 20% discount threshold"
          icon={<TrendingUp size={18} />}
          action={
            <button
              onClick={() => showToast('info', 'Report Exported', 'Discount elasticity analysis has been exported.')}
              className="btn btn-secondary text-xs"
            >
              Export Report
            </button>
          }
        >
          {loading ? (
            <div className="h-[240px] flex items-center justify-center text-neutral-400">
              <div className="animate-pulse-soft">Loading chart data...</div>
            </div>
          ) : (
            <LineChart
              data={elasticityLineData}
              formatValue={(v) => `${v.toFixed(1)}%`}
              primaryLabel="Avg Margin %"
              secondaryLabel="Basket Size Index"
              height={240}
            />
          )}
        </SectionCard>
      </div>

      {/* Executive Alerts */}
      <SectionCard
        title="Executive Alerts"
        description="Critical business signals requiring immediate attention"
        icon={<Zap size={18} />}
        action={
          <Badge variant="danger" icon={<AlertTriangle size={12} />}>
            {alerts.length} Active
          </Badge>
        }
      >
        <div className="space-y-3">
          {alerts.map((alert) => {
            const style = alertStyles[alert.alert_type];
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-4 p-4 rounded-xl border ${style.bg} ${style.border} animate-slide-up`}
              >
                <div className={`w-10 h-10 rounded-lg ${style.iconBg} flex items-center justify-center shrink-0 ${style.icon}`}>
                  <AlertTriangle size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <h4 className="text-sm font-semibold text-neutral-900">{alert.title}</h4>
                    {alert.financial_impact && (
                      <Badge variant={alert.alert_type === 'danger' ? 'danger' : alert.alert_type === 'warning' ? 'warning' : 'info'}>
                        {alert.financial_impact}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 mt-1">{alert.description}</p>
                  {alert.recommended_action && (
                    <div className="flex items-start gap-2 mt-2 p-2.5 rounded-lg bg-white/60">
                      <Lightbulb size={15} className="text-warning-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-neutral-700">
                        <span className="font-medium">Recommended: </span>
                        {alert.recommended_action}
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => showToast('success', 'Action Initiated', 'The recommended action has been queued for execution.')}
                  className="btn btn-primary text-xs shrink-0"
                >
                  Take Action
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Quick stats footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center text-success-600 shrink-0">
            <Target size={24} />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Highest ROAS Category</p>
            <p className="text-lg font-semibold text-neutral-900">Home — 12.38x</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-danger-100 flex items-center justify-center text-danger-600 shrink-0">
            <TrendingUp size={24} className="rotate-180" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Lowest Margin Category</p>
            <p className="text-lg font-semibold text-neutral-900">Personal Care — -16.8%</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center text-accent-600 shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Best Profit Demographic</p>
            <p className="text-lg font-semibold text-neutral-900">Ages 45-54 — ₹6,094/customer</p>
          </div>
        </div>
      </div>
    </div>
  );
}
