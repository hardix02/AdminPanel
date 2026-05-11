import { apiClient } from '../api/client';
import type { UserListResponse, UserRecord } from '../types/user';

type UserPayload = {
  name: string;
  email: string;
  role: string;
  password?: string;
};

export const fetchUsers = async () => {
  const { data } = await apiClient.get<UserListResponse>('/users');
  return data;
};

export const createUser = async (payload: UserPayload) => {
  const { data } = await apiClient.post<{ success: boolean; data: UserRecord }>('/users', payload);
  return data;
};

export const updateUser = async (id: string, payload: UserPayload) => {
  const { data } = await apiClient.put<{ success: boolean; data: UserRecord }>(`/users/${id}`, payload);
  return data;
};

export const deleteUser = async (id: string) => {
  const { data } = await apiClient.delete<{ success: boolean; data: {} }>(`/users/${id}`);
  return data;
};
