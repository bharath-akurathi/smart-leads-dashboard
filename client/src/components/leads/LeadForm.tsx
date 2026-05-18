import React, { useState, useEffect } from 'react';
import type { LeadForm as LeadFormType, LeadStatus, LeadSource, LeadPriority, Lead } from '../../types';
import { LEAD_STATUSES, LEAD_SOURCES, LEAD_PRIORITIES } from '../../types';

interface LeadFormProps {
  initialData?: Lead | null;
  onSubmit: (data: LeadFormType) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const LeadForm: React.FC<LeadFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [form, setForm] = useState<LeadFormType>({
    name: '', email: '', phone: '', company: '',
    status: 'New' as LeadStatus, source: 'Website' as LeadSource,
    priority: 'Medium' as LeadPriority, notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name, email: initialData.email,
        phone: initialData.phone || '', company: initialData.company || '',
        status: initialData.status, source: initialData.source,
        priority: initialData.priority, notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (validate()) onSubmit(form);
  };

  const set = (field: keyof LeadFormType, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark mb-1.5">Name *</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Contact name" />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark mb-1.5">Email *</label>
          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={`input ${errors.email ? 'input-error' : ''}`} placeholder="email@company.com" />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark mb-1.5">Phone</label>
          <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className="input" placeholder="+1 (555) 000-0000" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark mb-1.5">Company</label>
          <input value={form.company} onChange={(e) => set('company', e.target.value)} className="input" placeholder="Company name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark mb-1.5">Status</label>
          <select value={form.status} onChange={(e) => set('status', e.target.value)} className="select">
            {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark mb-1.5">Source *</label>
          <select value={form.source} onChange={(e) => set('source', e.target.value)} className="select">
            {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark mb-1.5">Priority</label>
          <div className="flex gap-2">
            {LEAD_PRIORITIES.map((p) => (
              <button key={p} type="button" onClick={() => set('priority', p)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  form.priority === p
                    ? p === 'High' ? 'bg-red-50 border-red-300 text-red-600 dark:bg-red-500/10 dark:border-red-500/30'
                      : p === 'Medium' ? 'bg-amber-50 border-amber-300 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/30'
                      : 'bg-gray-50 border-gray-300 text-gray-600 dark:bg-gray-500/10 dark:border-gray-500/30'
                    : 'bg-surface dark:bg-surface-dark-tertiary border-border dark:border-border-dark text-text-secondary'
                }`}>
                {p === 'High' ? '🔴' : p === 'Medium' ? '🟡' : '⚪'} {p}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark mb-1.5">Notes</label>
        <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} className="input min-h-[80px] resize-y" placeholder="Notes about this lead..." rows={3} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
        <button type="submit" disabled={isLoading} className="btn btn-primary">
          {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : initialData ? 'Update Lead' : 'Create Lead'}
        </button>
      </div>
    </form>
  );
};

export default LeadForm;
