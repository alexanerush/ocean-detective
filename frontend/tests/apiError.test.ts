import { describe, it, expect } from 'vitest';
import { AxiosError } from 'axios';
import { normalizeApiError, ApiError } from '../src/shared/api/apiError';
describe('API errors', () => {
  it('normalizes timeout', () =>
    expect(normalizeApiError(new AxiosError('timeout', 'ECONNABORTED')).code).toBe(
      'TIMEOUT',
    ));
  it('normalizes network failure', () =>
    expect(normalizeApiError(new AxiosError('offline', 'ERR_NETWORK')).code).toBe(
      'NETWORK_ERROR',
    ));
  it('preserves normalized errors', () => {
    const e = new ApiError('Denied', 403, 'HTTP_403');
    expect(normalizeApiError(e)).toBe(e);
  });
  it('handles unknown failures', () =>
    expect(normalizeApiError(null).code).toBe('UNKNOWN_ERROR'));
});
