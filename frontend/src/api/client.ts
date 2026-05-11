import axios from 'axios';
import { appConfig } from '../config/appConfig';

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const requestUrl = config.url ?? '';
  const isAuthLoginRequest = requestUrl.includes('/auth/login');
  const token = localStorage.getItem('token');

  if (token && !isAuthLoginRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
