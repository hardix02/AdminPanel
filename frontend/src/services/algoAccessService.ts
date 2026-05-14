import { apiClient } from '../api/client';
import type { AlgoAccessListResponse, AlgoAccessRecord } from '../types/algoAccess';

type FetchAlgoAccessParams = {
  search?: string;
  status?: string;
  algoName?: string;
};

export const fetchAlgoAccessList = async (params: FetchAlgoAccessParams) => {
  const { data } = await apiClient.get<AlgoAccessListResponse>('/algo-access', { params });
  return data;
};

type AlgoAccessPayload = {
  userName: string;
  email: string;
  accountId: string;
  algoName: string;
  purchasedPlan: string;
  durationDays: number;
  startedOn: string;
  expiresOn: string;
  status: string;
  oneTimeUse: boolean;
  notes: string;
};

export const createAlgoAccess = async (payload: AlgoAccessPayload) => {
  const { data } = await apiClient.post<{ success: boolean; data: AlgoAccessRecord }>('/algo-access', payload);
  return data;
};

export const updateAlgoAccess = async (id: string, payload: AlgoAccessPayload) => {
  const { data } = await apiClient.put<{ success: boolean; data: AlgoAccessRecord }>(`/algo-access/${id}`, payload);
  return data;
};

export const deleteAlgoAccess = async (id: string) => {
  const { data } = await apiClient.delete<{ success: boolean; data: {} }>(`/algo-access/${id}`);
  return data;
};

export const toggleAlgoAccessStatus = async (id: string) => {
  const { data } = await apiClient.patch(`/algo-access/${id}/toggle-status`);
  return data;
};
