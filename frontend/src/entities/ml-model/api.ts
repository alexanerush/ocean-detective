import { apiClient } from '../../shared/api/apiClient';
import type { ModelComparisonResponse } from './types';
export async function getComparison(
  signal: AbortSignal,
): Promise<ModelComparisonResponse> {
  const { data } = await apiClient.get<ModelComparisonResponse>('/model-comparison', {
    signal,
  });
  if (
    data.status !== 'success' ||
    !data.results?.validation?.rgb ||
    !data.results.validation.multispectral
  )
    throw new Error('Invalid experiment response.');
  return data;
}
