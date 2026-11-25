import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { AnalysisState, AnalysisResponse } from './types';
import { inspectDataset } from '../api';
export const runInspection = createAsyncThunk<
  { response: AnalysisResponse; completedAt: number },
  void,
  { state: { analysis: AnalysisState } }
>(
  'analysis/inspect',
  async () => ({ response: await inspectDataset(), completedAt: Date.now() }),
  { condition: (_, { getState }) => getState().analysis.status !== 'loading' },
);
const initialState: AnalysisState = {
  status: 'idle',
  error: null,
  result: null,
  completedAt: null,
};
const slice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    resetAnalysis(state) {
      if (state.status !== 'loading') return initialState;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(runInspection.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.result = null;
        state.completedAt = null;
      })
      .addCase(runInspection.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.result = action.payload.response;
        state.completedAt = action.payload.completedAt;
      })
      .addCase(runInspection.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Analysis failed.';
      }),
});
export const { resetAnalysis } = slice.actions;
export default slice.reducer;
