import { createSlice, createSelector } from '@reduxjs/toolkit';
import { runInspection } from './analysisSlice';
export interface HistoryEntry {
  id: string;
  date: number;
  status: 'succeeded' | 'failed';
  pixels: number | null;
  message: string;
}
const initialState: HistoryEntry[] = [];
const slice = createSlice({
  name: 'history',
  initialState,
  reducers: {},
  extraReducers: (b) =>
    b.addCase(runInspection.fulfilled, (state, a) => {
      state.unshift({
        id: a.meta.requestId,
        date: a.payload.completedAt,
        status: 'succeeded',
        pixels: a.payload.response.analysis.marine_debris_pixels,
        message: 'MARIDA dataset inspection',
      });
    }),
});
export const selectHistory = createSelector(
  [(s: { history: HistoryEntry[] }) => s.history],
  (entries) => entries.map((e) => e),
);
export default slice.reducer;
