import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { getLeadStatsApi } from '../api/leads.api';
import type { LeadStats } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Users, UserPlus, UserCheck, Trophy, XCircle,
  TrendingUp, Send, FileText,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const STAT_ICONS = [
  { key: 'total', label: 'Total Leads', icon: Users, color: '#64748B', bg: 'bg-slate-50 dark:bg-slate-500/10' },
  { key: 'new', label: 'New', icon: UserPlus, color: '#3B82F6', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  { key: 'contacted', label: 'Contacted', icon: Send, color: '#F59E0B', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  { key: 'qualified', label: 'Qualified', icon: UserCheck, color: '#10B981', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { key: 'proposal', label: 'Proposal', icon: FileText, color: '#8B5CF6', bg: 'bg-violet-50 dark:bg-violet-500/10' },
  { key: 'won', label: 'Won', icon: Trophy, color: '#059669', bg: 'bg-green-50 dark:bg-green-500/10' },
  { key: 'lost', label: 'Lost', icon: XCircle, color: '#EF4444', bg: 'bg-red-50 dark:bg-red-500/10' },
];

const PIE_COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#059669', '#EF4444', '#06B6D4', '#EC4899', '#6B7280'];

const DashboardPage: React.FC = () => {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { user } = useAuth();
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getLeadStatsApi();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const funnelData = stats ? [
    { name: 'New', value: stats.new, fill: '#3B82F6' },
    { name: 'Contacted', value: stats.contacted, fill: '#F59E0B' },
    { name: 'Qualified', value: stats.qualified, fill: '#10B981' },
    { name: 'Proposal', value: stats.proposal, fill: '#8B5CF6' },
    { name: 'Won', value: stats.won, fill: '#059669' },
    { name: 'Lost', value: stats.lost, fill: '#EF4444' },
  ] : [];

  const sourceData = stats?.bySource?.map((s, i) => ({
    name: s._id, value: s.count, fill: PIE_COLORS[i % PIE_COLORS.length],
  })) || [];

  const conversionRate = stats && stats.total > 0
    ? ((stats.won / stats.total) * 100).toFixed(1)
    : '0.0';

  return (
    <div>
      <Navbar onMenuClick={onMenuClick} title="Dashboard"
        subtitle={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`} />
      <div className="p-4 md:p-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 stagger-children">
          {STAT_ICONS.map(({ key, label, icon: Icon, color, bg }) => (
            <div key={key} className="card p-4 hover:scale-[1.02] transition-transform">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className="w-4.5 h-4.5" style={{ color }} />
              </div>
              <div>
                {loading ? (
                  <div className="h-7 w-12 bg-surface-tertiary dark:bg-surface-dark-tertiary rounded animate-pulse-soft" />
                ) : (
                  <p className="text-2xl font-bold text-text-primary dark:text-text-dark">
                    {stats ? (stats as any)[key] : 0}
                  </p>
                )}
                <p className="text-xs text-text-tertiary mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Conversion Rate Banner */}
        {!loading && stats && stats.total > 0 && (
          <div className="glass-card p-5 flex items-center gap-4 animate-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-text-secondary dark:text-text-dark-secondary">Overall Conversion Rate</p>
              <p className="text-3xl font-bold text-accent" style={{ fontFamily: 'var(--font-display)' }}>
                {conversionRate}%
              </p>
            </div>
            <div className="ml-auto hidden sm:block text-right">
              <p className="text-xs text-text-tertiary">Won / Total</p>
              <p className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary">
                {stats.won} / {stats.total}
              </p>
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pipeline Funnel */}
          <div className="card p-5">
            <h3 className="text-base font-bold text-text-primary dark:text-text-dark mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Pipeline Overview
            </h3>
            {loading ? (
              <div className="h-52 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : funnelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={funnelData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '13px' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {funnelData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex items-center justify-center text-text-tertiary text-sm">No data yet</div>
            )}
          </div>

          {/* Source Distribution */}
          <div className="card p-5">
            <h3 className="text-base font-bold text-text-primary dark:text-text-dark mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Lead Sources
            </h3>
            {loading ? (
              <div className="h-52 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : sourceData.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={sourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                      dataKey="value" paddingAngle={3} stroke="none">
                      {sourceData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '13px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {sourceData.map((s) => (
                    <div key={s.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.fill }} />
                        <span className="text-text-secondary dark:text-text-dark-secondary">{s.name}</span>
                      </div>
                      <span className="font-medium text-text-primary dark:text-text-dark">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-52 flex items-center justify-center text-text-tertiary text-sm">No data yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
