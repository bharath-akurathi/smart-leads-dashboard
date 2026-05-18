import api from './axiosInstance';
import type {
  ApiResponse,
  Lead,
  LeadFilters,
  LeadForm,
  LeadStats,
  PaginationMeta,
} from '../types';

export const getLeadsApi = async (
  filters: LeadFilters
): Promise<{ data: Lead[]; meta: PaginationMeta }> => {
  const params: Record<string, string | number> = {
    page: filters.page,
    limit: filters.limit,
    sort: filters.sort,
  };

  if (filters.status) params.status = filters.status;
  if (filters.source) params.source = filters.source;
  if (filters.priority) params.priority = filters.priority;
  if (filters.search) params.search = filters.search;

  const response = await api.get<ApiResponse<Lead[]>>('/leads', { params });
  return { data: response.data.data!, meta: response.data.meta! };
};

export const getLeadByIdApi = async (id: string): Promise<Lead> => {
  const response = await api.get<ApiResponse<Lead>>(`/leads/${id}`);
  return response.data.data!;
};

export const createLeadApi = async (data: LeadForm): Promise<Lead> => {
  const response = await api.post<ApiResponse<Lead>>('/leads', data);
  return response.data.data!;
};

export const updateLeadApi = async (
  id: string,
  data: Partial<LeadForm>
): Promise<Lead> => {
  const response = await api.put<ApiResponse<Lead>>(`/leads/${id}`, data);
  return response.data.data!;
};

export const deleteLeadApi = async (id: string): Promise<void> => {
  await api.delete(`/leads/${id}`);
};

export const getLeadStatsApi = async (): Promise<LeadStats> => {
  const response = await api.get<ApiResponse<LeadStats>>('/leads/stats');
  return response.data.data!;
};

export const exportLeadsCsvApi = async (): Promise<Blob> => {
  const response = await api.get('/leads/export/csv', {
    responseType: 'blob',
  });
  return response.data;
};

export const bulkUpdateStatusApi = async (
  ids: string[],
  status: string
): Promise<{ modifiedCount: number }> => {
  const response = await api.patch('/leads/bulk/status', { ids, status });
  return response.data.data;
};

export const bulkDeleteApi = async (
  ids: string[]
): Promise<{ deletedCount: number }> => {
  const response = await api.delete('/leads/bulk', { data: { ids } });
  return response.data.data;
};
