import React from 'react';
import type { PaginationMeta } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ meta, onPageChange, onLimitChange }) => {
  const { page, totalPages, total, limit, hasNext, hasPrev } = meta;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-3 text-sm text-text-secondary dark:text-text-dark-secondary">
        <span>Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}</span>
        <select value={limit} onChange={(e) => onLimitChange(Number(e.target.value))}
          className="select text-xs py-1 px-2 w-auto rounded-lg">
          <option value={10}>10/page</option>
          <option value={25}>25/page</option>
          <option value={50}>50/page</option>
        </select>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={!hasPrev}
          className="btn btn-secondary btn-sm disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let p: number;
          if (totalPages <= 5) { p = i + 1; }
          else if (page <= 3) { p = i + 1; }
          else if (page >= totalPages - 2) { p = totalPages - 4 + i; }
          else { p = page - 2 + i; }
          return (
            <button key={p} onClick={() => onPageChange(p)}
              className={`btn btn-sm min-w-[36px] ${p === page ? 'btn-primary' : 'btn-secondary'}`}>
              {p}
            </button>
          );
        })}
        <button onClick={() => onPageChange(page + 1)} disabled={!hasNext}
          className="btn btn-secondary btn-sm disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
