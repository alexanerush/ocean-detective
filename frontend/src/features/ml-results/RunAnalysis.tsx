import { useEffect, useState } from 'react';
import { apiClient } from '../../shared/api/apiClient';
import { Button, Panel } from '../../shared/ui/controls';
import Results from './Results';
type Job = { analysis_id: string; status: string; submitted_at: string };
export default function RunAnalysis({ imageId }: { imageId: string }) {
  const [confirmed, setConfirmed] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [jobs, setJobs] = useState<Job[]>([]),
    [selected, setSelected] = useState(''),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    const c = new AbortController();
    apiClient
      .get<Job[]>('/analyses', { params: { imageId }, signal: c.signal })
      .then((r) => setJobs(r.data))
      .catch((e) => {
        if (!c.signal.aborted) setError(e.message);
      });
    return () => c.abort();
  }, [imageId, revision]);
  async function run() {
    setBusy(true);
    setError('');
    try {
      const r = await apiClient.post<{ analysis_id: string }>('/analyses', {
        imageId,
        confirmed,
      });
      setSelected(r.data.analysis_id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setBusy(false);
      setRevision((r) => r + 1);
    }
  }
  return (
    <Panel title="Multispectral ML analysis">
      <p>
        Only MARIDA-compatible reflectance imagery: B01, B02, B03, B04, B05, B06, B07,
        B08, B8A, B11, B12 in this order.
      </p>
      <div className="od-analysis-actions">
        <label>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />{' '}
          I confirm band order and reflectance preprocessing match MARIDA.
        </label>
        <Button disabled={!confirmed || busy} onClick={() => void run()}>
          {busy ? 'Running analysis…' : 'Run Analysis'}
        </Button>
      </div>
      {busy && <p role="status">Processing image (up to 60 seconds)…</p>}
      {error && <p role="alert">{error}</p>}
      <p>Previous analyses</p>
      {jobs.map((j) => (
        <p key={j.analysis_id}>
          #{j.analysis_id} · {j.status} · {new Date(j.submitted_at).toLocaleString()}{' '}
          {j.status === 'COMPLETED' && (
            <Button onClick={() => setSelected(j.analysis_id)}>View results</Button>
          )}
        </p>
      ))}
      {selected && <Results key={selected} id={selected} />}
    </Panel>
  );
}
