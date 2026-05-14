import { apiClient } from '../api/client';
import type { Algorithm, AlgorithmListResponse } from '../types/algoAccess';

export const fetchAlgorithms = async () => {
  const { data } = await apiClient.get<AlgorithmListResponse>('/algorithms');
  return data;
};

export const createAlgorithm = async (name: string, description?: string) => {
  const { data } = await apiClient.post<{ success: boolean; data: Algorithm }>('/algorithms', {
    name,
    description,
  });
  return data;
};

export const deleteAlgorithm = async (id: string) => {
  const { data } = await apiClient.delete<{ success: boolean; data: {} }>(`/algorithms/${id}`);
  return data;
};
