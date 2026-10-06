import { useEffect, useState } from 'react';
import {
  Package, Boxes, RefreshCw, Plus, Calculator, Trash2, Tag,
  Layers, AlertTriangle, TrendingDown, PackageCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useFilters } from '@/context/FilterContext';
import { useToast } from '@/context/ToastContext';
import { formatINR } from '@/lib/format';
import type { Product } from '@/types';
import SectionCard from '@/components/ui/SectionCard';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

export default function InventoryMerchandising() {
  const { showToast } = useToast();
  const { searchQuery } = useFilters();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [restocking, setRestocking] = useState<string | null>(null);
  const [clearanceModal, setClearanceModal] = useState<Product | null>(null);
  const [bundleModal, setBundleModal] = useState(false);
  const [bundleItems, setBundleItems] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const { data } = await supabase.from('products').select('*').order('sales_velocity', { ascending: false });
      if (data) setProducts(data);
      setLoading(false);
    }
    loadProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.sku.toLowerCase().includes(q) ||
      p.product_name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const lowStockItems = filteredProducts.filter(
    (p) => p.current_stock <= p.safety_stock_threshold && p.status !== 'slow_mover'
  );
  const slowMovers = filteredProducts.filter((p) => p.status === 'slow_mover');
  const inStockItems = filteredProducts.filter(
    (p) => p.current_stock > p.safety_stock_threshold && p.status !== 'slow_mover'
  );

  const handleRestock = async (product: Product) => {
    setRestocking(product.id);
    const reorderQty = Math.ceil(product.safety_stock_threshold * 3);
    const { error } = await supabase
      .from('products')
      .update({ current_stock: product.current_stock + reorderQty, status: 'in_stock' })
      .eq('id', product.id);

    setRestocking(null);
    if (error) {
      showToast('danger', 'Restock Failed', `Could not trigger restock for ${product.product_name}.`);
    } else {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, current_stock: p.current_stock + reorderQty, status: 'in_stock' }
            : p
        )
      );
      showToast('success', 'Auto-Restock Triggered', `${reorderQty} units of ${product.product_name} ordered successfully.`);
    }
  };

  const handleClearance = async (discount: number) => {
    if (!clearanceModal) return;
    const { error } = await supabase
      .from('products')
      .update({
        unit_price: clearanceModal.unit_price * (1 - discount / 100),
        status: 'in_stock',
      })
      .eq('id', clearanceModal.id);

    if (error) {
      showToast('danger', 'Clearance Failed', `Could not apply clearance pricing for ${clearanceModal.product_name}.`);
    } else {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === clearanceModal.id
            ? { ...p, unit_price: p.unit_price * (1 - discount / 100), status: 'in_stock' }
            : p
        )
      );
      showToast('success', 'Clearance Pricing Applied', `${discount}% discount applied to ${clearanceModal.product_name}.`);
    }
    setClearanceModal(null);
  };

  const addToBundle = (product: Product) => {
    if (bundleItems.length >= 4) {
      showToast('warning', 'Bundle Full', 'A maximum of 4 products can be bundled together.');
      return;
    }
    if (bundleItems.find((p) => p.id === product.id)) {
      showToast('warning', 'Already Added', `${product.product_name} is already in the bundle.`);
      return;
    }
    setBundleItems((prev) => [...prev, product]);
  };

  const removeFromBundle = (id: string) => {
    setBundleItems((prev) => prev.filter((p) => p.id !== id));
  };

  const bundleCost = bundleItems.reduce((sum, p) => sum + p.unit_cost, 0);
  const bundlePrice = bundleItems.reduce((sum, p) => sum + p.unit_price, 0);
  const bundleMargin = bundlePrice > 0 ? ((bundlePrice - bundleCost) / bundlePrice) * 100 : 0;
  const suggestedBundlePrice = bundlePrice * 0.9;

  const statusBadge = (status: string) => {
    switch (status) {
      case 'low_stock':
        return <Badge variant="warning" icon={<AlertTriangle size={11} />}>Low Stock</Badge>;
      case 'stockout':
        return <Badge variant="danger" icon={<AlertTriangle size={11} />}>Stockout</Badge>;
      case 'slow_mover':
        return <Badge variant="neutral" icon={<TrendingDown size={11} />}>Slow Mover</Badge>;
      default:
        return <Badge variant="success" icon={<PackageCheck size={11} />}>In Stock</Badge>;
    }
  };

  const productTable = (items: Product[], title: string, icon: React.ReactNode, action?: (p: Product) => React.ReactNode) => (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="text-sm font-semibold text-neutral-700">{title}</h4>
        <Badge variant="neutral">{items.length}</Badge>
      </div>
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-neutral-500 border-b border-neutral-200">
              <th className="text-left font-medium py-2 px-2">SKU / Product</th>
              <th className="text-left font-medium py-2 px-2">Category</th>
              <th className="text-right font-medium py-2 px-2">Velocity</th>
              <th className="text-right font-medium py-2 px-2">Stock</th>
              <th className="text-right font-medium py-2 px-2">Threshold</th>
              <th className="text-center font-medium py-2 px-2">Status</th>
              {action && <th className="text-center font-medium py-2 px-2">Action</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="table-row-hover border-b border-neutral-100">
                <td className="py-2.5 px-2">
                  <div className="font-medium text-neutral-900">{p.product_name}</div>
                  <div className="text-xs text-neutral-400 font-mono">{p.sku}</div>
                </td>
                <td className="py-2.5 px-2 text-neutral-600">{p.category}</td>
                <td className="py-2.5 px-2 text-right font-medium text-neutral-700">{p.sales_velocity}/wk</td>
                <td className="py-2.5 px-2 text-right">
                  <span className={p.current_stock <= p.safety_stock_threshold ? 'font-semibold text-danger-600' : 'text-neutral-700'}>
                    {p.current_stock}
                  </span>
                </td>
                <td className="py-2.5 px-2 text-right text-neutral-500">{p.safety_stock_threshold}</td>
                <td className="py-2.5 px-2 text-center">{statusBadge(p.status)}</td>
                {action && <td className="py-2.5 px-2 text-center">{action(p)}</td>}
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-neutral-400">No items found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Automated Reorder & Stockout Tracker */}
      <SectionCard
        title="Automated Reorder & Stockout Tracker"
        description="High-velocity items approaching or below safety stock thresholds"
        icon={<RefreshCw size={18} />}
        action={
          <button
            onClick={() => showToast('info', 'Bulk Restock', `Auto-restock triggered for ${lowStockItems.length} items.`)}
            className="btn btn-primary text-xs"
          >
            <RefreshCw size={14} />
            Restock All ({lowStockItems.length})
          </button>
        }
      >
        {loading ? (
          <div className="h-32 flex items-center justify-center text-neutral-400 animate-pulse-soft">Loading inventory data...</div>
        ) : (
          productTable(lowStockItems, 'Critical — Below Safety Stock', <AlertTriangle size={16} className="text-danger-500" />,
            (p) => (
              <button
                onClick={() => handleRestock(p)}
                disabled={restocking === p.id}
                className="btn btn-warning text-xs"
              >
                {restocking === p.id ? (
                  <><RefreshCw size={12} className="animate-spin" /> Restocking...</>
                ) : (
                  <><RefreshCw size={12} /> Trigger Restock</>
                )}
              </button>
            )
          )
        )}
      </SectionCard>

      {/* Product Bundling & Margin Expansion */}
      <SectionCard
        title="Product Bundling & Margin Expansion"
        description="Pair low-margin staples with high-margin add-ons to boost overall profitability"
        icon={<Layers size={18} />}
        action={
          <button onClick={() => setBundleModal(true)} className="btn btn-primary text-xs">
            <Plus size={14} />
            Build Bundle
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products
            .filter((p) => p.is_bundled)
            .map((p) => {
              const partner = products.find((pp) => pp.sku === p.bundle_partner);
              if (!partner) return null;
              const bundleTotal = p.unit_price + partner.unit_price;
              const bundleCost = p.unit_cost + partner.unit_cost;
              const bundleMargin = ((bundleTotal - bundleCost) / bundleTotal) * 100;
              return (
                <div key={p.id} className="card p-4 border-neutral-200 hover:border-accent-300 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center text-accent-600">
                      <Package size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{p.product_name}</p>
                      <p className="text-xs text-neutral-500">+ {partner.product_name}</p>
                    </div>
                    <Badge variant="success">{bundleMargin.toFixed(1)}% margin</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Bundle Price: <span className="font-semibold text-neutral-900">{formatINR(bundleTotal)}</span></span>
                    <span className="text-neutral-500">Cost: <span className="font-semibold text-neutral-700">{formatINR(bundleCost)}</span></span>
                  </div>
                </div>
              );
            })}
        </div>
      </SectionCard>

      {/* Slow-Mover Clearance Queue */}
      <SectionCard
        title="Slow-Mover Clearance Queue"
        description="Lowest sales velocity products — apply clearance pricing to free up warehouse capacity"
        icon={<TrendingDown size={18} />}
        action={
          <button
            onClick={() => showToast('info', 'Bulk Clearance', `Clearance pricing applied to ${slowMovers.length} slow-moving items.`)}
            className="btn btn-secondary text-xs"
          >
            <Tag size={14} />
            Apply Bulk Clearance
          </button>
        }
      >
        {loading ? (
          <div className="h-32 flex items-center justify-center text-neutral-400 animate-pulse-soft">Loading slow movers...</div>
        ) : (
          <>
            {productTable(slowMovers, 'Slow-Moving Inventory', <Boxes size={16} className="text-neutral-500" />,
              (p) => (
                <button onClick={() => setClearanceModal(p)} className="btn btn-danger text-xs">
                  <Tag size={12} /> Clearance
                </button>
              )
            )}
            {/* Also show healthy stock table */}
            <div className="mt-6 pt-6 border-t border-neutral-200">
              {productTable(inStockItems, 'Healthy Stock', <PackageCheck size={16} className="text-success-500" />)}
            </div>
          </>
        )}
      </SectionCard>

      {/* Bundle Builder Modal */}
      <Modal
        open={bundleModal}
        onClose={() => { setBundleModal(false); setBundleItems([]); }}
        title="Bundle Builder"
        description="Select products to create a promotional bundle with live margin calculation"
        maxWidth="max-w-3xl"
        footer={
          <>
            <button onClick={() => { setBundleModal(false); setBundleItems([]); }} className="btn btn-secondary">
              Cancel
            </button>
            <button
              onClick={() => {
                showToast('success', 'Bundle Created', `Promotional bundle with ${bundleItems.length} products has been created at ${bundleMargin.toFixed(1)}% margin.`);
                setBundleModal(false);
                setBundleItems([]);
              }}
              disabled={bundleItems.length < 2}
              className="btn btn-primary"
            >
              <Plus size={16} /> Create Bundle
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product selector */}
          <div>
            <h4 className="text-sm font-medium text-neutral-700 mb-3">Available Products</h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToBundle(p)}
                  disabled={bundleItems.find((bp) => bp.id === p.id) !== undefined}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-lg border border-neutral-200 hover:border-accent-300 hover:bg-accent-50/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-left"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{p.product_name}</p>
                    <p className="text-xs text-neutral-400">{p.category} · {formatINR(p.unit_price)}</p>
                  </div>
                  <Plus size={16} className="text-accent-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Bundle preview & margin calculator */}
          <div>
            <h4 className="text-sm font-medium text-neutral-700 mb-3">Bundle Contents</h4>
            <div className="space-y-2 min-h-[120px]">
              {bundleItems.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-sm text-neutral-400 border-2 border-dashed border-neutral-200 rounded-lg">
                  Add products to build a bundle
                </div>
              ) : (
                bundleItems.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{p.product_name}</p>
                      <p className="text-xs text-neutral-500">{formatINR(p.unit_price)} · {p.gross_margin_pct.toFixed(0)}% margin</p>
                    </div>
                    <button onClick={() => removeFromBundle(p.id)} className="text-neutral-400 hover:text-danger-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {bundleItems.length >= 2 && (
              <div className="mt-4 p-4 rounded-xl bg-primary-900 text-white space-y-3">
                <div className="flex items-center gap-2 text-accent-400">
                  <Calculator size={16} />
                  <span className="text-sm font-medium">Live Margin Calculator</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-primary-300 text-xs">Total Cost</p>
                    <p className="font-semibold">{formatINR(bundleCost)}</p>
                  </div>
                  <div>
                    <p className="text-primary-300 text-xs">Total Price</p>
                    <p className="font-semibold">{formatINR(bundlePrice)}</p>
                  </div>
                  <div>
                    <p className="text-primary-300 text-xs">Gross Margin</p>
                    <p className="font-semibold text-success-400">{bundleMargin.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-primary-300 text-xs">Suggested Price (10% off)</p>
                    <p className="font-semibold text-accent-400">{formatINR(suggestedBundlePrice)}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-primary-700">
                  <p className="text-xs text-primary-300">
                    Margin at suggested price: <span className="font-semibold text-white">
                      {(((suggestedBundlePrice - bundleCost) / suggestedBundlePrice) * 100).toFixed(1)}%
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Clearance Modal */}
      <Modal
        open={!!clearanceModal}
        onClose={() => setClearanceModal(null)}
        title="Apply Clearance Pricing"
        description={clearanceModal ? `${clearanceModal.product_name} (${clearanceModal.sku})` : ''}
        footer={<button onClick={() => setClearanceModal(null)} className="btn btn-secondary">Cancel</button>}
      >
        {clearanceModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-neutral-50">
                <p className="text-xs text-neutral-500">Current Price</p>
                <p className="text-lg font-semibold text-neutral-900">{formatINR(clearanceModal.unit_price)}</p>
              </div>
              <div className="p-3 rounded-lg bg-neutral-50">
                <p className="text-xs text-neutral-500">Current Stock</p>
                <p className="text-lg font-semibold text-neutral-900">{clearanceModal.current_stock} units</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-warning-50 border border-warning-200">
              <div className="flex items-center gap-2 text-warning-700 mb-2">
                <AlertTriangle size={16} />
                <span className="text-sm font-medium">Discount capped at 15%</span>
              </div>
              <p className="text-xs text-warning-600">Clearance discounts are automatically capped at 15% to protect overall category margins.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[5, 10, 15].map((d) => (
                <button
                  key={d}
                  onClick={() => handleClearance(d)}
                  className="card p-4 text-center hover:border-danger-300 hover:bg-danger-50/30 transition-all"
                >
                  <p className="text-2xl font-bold text-danger-600">{d}%</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {formatINR(clearanceModal.unit_price * (1 - d / 100))}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
