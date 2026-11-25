import { createSelector } from '@reduxjs/toolkit';
import type { AnalysisState } from './types';
export const selectAnalysis = (state: { analysis: AnalysisState }) => state.analysis;
export const selectDistribution = createSelector([selectAnalysis], (state) =>
  Object.entries(state.result?.analysis.classes ?? {})
    .map(([label, value]) => ({ label: `Class ${label}`, value }))
    .sort((a, b) => b.value - a.value),
);
