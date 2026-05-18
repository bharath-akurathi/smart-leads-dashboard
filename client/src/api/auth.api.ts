import api from './axiosInstance';
import type { ApiResponse, AuthResponse, LoginForm, RegisterForm } from '../types';

export const loginApi = async (data: LoginForm): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
  return response.data.data!;
};

export const registerApi = async (data: RegisterForm): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
  return response.data.data!;
};

export const getMeApi = async () => {
  const response = await api.get('/auth/me');
  return response.data.data;
};
