import { it, expect } from 'vitest';
import reducer, {
  runInspection,
  resetAnalysis,
} from '../src/entities/analysis/model/analysisSlice';
it('tracks pending and rejected analysis', () => {
  const pending = reducer(undefined, runInspection.pending('job', undefined));
  expect(pending.status).toBe('loading');
  const failed = reducer(
    pending,
    runInspection.rejected(new Error('offline'), 'job', undefined),
  );
  expect(failed.status).toBe('failed');
  expect(failed.error).toBe('offline');
  expect(reducer(failed, resetAnalysis()).status).toBe('idle');
});
