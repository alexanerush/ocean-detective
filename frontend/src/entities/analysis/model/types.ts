export type AnalysisStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
export interface AnalysisData {
  image: { width: number; height: number; bands: number; crs: string };
  marine_debris_pixels: number;
  classes: Record<string, number>;
  confidence: Record<string, number>;
}
export interface AnalysisResponse {
  status: 'success';
  message: string;
  analysis: AnalysisData;
  output: string;
}
export interface AnalysisState {
  status: AnalysisStatus;
  error: string | null;
  result: AnalysisResponse | null;
  completedAt: number | null;
}
