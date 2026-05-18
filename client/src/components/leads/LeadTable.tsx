import React from 'react';
import type { Lead } from '../../types';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../types';
import { formatDate } from '../../utils/helpers';
import { MoreHorizontal, Edit2, Trash2, Eye } from 'lucide-react';

interface LeadTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onView: (lead: Lead) => void;
  selectedIds: string[];
  onSelectToggle: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
}

const LeadTable: React.FC<LeadTableProps> = ({
  leads, onEdit, onDelete, onView, selectedIds, onSelectToggle, onSelectAll,
}) => {
  const allSelected = leads.length > 0 && leads.every((l) => selectedIds.includes(l._id));

  if (leads.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="text-5xl mb-4">📋</div>
        <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          No leads found
        </h3>
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
          Try adjusting your filters or create your first lead.
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border dark:border-border-dark bg-surface-secondary dark:bg-surface-dark-tertiary">
              <th className="text-left py-3 px-4 font-medium text-text-secondary dark:text-text-dark-secondary w-10">
                <input type="checkbox" checked={allSelected} onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-accent focus:ring-accent cursor-pointer" />
              </th>
              <th className="text-left py-3 px-4 font-medium text-text-secondary dark:text-text-dark-secondary">Name</th>
              <th className="text-left py-3 px-4 font-medium text-text-secondary dark:text-text-dark-secondary hidden md:table-cell">Company</th>
              <th className="text-left py-3 px-4 font-medium text-text-secondary dark:text-text-dark-secondary">Status</th>
              <th className="text-left py-3 px-4 font-medium text-text-secondary dark:text-text-dark-secondary hidden lg:table-cell">Source</th>
              <th className="text-left py-3 px-4 font-medium text-text-secondary dark:text-text-dark-secondary hidden lg:table-cell">Priority</th>
              <th className="text-left py-3 px-4 font-medium text-text-secondary dark:text-text-dark-secondary hidden xl:table-cell">Created</th>
              <th className="text-right py-3 px-4 font-medium text-text-secondary dark:text-text-dark-secondary w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, i) => (
              <tr key={lead._id}
                className={`border-b border-border/50 dark:border-border-dark/50 hover:bg-surface-tertiary/50 dark:hover:bg-surface-dark-tertiary/50 transition-colors cursor-pointer ${
                  selectedIds.includes(lead._id) ? 'bg-accent/5' : ''
                }`}
                style={{ animationDelay: `${i * 30}ms` }}
                onClick={() => onView(lead)}
              >
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selectedIds.includes(lead._id)}
                    onChange={() => onSelectToggle(lead._id)}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent cursor-pointer" />
                </td>
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-text-primary dark:text-text-dark">{lead.name}</p>
                    <p className="text-xs text-text-tertiary mt-0.5">{lead.email}</p>
                  </div>
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <span className="text-text-secondary dark:text-text-dark-secondary">{lead.company || '—'}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`badge ${STATUS_COLORS[lead.status]}`}>{lead.status}</span>
                </td>
                <td className="py-3 px-4 hidden lg:table-cell">
                  <span className="text-text-secondary dark:text-text-dark-secondary text-xs">{lead.source}</span>
                </td>
                <td className="py-3 px-4 hidden lg:table-cell">
                  <span className={`badge ${PRIORITY_COLORS[lead.priority]}`}>{lead.priority}</span>
                </td>
                <td className="py-3 px-4 hidden xl:table-cell">
                  <span className="text-text-tertiary text-xs">{formatDate(lead.createdAt)}</span>
                </td>
                <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => onView(lead)} className="btn-ghost p-1.5 rounded-lg" title="View">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => onEdit(lead)} className="btn-ghost p-1.5 rounded-lg" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(lead)} className="btn-ghost p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadTable;
