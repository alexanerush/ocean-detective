import axios from 'axios';
import { env } from '../config/env';
import { normalizeApiError } from './apiError';

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: env.apiTimeout,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,

  (error: unknown) => {
    const apiError = normalizeApiError(error);

    if (import.meta.env.DEV && apiError.code !== 'CANCELLED') {
      console.error('[Ocean Detective API]', {
        status: apiError.status,
        code: apiError.code,
      });
    }

    return Promise.reject(apiError);
  },
);
