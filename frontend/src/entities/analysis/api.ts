import { apiClient } from '../../shared/api/apiClient';
import type { AnalysisResponse } from './model/types';
export async function inspectDataset(): Promise<AnalysisResponse> {
  const { data } = await apiClient.post<AnalysisResponse>('/analyze');
  if (
    data.status !== 'success' ||
    !data.analysis?.image ||
    !data.analysis.classes ||
    !data.analysis.confidence
  )
    throw new Error('Invalid analysis response.');
  return data;
}
