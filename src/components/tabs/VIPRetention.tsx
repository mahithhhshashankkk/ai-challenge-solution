import { useEffect, useState } from 'react';
import {
  Crown, Users, Mail, MessageSquare, Target, Send, Star,
  TrendingUp, Clock, AlertTriangle, Gift, Search,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useFilters } from '@/context/FilterContext';
import { useToast } from '@/context/ToastContext';
import { formatINR, formatINRFull } from '@/lib/format';
import type { Customer, CustomerTierDistribution } from '@/types';
import SectionCard from '@/components/ui/SectionCard';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import DonutChart from '@/components/ui/DonutChart';

export default function VIPRetention() {
  const { showToast } = useToast();
  const { searchQuery, filters } = useFilters();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tierData, setTierData] = useState<CustomerTierDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaignModal, setCampaignModal] = useState<Customer | null>(null);
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [tableSearch, setTableSearch] = useState('');
  const [launching, setLaunching] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [custRes, tierRes] = await Promise.all([
        supabase.from('customers').select('*').order('total_profit', { ascending: false }),
        supabase.from('customer_tier_distribution').select('*').order('sort_order'),
      ]);
      if (custRes.data) setCustomers(custRes.data);
      if (tierRes.data) setTierData(tierRes.data);
      setLoading(false);
    }
    loadData();
  }, []);

  const atRiskVIPs = customers.filter((c) => c.tier === 'VIP' && c.is_at_risk);
  const activeVIPs = customers.filter((c) => c.tier === 'VIP' && !c.is_at_risk);

  const filteredCustomers = customers.filter((c) => {
    if (tierFilter !== 'all' && c.tier !== tierFilter) return false;
    const q = (searchQuery || tableSearch).toLowerCase();
    if (q) {
      return (
        c.customer_id.toLowerCase().includes(q) ||
        (c.customer_name?.toLowerCase().includes(q) || false) ||
        c.region.toLowerCase().includes(q) ||
        c.age_group?.toLowerCase().includes(q)
      );
    }
    if (filters.region !== 'all' && c.region !== filters.region) return false;
    return true;
  });

  const tierDonutData = tierData.map((t, i) => ({
    label: t.tier_name,
    value: t.total_profit,
    color: ['#0ea5e9', '#10b981', '#f59e0b', '#94a3b8'][i] || '#94a3b8',
  }));

  const totalTierProfit = tierData.reduce((sum, t) => sum + t.total_profit, 0) || 1;

  const handleLaunchReEngagement = async (customer: Customer) => {
    setLaunching(customer.id);
    const { error } = await supabase
      .from('customers')
      .update({ re_engagement_status: 'sent' })
      .eq('id', customer.id);

    setLaunching(null);
    if (error) {
      showToast('danger', 'Campaign Failed', `Could not launch re-engagement for ${customer.customer_name}.`);
    } else {
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, re_engagement_status: 'sent' } : c))
      );
      showToast('success', 'Re-engagement Launched', `Personalized campaign sent to ${customer.customer_name} (${customer.customer_id}).`);
    }
  };

  const tierBadge = (tier: string) => {
    switch (tier) {
      case 'VIP':
        return <Badge variant="accent" icon={<Crown size={11} />}>VIP</Badge>;
      case 'Growth':
        return <Badge variant="success" icon={<TrendingUp size={11} />}>Growth</Badge>;
      case 'Demographic Focus':
        return <Badge variant="warning" icon={<Target size={11} />}>Demo Focus</Badge>;
      default:
        return <Badge variant="neutral">Standard</Badge>;
    }
  };

  const engagementBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="info" icon={<Send size={11} />}>Sent</Badge>;
      case 'pending':
        return <Badge variant="warning" icon={<Clock size={11} />}>Pending</Badge>;
      case 'responded':
        return <Badge variant="success" icon={<MessageSquare size={11} />}>Responded</Badge>;
      case 'won_back':
        return <Badge variant="success" icon={<Star size={11} />}>Won Back</Badge>;
      default:
        return <Badge variant="neutral">No Action</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tier Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SectionCard
            title="Customer Tier Distribution"
            description="Profit contribution by segment"
            icon={<Users size={18} />}
          >
            {loading ? (
              <div className="h-[200px] flex items-center justify-center text-neutral-400 animate-pulse-soft">Loading...</div>
            ) : (
              <>
                <DonutChart
                  data={tierDonutData}
                  centerValue={formatINR(totalTierProfit)}
                  centerLabel="Total Profit"
                />
                <div className="mt-4 space-y-2">
                  {tierData.map((t, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: tierDonutData[i].color }} />
                        <span className="text-neutral-600">{t.tier_name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-neutral-900">{t.customer_count}</span>
                        <span className="text-xs text-neutral-400 ml-1">customers</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </SectionCard>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tierData.map((tier, i) => (
            <div key={i} className="card card-hover p-5 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {tier.tier_name === 'VIP' && <Crown size={18} className="text-accent-500" />}
                  {tier.tier_name === 'Growth' && <TrendingUp size={18} className="text-success-500" />}
                  {tier.tier_name === 'Demographic Focus' && <Target size={18} className="text-warning-500" />}
                  {tier.tier_name === 'Standard' && <Users size={18} className="text-neutral-400" />}
                  <h4 className="text-sm font-semibold text-neutral-900">{tier.tier_name}</h4>
                </div>
                <Badge variant="neutral">{tier.customer_count}</Badge>
              </div>
              {tier.description && <p className="text-xs text-neutral-500 mb-3">{tier.description}</p>}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Total Profit</span>
                  <span className="font-semibold text-neutral-900">{formatINR(tier.total_profit)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Profit Share</span>
                  <span className="font-semibold text-accent-600">{tier.profit_share_pct.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Avg / Customer</span>
                  <span className="font-semibold text-success-600">{formatINR(tier.avg_profit_per_customer)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* At-Risk VIP Win-Back Summary */}
      <SectionCard
        title="At-Risk VIP Win-Back Module"
        description={`${atRiskVIPs.length} dormant VIP customers (inactive >180 days) with ${formatINR(atRiskVIPs.reduce((s, c) => s + c.total_profit, 0))} profit at risk`}
        icon={<AlertTriangle size={18} />}
        action={
          <button
            onClick={() => {
              atRiskVIPs.forEach((c, i) => {
                if (c.re_engagement_status === 'none') {
                  setTimeout(() => handleLaunchReEngagement(c), i * 200);
                }
              });
            }}
            className="btn btn-danger text-xs"
          >
            <Send size={14} />
            Launch All ({atRiskVIPs.filter((c) => c.re_engagement_status === 'none').length})
          </button>
        }
      >
        {/* Tier filter + search */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-100">
            {['all', 'VIP', 'Growth', 'Demographic Focus', 'Standard'].map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  tierFilter === t ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {t === 'all' ? 'All Tiers' : t}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Search by ID, name, region..."
              className="input pl-9 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-neutral-400 animate-pulse-soft">Loading customer data...</div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-neutral-500 border-b border-neutral-200">
                  <th className="text-left font-medium py-2 px-2">Customer</th>
                  <th className="text-left font-medium py-2 px-2">Age</th>
                  <th className="text-left font-medium py-2 px-2">Tier</th>
                  <th className="text-right font-medium py-2 px-2">Orders</th>
                  <th className="text-right font-medium py-2 px-2">Profit</th>
                  <th className="text-right font-medium py-2 px-2">Inactive</th>
                  <th className="text-center font-medium py-2 px-2">Status</th>
                  <th className="text-center font-medium py-2 px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.slice(0, 20).map((c) => (
                  <tr key={c.id} className="table-row-hover border-b border-neutral-100">
                    <td className="py-2.5 px-2">
                      <div className="font-medium text-neutral-900">{c.customer_name}</div>
                      <div className="text-xs text-neutral-400 font-mono">{c.customer_id}</div>
                    </td>
                    <td className="py-2.5 px-2 text-neutral-600">{c.age_group || '—'}</td>
                    <td className="py-2.5 px-2">{tierBadge(c.tier)}</td>
                    <td className="py-2.5 px-2 text-right text-neutral-700">{c.total_orders}</td>
                    <td className="py-2.5 px-2 text-right font-medium text-neutral-900">{formatINR(c.total_profit)}</td>
                    <td className="py-2.5 px-2 text-right">
                      <span className={c.days_inactive > 180 ? 'font-semibold text-danger-600' : c.days_inactive > 90 ? 'text-warning-600' : 'text-neutral-600'}>
                        {c.days_inactive}d
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center">{engagementBadge(c.re_engagement_status)}</td>
                    <td className="py-2.5 px-2 text-center">
                      {c.is_at_risk && c.re_engagement_status === 'none' ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setCampaignModal(c)}
                            className="btn btn-secondary text-xs"
                          >
                            <Mail size={12} /> Preview
                          </button>
                          <button
                            onClick={() => handleLaunchReEngagement(c)}
                            disabled={launching === c.id}
                            className="btn btn-primary text-xs"
                          >
                            {launching === c.id ? <Send size={12} className="animate-spin" /> : <Send size={12} />}
                            Launch
                          </button>
                        </div>
                      ) : c.re_engagement_status === 'sent' ? (
                        <button
                          onClick={() => setCampaignModal(c)}
                          className="btn btn-secondary text-xs"
                        >
                          <Mail size={12} /> View
                        </button>
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-neutral-400">No customers found matching filters</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Campaign Configuration Modal */}
      <Modal
        open={!!campaignModal}
        onClose={() => setCampaignModal(null)}
        title="Re-Engagement Campaign Preview"
        description={campaignModal ? `Personalized offer for ${campaignModal.customer_name}` : ''}
        maxWidth="max-w-xl"
        footer={
          <>
            <button onClick={() => setCampaignModal(null)} className="btn btn-secondary">Close</button>
            {campaignModal && campaignModal.re_engagement_status === 'none' && (
              <button
                onClick={() => {
                  handleLaunchReEngagement(campaignModal);
                  setCampaignModal(null);
                }}
                className="btn btn-primary"
              >
                <Send size={16} /> Launch Campaign
              </button>
            )}
          </>
        }
      >
        {campaignModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-neutral-50">
                <p className="text-xs text-neutral-500">Customer ID</p>
                <p className="text-sm font-medium text-neutral-900 font-mono">{campaignModal.customer_id}</p>
              </div>
              <div className="p-3 rounded-lg bg-neutral-50">
                <p className="text-xs text-neutral-500">Lifetime Profit</p>
                <p className="text-sm font-semibold text-success-600">{formatINRFull(campaignModal.total_profit)}</p>
              </div>
              <div className="p-3 rounded-lg bg-neutral-50">
                <p className="text-xs text-neutral-500">Days Inactive</p>
                <p className="text-sm font-semibold text-danger-600">{campaignModal.days_inactive} days</p>
              </div>
              <div className="p-3 rounded-lg bg-neutral-50">
                <p className="text-xs text-neutral-500">Preferred Channel</p>
                <p className="text-sm font-medium text-neutral-900">{campaignModal.preferred_channel}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-neutral-200 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Gift size={16} className="text-accent-500" />
                <span className="text-sm font-semibold text-neutral-900">Personalized Offer Preview</span>
              </div>
              <div className="space-y-2 text-sm text-neutral-600">
                <p className="font-medium text-neutral-900">Subject: We miss you, {campaignModal.customer_name} — Your exclusive VIP access awaits</p>
                <p>
                  Dear {campaignModal.customer_name}, we've noticed you haven't visited NovaMart in {campaignModal.days_inactive} days.
                  As one of our most valued {campaignModal.tier} customers, we'd like to offer you:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-neutral-600">
                  <li>Exclusive early access to new arrivals in your preferred category</li>
                  <li>A dedicated loyalty bundle curated based on your purchase history</li>
                  <li>Free priority shipping on your next order (no minimum)</li>
                  <li>Personal shopping assistance via your preferred channel: {campaignModal.preferred_channel}</li>
                </ul>
                <p className="text-xs text-neutral-400 mt-2">
                  This is a personalized offer — not a generic storewide markdown. Your continued loyalty means everything to us.
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
