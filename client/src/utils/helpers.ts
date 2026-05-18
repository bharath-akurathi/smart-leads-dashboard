/**
 * Formats an ISO date string to a human-readable format.
 */
export const formatDate = (date: string | null | undefined): string => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

/**
 * Formats a date to relative time (e.g., "2 hours ago").
 */
export const formatRelativeTime = (date: string | null | undefined): string => {
  if (!date) return '—';

  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};

/**
 * Triggers a CSV file download from a Blob.
 */
export const downloadCsv = (blob: Blob, filename?: string): void => {
  const finalFilename = filename || `leads_export_${Date.now()}.csv`;
  // Ensure the blob is explicitly typed as text/csv
  const csvBlob = new Blob([blob], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(csvBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;
  
  document.body.appendChild(link);
  link.click();
  
  // Delay cleanup to ensure browser download manager has time to capture the filename
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
    window.URL.revokeObjectURL(url);
  }, 500);
};
