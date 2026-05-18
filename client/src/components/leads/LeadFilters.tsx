import React from 'react';
import { LEAD_STATUSES, LEAD_SOURCES, LEAD_PRIORITIES } from '../../types';
import type { LeadFilters as Filters } from '../../types';
import { Filter, X } from 'lucide-react';

interface LeadFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Partial<Filters>) => void;
}

const LeadFilters: React.FC<LeadFiltersProps> = ({ filters, onFilterChange }) => {
  const hasActiveFilters = filters.status || filters.source || filters.priority;

  const clearFilters = () => {
    onFilterChange({ status: undefined, source: undefined, priority: undefined, search: '' });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-sm text-text-secondary dark:text-text-dark-secondary">
        <Filter className="w-4 h-4" />
        <span className="hidden sm:inline">Filters:</span>
      </div>

      <select
        value={filters.status || ''}
        onChange={(e) => onFilterChange({ status: e.target.value as any || undefined, page: 1 })}
        className="select text-sm py-1.5 px-3 w-auto min-w-[120px] rounded-full"
      >
        <option value="">All Status</option>
        {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <select
        value={filters.source || ''}
        onChange={(e) => onFilterChange({ source: e.target.value as any || undefined, page: 1 })}
        className="select text-sm py-1.5 px-3 w-auto min-w-[130px] rounded-full"
      >
        <option value="">All Sources</option>
        {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <select
        value={filters.priority || ''}
        onChange={(e) => onFilterChange({ priority: e.target.value as any || undefined, page: 1 })}
        className="select text-sm py-1.5 px-3 w-auto min-w-[120px] rounded-full"
      >
        <option value="">All Priority</option>
        {LEAD_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>

      <select
        value={filters.sort}
        onChange={(e) => onFilterChange({ sort: e.target.value as 'latest' | 'oldest' })}
        className="select text-sm py-1.5 px-3 w-auto min-w-[110px] rounded-full"
      >
        <option value="latest">Newest</option>
        <option value="oldest">Oldest</option>
      </select>

      {hasActiveFilters && (
        <button onClick={clearFilters} className="btn btn-ghost btn-sm text-red-500 hover:text-red-600">
          <X className="w-3.5 h-3.5" /> Clear
        </button>
      )}
    </div>
  );
};

export default LeadFilters;
