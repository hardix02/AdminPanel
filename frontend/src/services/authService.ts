import { apiClient } from '../api/client';
import type { LoginResponse } from '../types/auth';

type LoginPayload = {
  email: string;
  password: string;
};

export const login = async (payload: LoginPayload) => {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', {
    email: payload.email.trim(),
    password: payload.password,
  });
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await apiClient.get<{ success: boolean; data: LoginResponse['user'] }>('/auth/me');
  return data.data;
};
