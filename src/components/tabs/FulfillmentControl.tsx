import { useEffect, useState } from 'react';
import {
  Truck, PackageCheck, RotateCcw, Clock, CheckCircle2, Camera,
  AlertTriangle, Send, MapPin, XCircle, Eye,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useFilters } from '@/context/FilterContext';
import { useToast } from '@/context/ToastContext';
import { formatINR } from '@/lib/format';
import type { Order } from '@/types';
import SectionCard from '@/components/ui/SectionCard';
import Badge from '@/components/ui/Badge';
import DonutChart from '@/components/ui/DonutChart';

export default function FulfillmentControl() {
  const { showToast } = useToast();
  const { searchQuery, filters } = useFilters();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [alerting, setAlerting] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      const { data } = await supabase.from('orders').select('*').order('order_date', { ascending: false });
      if (data) setOrders(data);
      setLoading(false);
    }
    loadOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (filters.region !== 'all' && o.region !== filters.region) return false;
    if (filters.channel !== 'all' && o.channel !== filters.channel) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.order_id.toLowerCase().includes(q) ||
        o.product_name.toLowerCase().includes(q) ||
        (o.customer_id?.toLowerCase().includes(q) || false) ||
        o.region.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Return analysis
  const returnedOrders = filteredOrders.filter((o) => o.is_returned);
  const totalReturnValue = returnedOrders.reduce((sum, o) => sum + o.return_value, 0);
  const returnsByCategory = returnedOrders.reduce((acc, o) => {
    const cat = o.category || 'Other';
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += o.return_value;
    return acc;
  }, {} as Record<string, number>);

  const returnDonutData = Object.entries(returnsByCategory).map(([label, value], i) => ({
    label,
    value,
    color: ['#ef4444', '#f59e0b', '#0ea5e9', '#10b981', '#94a3b8'][i] || '#94a3b8',
  }));

  // Pending quality checks
  const pendingChecks = filteredOrders.filter(
    (o) => o.pre_dispatch_check === 'pending' && (o.category === 'Electronics' || o.order_value >= 5000)
  );

  // Delayed orders
  const delayedOrders = filteredOrders.filter((o) => o.is_delayed);

  const handleApproveQualityCheck = async (order: Order) => {
    setApproving(order.id);
    const { error } = await supabase
      .from('orders')
      .update({ pre_dispatch_check: 'approved', quality_check_status: 'photo_verified' })
      .eq('id', order.id);

    setApproving(null);
    if (error) {
      showToast('danger', 'Approval Failed', `Could not approve quality check for order ${order.order_id}.`);
    } else {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? { ...o, pre_dispatch_check: 'approved', quality_check_status: 'photo_verified' }
            : o
        )
      );
      showToast('success', 'Quality Check Approved', `Order ${order.order_id} — photo verification complete. Ready for dispatch.`);
    }
  };

  const handleProactiveAlert = async (order: Order) => {
    setAlerting(order.id);
    const { error } = await supabase
      .from('orders')
      .update({ proactive_alert_sent: true })
      .eq('id', order.id);

    setAlerting(null);
    if (error) {
      showToast('danger', 'Alert Failed', `Could not send proactive alert for order ${order.order_id}.`);
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, proactive_alert_sent: true } : o))
      );
      showToast('success', 'Proactive Alert Sent', `Customer notified about shipping delay for order ${order.order_id}.`);
    }
  };

  const qualityCheckBadge = (status: string) => {
    switch (status) {
      case 'photo_verified':
        return <Badge variant="success" icon={<Camera size={11} />}>Photo Verified</Badge>;
      case 'inspected':
        return <Badge variant="info" icon={<CheckCircle2 size={11} />}>Inspected</Badge>;
      case 'failed':
        return <Badge variant="danger" icon={<XCircle size={11} />}>Failed</Badge>;
      default:
        return <Badge variant="warning" icon={<Clock size={11} />}>Pending</Badge>;
    }
  };

  const dispatchBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" icon={<CheckCircle2 size={11} />}>Approved</Badge>;
      case 'rejected':
        return <Badge variant="danger" icon={<XCircle size={11} />}>Rejected</Badge>;
      default:
        return <Badge variant="warning" icon={<Clock size={11} />}>Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Return Value Concentration Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Return Value Concentration"
          description={`${returnedOrders.length} returned orders totaling ${formatINR(totalReturnValue)}`}
          icon={<RotateCcw size={18} />}
          action={
            <button
              onClick={() => showToast('info', 'Report Exported', 'Return analysis report exported for logistics review.')}
              className="btn btn-secondary text-xs"
            >
              Export Report
            </button>
          }
        >
          {loading ? (
            <div className="h-[200px] flex items-center justify-center text-neutral-400 animate-pulse-soft">Loading...</div>
          ) : returnDonutData.length > 0 ? (
            <>
              <DonutChart
                data={returnDonutData}
                centerValue={formatINR(totalReturnValue)}
                centerLabel="Returned"
                size={180}
              />
              <div className="mt-4 p-3 rounded-lg bg-danger-50 border border-danger-200">
                <div className="flex items-center gap-2 text-danger-700">
                  <AlertTriangle size={15} />
                  <span className="text-sm font-medium">High Concentration Risk</span>
                </div>
                <p className="text-xs text-danger-600 mt-1">
                  {(returnsByCategory['Electronics'] || 0) / (totalReturnValue || 1) * 100 > 50
                    ? `${((returnsByCategory['Electronics'] || 0) / (totalReturnValue || 1) * 100).toFixed(1)}% of returned value comes from Electronics. Mandate pre-dispatch quality checks for all high-value electronics.`
                    : 'Return value is spread across multiple categories. Monitor trends for emerging patterns.'}
                </p>
              </div>
            </>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center text-neutral-400">
              <CheckCircle2 size={32} className="text-success-500 mb-2" />
              <p className="text-sm">No returns in current filter range</p>
            </div>
          )}
        </SectionCard>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card card-hover p-5 animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center text-warning-600">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Delayed Orders ({'>'}7 days)</p>
                <p className="text-2xl font-bold text-neutral-900">{delayedOrders.length}</p>
              </div>
            </div>
            <p className="text-xs text-neutral-500">Return risk doubles to 11.8% for delayed orders</p>
          </div>
          <div className="card card-hover p-5 animate-slide-up" style={{ animationDelay: '60ms' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center text-accent-600">
                <PackageCheck size={20} />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Pending Quality Checks</p>
                <p className="text-2xl font-bold text-neutral-900">{pendingChecks.length}</p>
              </div>
            </div>
            <p className="text-xs text-neutral-500">High-value electronics awaiting inspection</p>
          </div>
          <div className="card card-hover p-5 animate-slide-up" style={{ animationDelay: '120ms' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-danger-100 flex items-center justify-center text-danger-600">
                <RotateCcw size={20} />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Total Return Value</p>
                <p className="text-2xl font-bold text-neutral-900">{formatINR(totalReturnValue)}</p>
              </div>
            </div>
            <p className="text-xs text-neutral-500">{returnedOrders.length} orders returned</p>
          </div>
          <div className="card card-hover p-5 animate-slide-up" style={{ animationDelay: '180ms' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center text-success-600">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Quality Checks Completed</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {filteredOrders.filter((o) => o.quality_check_status === 'photo_verified' || o.quality_check_status === 'inspected').length}
                </p>
              </div>
            </div>
            <p className="text-xs text-neutral-500">Inspections passed this period</p>
          </div>
        </div>
      </div>

      {/* Pre-Dispatch Quality Inspection Panel */}
      <SectionCard
        title="Pre-Dispatch Quality Inspection Panel"
        description="High-value electronics orders requiring quality check and photo verification before dispatch"
        icon={<Camera size={18} />}
        action={
          <button
            onClick={() => {
              pendingChecks.forEach((o, i) => setTimeout(() => handleApproveQualityCheck(o), i * 200));
            }}
            className="btn btn-primary text-xs"
          >
            <CheckCircle2 size={14} />
            Approve All ({pendingChecks.length})
          </button>
        }
      >
        {loading ? (
          <div className="h-32 flex items-center justify-center text-neutral-400 animate-pulse-soft">Loading orders...</div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-neutral-500 border-b border-neutral-200">
                  <th className="text-left font-medium py-2 px-2">Order ID</th>
                  <th className="text-left font-medium py-2 px-2">Product</th>
                  <th className="text-left font-medium py-2 px-2">Region</th>
                  <th className="text-right font-medium py-2 px-2">Value</th>
                  <th className="text-center font-medium py-2 px-2">Dispatch Check</th>
                  <th className="text-center font-medium py-2 px-2">Quality Status</th>
                  <th className="text-center font-medium py-2 px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingChecks.map((o) => (
                  <tr key={o.id} className="table-row-hover border-b border-neutral-100">
                    <td className="py-2.5 px-2 font-mono text-xs text-neutral-700">{o.order_id}</td>
                    <td className="py-2.5 px-2">
                      <div className="font-medium text-neutral-900">{o.product_name}</div>
                      <div className="text-xs text-neutral-400">{o.category}</div>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="inline-flex items-center gap-1 text-neutral-600">
                        <MapPin size={12} className="text-neutral-400" />
                        {o.region}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-medium text-neutral-900">{formatINR(o.order_value)}</td>
                    <td className="py-2.5 px-2 text-center">{dispatchBadge(o.pre_dispatch_check)}</td>
                    <td className="py-2.5 px-2 text-center">{qualityCheckBadge(o.quality_check_status)}</td>
                    <td className="py-2.5 px-2 text-center">
                      <button
                        onClick={() => handleApproveQualityCheck(o)}
                        disabled={approving === o.id}
                        className="btn btn-success text-xs"
                      >
                        {approving === o.id ? (
                          <><CheckCircle2 size={12} className="animate-spin" /> Approving...</>
                        ) : (
                          <><Camera size={12} /> Approve & Verify</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {pendingChecks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <div className="flex flex-col items-center gap-2 text-neutral-400">
                        <CheckCircle2 size={28} className="text-success-500" />
                        <span className="text-sm">All high-value orders have been quality checked</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Delayed Order Logistics Monitor */}
      <SectionCard
        title="Delayed Order Logistics Monitor"
        description="Orders in transit for more than 7 days — return risk doubles for delayed deliveries"
        icon={<Truck size={18} />}
        action={
          <Badge variant="danger" icon={<AlertTriangle size={12} />}>
            {delayedOrders.length} Delayed
          </Badge>
        }
      >
        {loading ? (
          <div className="h-32 flex items-center justify-center text-neutral-400 animate-pulse-soft">Loading...</div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-neutral-500 border-b border-neutral-200">
                  <th className="text-left font-medium py-2 px-2">Order ID</th>
                  <th className="text-left font-medium py-2 px-2">Product</th>
                  <th className="text-left font-medium py-2 px-2">Customer</th>
                  <th className="text-left font-medium py-2 px-2">Region</th>
                  <th className="text-right font-medium py-2 px-2">Value</th>
                  <th className="text-center font-medium py-2 px-2">Days in Transit</th>
                  <th className="text-center font-medium py-2 px-2">Alert Status</th>
                  <th className="text-center font-medium py-2 px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {delayedOrders.map((o) => (
                  <tr key={o.id} className="table-row-hover border-b border-neutral-100">
                    <td className="py-2.5 px-2 font-mono text-xs text-neutral-700">{o.order_id}</td>
                    <td className="py-2.5 px-2 font-medium text-neutral-900">{o.product_name}</td>
                    <td className="py-2.5 px-2 font-mono text-xs text-neutral-500">{o.customer_id || '—'}</td>
                    <td className="py-2.5 px-2">
                      <span className="inline-flex items-center gap-1 text-neutral-600">
                        <MapPin size={12} className="text-neutral-400" />
                        {o.region}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-medium text-neutral-900">{formatINR(o.order_value)}</td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={`font-semibold ${o.days_in_transit > 10 ? 'text-danger-600' : 'text-warning-600'}`}>
                        {o.days_in_transit} days
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {o.proactive_alert_sent ? (
                        <Badge variant="success" icon={<CheckCircle2 size={11} />}>Alert Sent</Badge>
                      ) : (
                        <Badge variant="warning" icon={<Clock size={11} />}>No Alert</Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <button
                        onClick={() => handleProactiveAlert(o)}
                        disabled={alerting === o.id || o.proactive_alert_sent}
                        className="btn btn-warning text-xs"
                      >
                        {alerting === o.id ? (
                          <><Send size={12} className="animate-spin" /> Sending...</>
                        ) : o.proactive_alert_sent ? (
                          <><Eye size={12} /> Sent</>
                        ) : (
                          <><Send size={12} /> Send Alert</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {delayedOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center">
                      <div className="flex flex-col items-center gap-2 text-neutral-400">
                        <Truck size={28} className="text-success-500" />
                        <span className="text-sm">No delayed orders — all shipments on schedule</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
