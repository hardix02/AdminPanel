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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      // Force a page refresh to trigger the auth check and redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
