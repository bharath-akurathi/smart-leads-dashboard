import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import LeadTable from '../components/leads/LeadTable';
import LeadFilters from '../components/leads/LeadFilters';
import LeadForm from '../components/leads/LeadForm';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import { getLeadsApi, createLeadApi, updateLeadApi, deleteLeadApi, exportLeadsCsvApi, bulkDeleteApi, bulkUpdateStatusApi } from '../api/leads.api';
import { useDebounce } from '../hooks/useDebounce';
import { downloadCsv } from '../utils/helpers';
import type { Lead, LeadFilters as FiltersType, LeadForm as LeadFormType, PaginationMeta } from '../types';
import { LEAD_STATUSES } from '../types';
import { Plus, Download, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const LeadsPage: React.FC = () => {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 0, hasNext: false, hasPrev: false });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FiltersType>({ page: 1, limit: 10, sort: 'latest' });
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getLeadsApi({ ...filters, search: debouncedSearch || undefined });
      setLeads(result.data);
      setMeta(result.meta);
    } catch (err) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  useEffect(() => {
    setFilters((p) => ({ ...p, page: 1 }));
  }, [debouncedSearch]);

  const handleFilterChange = (partial: Partial<FiltersType>) => {
    setFilters((p) => ({ ...p, ...partial }));
    setSelectedIds([]);
  };

  const handleCreate = async (data: LeadFormType) => {
    setFormLoading(true);
    try {
      await createLeadApi(data);
      toast.success('Lead created!');
      setShowCreateModal(false);
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create lead');
    } finally { setFormLoading(false); }
  };

  const handleUpdate = async (data: LeadFormType) => {
    if (!editingLead) return;
    setFormLoading(true);
    try {
      await updateLeadApi(editingLead._id, data);
      toast.success('Lead updated!');
      setEditingLead(null);
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update lead');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    if (!deletingLead) return;
    try {
      await deleteLeadApi(deletingLead._id);
      toast.success('Lead deleted');
      setDeletingLead(null);
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete lead');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportLeadsCsvApi();
      downloadCsv(blob);
      toast.success('CSV exported!');
    } catch { toast.error('Export failed'); }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await bulkDeleteApi(selectedIds);
      toast.success(`${selectedIds.length} lead(s) deleted`);
      setSelectedIds([]);
      fetchLeads();
    } catch { toast.error('Bulk delete failed'); }
  };

  const handleSelectToggle = (id: string) => {
    setSelectedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? leads.map((l) => l._id) : []);
  };

  return (
    <div>
      <Navbar onMenuClick={onMenuClick} title="Leads"
        subtitle={`${meta.total} total lead${meta.total !== 1 ? 's' : ''}`}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={handleExport} className="btn btn-secondary btn-sm hidden sm:flex">
              <Download className="w-4 h-4" /> Export
            </button>
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-sm">
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Lead</span>
            </button>
          </div>
        }
      />

      <div className="p-4 md:p-6 space-y-4">
        {/* Mobile search */}
        <div className="md:hidden relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input type="text" placeholder="Search leads..." value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input pl-10 pr-4 py-2 text-sm rounded-full" />
        </div>

        {/* Filters + Bulk Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <LeadFilters filters={filters} onFilterChange={handleFilterChange} />
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-slide-up">
              <span className="text-sm text-text-secondary">{selectedIds.length} selected</span>
              <button onClick={handleBulkDelete} className="btn btn-danger btn-sm">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="card overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-border/50 dark:border-border-dark/50">
                <div className="w-4 h-4 rounded bg-surface-tertiary dark:bg-surface-dark-tertiary animate-pulse-soft" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-surface-tertiary dark:bg-surface-dark-tertiary rounded animate-pulse-soft" />
                  <div className="h-3 w-48 bg-surface-tertiary dark:bg-surface-dark-tertiary rounded animate-pulse-soft" />
                </div>
                <div className="h-5 w-16 bg-surface-tertiary dark:bg-surface-dark-tertiary rounded-full animate-pulse-soft" />
              </div>
            ))}
          </div>
        ) : (
          <LeadTable leads={leads} onEdit={setEditingLead} onDelete={setDeletingLead}
            onView={(lead) => navigate(`/leads/${lead._id}`)}
            selectedIds={selectedIds} onSelectToggle={handleSelectToggle} onSelectAll={handleSelectAll} />
        )}

        {/* Pagination */}
        {!loading && meta.totalPages > 0 && (
          <Pagination meta={meta}
            onPageChange={(p) => handleFilterChange({ page: p })}
            onLimitChange={(l) => handleFilterChange({ limit: l, page: 1 })} />
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Lead" size="lg">
        <LeadForm onSubmit={handleCreate} onCancel={() => setShowCreateModal(false)} isLoading={formLoading} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingLead} onClose={() => setEditingLead(null)} title="Edit Lead" size="lg">
        <LeadForm initialData={editingLead} onSubmit={handleUpdate} onCancel={() => setEditingLead(null)} isLoading={formLoading} />
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deletingLead} onClose={() => setDeletingLead(null)} title="Delete Lead" size="sm">
        <div className="text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-text-secondary dark:text-text-dark-secondary mb-1">
            Are you sure you want to delete
          </p>
          <p className="font-semibold text-text-primary dark:text-text-dark mb-5">
            {deletingLead?.name}?
          </p>
          <div className="flex justify-center gap-3">
            <button onClick={() => setDeletingLead(null)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleDelete} className="btn btn-danger">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LeadsPage;
