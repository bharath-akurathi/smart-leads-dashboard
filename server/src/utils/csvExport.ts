import { ILeadDocument } from '../types';

/**
 * Generates CSV string from lead documents.
 * Uses manual CSV generation to avoid json2csv compatibility issues.
 */
export const generateCSV = (leads: ILeadDocument[]): string => {
  const headers = [
    'Name',
    'Email',
    'Phone',
    'Company',
    'Status',
    'Source',
    'Priority',
    'Notes',
    'Last Contacted',
    'Created At',
  ];

  const escapeCSV = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const rows = leads.map((lead) =>
    [
      escapeCSV(lead.name || ''),
      escapeCSV(lead.email || ''),
      escapeCSV(lead.phone || ''),
      escapeCSV(lead.company || ''),
      escapeCSV(lead.status || ''),
      escapeCSV(lead.source || ''),
      escapeCSV(lead.priority || ''),
      escapeCSV(lead.notes || ''),
      lead.lastContactedAt
        ? escapeCSV(new Date(lead.lastContactedAt).toISOString())
        : '',
      lead.createdAt ? escapeCSV(new Date(lead.createdAt).toISOString()) : '',
    ].join(',')
  );

  return [headers.join(','), ...rows].join('\n');
};
