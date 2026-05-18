import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Modal from '../components/ui/Modal';
import LeadForm from '../components/leads/LeadForm';
import { getLeadByIdApi, updateLeadApi, deleteLeadApi } from '../api/leads.api';
import { formatDate, formatRelativeTime } from '../utils/helpers';
import { STATUS_COLORS, PRIORITY_COLORS } from '../types';
import type { Lead, LeadForm as LeadFormType } from '../types';
import { ArrowLeft, Edit2, Trash2, Mail, Phone, Building, Calendar, Clock, User } from 'lucide-react';
import toast from 'react-hot-toast';

const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const data = await getLeadByIdApi(id);
        setLead(data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Lead not found');
        navigate('/leads');
      } finally { setLoading(false); }
    };
    fetch();
  }, [id, navigate]);

  const handleUpdate = async (data: LeadFormType) => {
    if (!lead) return;
    setFormLoading(true);
    try {
      const updated = await updateLeadApi(lead._id, data);
      setLead(updated);
      setShowEdit(false);
      toast.success('Lead updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    if (!lead) return;
    try {
      await deleteLeadApi(lead._id);
      toast.success('Lead deleted');
      navigate('/leads');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!lead) return null;

  const infoItems = [
    { icon: Mail, label: 'Email', value: lead.email },
    { icon: Phone, label: 'Phone', value: lead.phone || '—' },
    { icon: Building, label: 'Company', value: lead.company || '—' },
    { icon: Calendar, label: 'Created', value: formatDate(lead.createdAt) },
    { icon: Clock, label: 'Updated', value: formatRelativeTime(lead.updatedAt) },
    { icon: User, label: 'Created By', value: lead.createdBy?.name || '—' },
  ];

  return (
    <div>
      <Navbar onMenuClick={onMenuClick} title="Lead Details"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => setShowEdit(true)} className="btn btn-secondary btn-sm">
              <Edit2 className="w-4 h-4" /> Edit
            </button>
            <button onClick={() => setShowDelete(true)} className="btn btn-danger btn-sm">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        }
      />
      <div className="p-4 md:p-6 space-y-6">
        {/* Back button */}
        <button onClick={() => navigate('/leads')} className="btn btn-ghost text-sm gap-1.5 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back to Leads
        </button>

        {/* Lead Header */}
        <div className="glass-card p-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-accent" style={{ fontFamily: 'var(--font-display)' }}>
                  {lead.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-primary dark:text-text-dark" style={{ fontFamily: 'var(--font-display)' }}>
                  {lead.name}
                </h2>
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary">{lead.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`badge ${STATUS_COLORS[lead.status]}`}>{lead.status}</span>
              <span className={`badge ${PRIORITY_COLORS[lead.priority]}`}>{lead.priority}</span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {infoItems.map(({ icon: Icon, label, value }) => (
            <div key={label} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-tertiary dark:bg-surface-dark-tertiary flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-text-tertiary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-text-tertiary">{label}</p>
                <p className="text-sm font-medium text-text-primary dark:text-text-dark truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        {lead.notes && (
          <div className="card p-5 animate-slide-up">
            <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark mb-2">Notes</h3>
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary whitespace-pre-wrap leading-relaxed">{lead.notes}</p>
          </div>
        )}

        {/* Source Badge */}
        <div className="card p-5 animate-slide-up">
          <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark mb-2">Source</h3>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-medium">
            {lead.source}
          </span>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Lead" size="lg">
        <LeadForm initialData={lead} onSubmit={handleUpdate} onCancel={() => setShowEdit(false)} isLoading={formLoading} />
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Delete Lead" size="sm">
        <div className="text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-text-secondary dark:text-text-dark-secondary mb-1">Delete <strong>{lead.name}</strong>?</p>
          <p className="text-xs text-text-tertiary mb-5">This action cannot be undone.</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => setShowDelete(false)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleDelete} className="btn btn-danger">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LeadDetailPage;
