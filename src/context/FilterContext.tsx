import { createContext, useContext, useState, type ReactNode } from 'react';
import type { GlobalFilters } from '@/types';

interface FilterContextType {
  filters: GlobalFilters;
  setFilters: (filters: Partial<GlobalFilters>) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const defaultFilters: GlobalFilters = {
  channel: 'all',
  region: 'all',
  dateRange: '30d',
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<GlobalFilters>(defaultFilters);
  const [searchQuery, setSearchQuery] = useState('');

  const setFilters = (newFilters: Partial<GlobalFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <FilterContext.Provider value={{ filters, setFilters, searchQuery, setSearchQuery }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used within FilterProvider');
  return ctx;
}
