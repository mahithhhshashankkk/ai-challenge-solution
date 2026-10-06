import { Search, Store, Globe, Smartphone, Calendar, MapPin, ChevronDown } from 'lucide-react';
import { useFilters } from '@/context/FilterContext';
import type { TabKey } from '@/types';

interface HeaderProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const tabs: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Executive Overview' },
  { key: 'inventory', label: 'Inventory & Merchandising' },
  { key: 'vip', label: 'VIP Retention & LTV' },
  { key: 'fulfillment', label: 'Fulfillment & Returns' },
];

const channels = [
  { value: 'all', label: 'All Channels', icon: Globe },
  { value: 'Store', label: 'Store', icon: Store },
  { value: 'Website', label: 'Website', icon: Globe },
  { value: 'Mobile App', label: 'Mobile App', icon: Smartphone },
];

const regions = ['all', 'North', 'South', 'East', 'West', 'Central'];

const dateRanges = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'ytd', label: 'Year to date' },
];

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const { filters, setFilters, searchQuery, setSearchQuery } = useFilters();

  return (
    <header className="sticky top-0 z-40 bg-primary-900 text-white shadow-lg">
      {/* Top bar */}
      <div className="px-4 lg:px-6 py-3 border-b border-primary-800">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-500 flex items-center justify-center shrink-0">
              <Store size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">NovaMart</h1>
              <p className="text-xs text-primary-300">Executive Action Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SKUs, Customer IDs, Regions..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-primary-800 border border-primary-700 text-sm text-white placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Channel filter */}
            <div className="relative">
              <select
                value={filters.channel}
                onChange={(e) => setFilters({ channel: e.target.value })}
                className="appearance-none pl-8 pr-8 py-2 rounded-lg bg-primary-800 border border-primary-700 text-sm text-white cursor-pointer hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-accent-500 transition-all"
              >
                {channels.map((ch) => (
                  <option key={ch.value} value={ch.value} className="bg-primary-900">{ch.label}</option>
                ))}
              </select>
              <Globe size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none" />
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none" />
            </div>

            {/* Region filter */}
            <div className="relative">
              <select
                value={filters.region}
                onChange={(e) => setFilters({ region: e.target.value })}
                className="appearance-none pl-8 pr-8 py-2 rounded-lg bg-primary-800 border border-primary-700 text-sm text-white cursor-pointer hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-accent-500 transition-all"
              >
                <option value="all" className="bg-primary-900">All Regions</option>
                {regions.slice(1).map((r) => (
                  <option key={r} value={r} className="bg-primary-900">{r}</option>
                ))}
              </select>
              <MapPin size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none" />
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none" />
            </div>

            {/* Date range filter */}
            <div className="relative">
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ dateRange: e.target.value })}
                className="appearance-none pl-8 pr-8 py-2 rounded-lg bg-primary-800 border border-primary-700 text-sm text-white cursor-pointer hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-accent-500 transition-all"
              >
                {dateRanges.map((dr) => (
                  <option key={dr.value} value={dr.value} className="bg-primary-900">{dr.label}</option>
                ))}
              </select>
              <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none" />
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <nav className="px-4 lg:px-6">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.key
                  ? 'text-accent-400'
                  : 'text-primary-300 hover:text-white'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
