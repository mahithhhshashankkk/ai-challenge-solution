import { useState } from 'react';
import { FilterProvider } from '@/context/FilterContext';
import { ToastProvider } from '@/context/ToastContext';
import Header from '@/components/Header';
import ExecutiveOverview from '@/components/tabs/ExecutiveOverview';
import InventoryMerchandising from '@/components/tabs/InventoryMerchandising';
import VIPRetention from '@/components/tabs/VIPRetention';
import FulfillmentControl from '@/components/tabs/FulfillmentControl';
import type { TabKey } from '@/types';

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  return (
    <ToastProvider>
      <FilterProvider>
        <div className="min-h-screen bg-neutral-50">
          <Header activeTab={activeTab} onTabChange={setActiveTab} />
          <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
            {activeTab === 'overview' && <ExecutiveOverview />}
            {activeTab === 'inventory' && <InventoryMerchandising />}
            {activeTab === 'vip' && <VIPRetention />}
            {activeTab === 'fulfillment' && <FulfillmentControl />}
          </main>
          <footer className="border-t border-neutral-200 py-4 px-6 text-center text-xs text-neutral-400">
            NovaMart Executive Action Portal — Operational Decision Support System
          </footer>
        </div>
      </FilterProvider>
    </ToastProvider>
  );
}

export default App;
