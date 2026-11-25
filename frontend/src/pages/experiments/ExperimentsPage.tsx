import { useEffect, useState } from 'react';
import { getComparison } from '../../entities/ml-model/api';
import type {
  ModelComparisonResponse,
  ModelMetrics,
} from '../../entities/ml-model/types';
import { Button, Panel, Skeleton } from '../../shared/ui/controls';
import { BarChart } from '../../shared/ui/BarChart';
import { ResultImage } from '../../shared/ui/ResultImage';
import { resultsUrl } from '../../shared/api/resultsUrl';
import '../analysis/analytics.css';
const metrics = [
  'precision',
  'recall',
  'f1',
  'iou',
] as const satisfies readonly (keyof ModelMetrics)[];
function formatMetric(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(4);
}

export default function ExperimentsPage() {
  const [data, setData] = useState<ModelComparisonResponse | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError('');
    getComparison(controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setData(value);
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : 'Unable to load experiment.');
      });
    return () => controller.abort();
  }, [attempt]);
  return (
    <section className="od-analytics">
      <span className="eyebrow">RESEARCH</span>
      <h2>ML Experiments</h2>
      <p>
        Binary marine debris classification on the MARIDA validation split, not final
        multiclass inference.
      </p>
      {error ? (
        <Panel>
          <p role="alert" className="od-analytics-error">
            {error}
          </p>
          <Button onClick={() => setAttempt((n) => n + 1)}>Retry</Button>
        </Panel>
      ) : !data ? (
        <Skeleton />
      ) : (
        <>
          <Panel title={data.experiment.name}>
            <p>
              {data.experiment.dataset} · {data.experiment.split} ·{' '}
              {data.experiment.target_class}
            </p>
            <div className="od-image-grid">
              {metrics.map((metric) => (
                <BarChart
                  key={metric}
                  title={metric.toUpperCase()}
                  max={1}
                  items={[
                    { label: 'RGB', value: data.results.validation.rgb[metric] },
                    {
                      label: 'Multispectral',
                      value: data.results.validation.multispectral[metric],
                    },
                  ]}
                />
              ))}
            </div>
          </Panel>
          <Panel title="Validation results">
            <div className="od-table-scroll">
              <table>
                <caption>Random Forest metrics</caption>
                <thead>
                  <tr>
                    <th scope="col">Metric</th>
                    <th scope="col">RGB</th>
                    <th scope="col">Multispectral</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      'precision',
                      'recall',
                      'f1',
                      'iou',
                      'true_positive',
                      'false_positive',
                      'false_negative',
                      'training_seconds',
                    ] as const
                  ).map((m) => (
                    <tr key={m}>
                      <th scope="row">{m.replaceAll('_', ' ')}</th>
                      <td>{formatMetric(data.results.validation.rgb[m])}</td>
                      <td>{formatMetric(data.results.validation.multispectral[m])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
          <Panel title="Experiment configuration">
            <p>
              Training patches: {data.results.split.train_patches} · Validation patches:{' '}
              {data.results.split.validation_patches} · Test used:{' '}
              {String(data.results.split.test_used)}
            </p>
            <p>RGB bands: {data.results.features.rgb.join(', ')}</p>
            <p>Multispectral bands: {data.results.features.multispectral.join(', ')}</p>
            <dl className="od-metrics">
              {Object.entries(data.results.random_forest).map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{String(v)}</dd>
                </div>
              ))}
            </dl>
          </Panel>
          <Panel title="Validation visualization">
            <ResultImage
              src={resultsUrl(data.visualization)}
              alt="RGB and multispectral validation comparison"
            />
          </Panel>
        </>
      )}
    </section>
  );
}
