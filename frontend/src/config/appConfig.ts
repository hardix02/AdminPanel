const normalizeBaseUrl = (value: string | undefined) => {
  if (!value) {
    return 'http://localhost:5000/api/v1';
  }

  return value.endsWith('/') ? value.slice(0, -1) : value;
};

export const appConfig = {
  appEnv: import.meta.env.VITE_APP_ENV || 'local',
  apiBaseUrl: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL),
};
