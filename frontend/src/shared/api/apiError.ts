import axios from 'axios';

interface ErrorResponse {
  message?: string;
  error?: string;
}

export class ApiError extends Error {
  readonly status: number | null;
  readonly code: string;

  constructor(message: string, status: number | null, code: string) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const statusMessages: Record<number, string> = {
  400: 'Invalid request.',
  401: 'Authentication is required.',
  403: 'Access denied.',
  404: 'Requested resource was not found.',
  413: 'The uploaded file is too large.',
  415: 'Unsupported file format.',
  422: 'The submitted data could not be processed.',
  429: 'Too many requests. Please try again later.',
  500: 'Internal server error.',
  502: 'The server is temporarily unavailable.',
  503: 'Service temporarily unavailable.',
  504: 'Server response timeout.',
};

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError<ErrorResponse>(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new ApiError('The request timed out. Please try again.', null, 'TIMEOUT');
    }

    if (error.code === 'ERR_CANCELED') {
      return new ApiError('The request was cancelled.', null, 'CANCELLED');
    }

    if (!error.response) {
      return new ApiError('Unable to connect to the server.', null, 'NETWORK_ERROR');
    }

    const status = error.response.status;
    const data = error.response.data;

    const serverMessage =
      typeof data?.message === 'string'
        ? data.message
        : typeof data?.error === 'string'
          ? data.error
          : undefined;

    const message =
      status >= 500
        ? (statusMessages[status] ?? 'Server error.')
        : (serverMessage ??
          statusMessages[status] ??
          'An unexpected API error occurred.');

    return new ApiError(message, status, `HTTP_${status}`);
  }

  return new ApiError('An unexpected error occurred.', null, 'UNKNOWN_ERROR');
}
