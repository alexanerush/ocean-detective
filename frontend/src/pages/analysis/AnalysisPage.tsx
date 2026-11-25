import UserUpload from '../../features/user-upload/UserUpload';
import { useState } from 'react';
import ImageUpload from '../../features/image-upload/ImageUpload';
import { useAppDispatch, useAppSelector } from '../../app/providers/store/hooks';
import { runInspection } from '../../entities/analysis/model/analysisSlice';
import {
  selectAnalysis,
  selectDistribution,
} from '../../entities/analysis/model/selectors';
import { Button, Panel, Skeleton } from '../../shared/ui/controls';
import { BarChart } from '../../shared/ui/BarChart';
import { ResultImage } from '../../shared/ui/ResultImage';
import { resultsUrl } from '../../shared/api/resultsUrl';
import { useToast } from '../../shared/ui/Toast';
import './analytics.css';
import { ImageComparison } from '../../shared/ui/ImageComparison';
export default function AnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectAnalysis);
  const distribution = useAppSelector(selectDistribution);
  const toast = useToast();
  const data = state.result?.analysis;
  async function run() {
    try {
      await dispatch(runInspection()).unwrap();
      toast('Dataset inspection completed.');
    } catch {
      toast('Dataset inspection failed.');
    }
  }
  return (
    <section className="od-analytics">
      <span className="eyebrow">SATELLITE ANALYTICS</span>
      <h2>Satellite Image Analysis</h2>
      <ImageUpload onFileSelect={setFile} />
      <UserUpload key={file?.name ?? "empty"} file={file} />
      <Panel title="MARIDA dataset inspection">
        <p>
          Inspect the server-configured research sample and its existing annotations. This
          does not use the selected file.
        </p>
        <Button disabled={state.status === 'loading'} onClick={() => void run()}>
          {state.status === 'loading' ? 'Inspecting…' : 'Inspect dataset sample'}
        </Button>
      </Panel>
      {state.status === 'loading' && <Skeleton />}
      {state.error && (
        <p role="alert" className="od-analytics-error">
          {state.error}
        </p>
      )}
      {data && (
        <>
          <Panel title="Sample statistics">
            <dl className="od-metrics">
              {Object.entries({
                Dimensions: `${data.image.width} × ${data.image.height}`,
                Bands: data.image.bands,
                CRS: data.image.crs,
                'Annotated debris pixels': data.marine_debris_pixels,
              }).map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>
          <Panel title="Annotation distribution">
            <BarChart title="Pixels by class code" items={distribution} />
            <BarChart
              title="Confidence annotation counts"
              items={Object.entries(data.confidence).map(([label, value]) => ({
                label,
                value,
              }))}
            />
          </Panel>
          <Panel title="Research visualizations">
            <ImageComparison
              key={state.completedAt}
              before={resultsUrl(
                '/results/rgb_image.png',
                state.completedAt ?? undefined,
              )}
              after={resultsUrl(
                '/results/marine_debris_overlay.png',
                state.completedAt ?? undefined,
              )}
            />
            <div className="od-image-grid">
              {[
                ['rgb_image.png', 'RGB image'],
                ['class_mask.png', 'Ground-truth class mask'],
                ['confidence_mask.png', 'Annotation confidence mask'],
                ['marine_debris_overlay.png', 'Annotated marine debris overlay'],
              ].map(([path, alt]) => (
                <ResultImage
                  key={`${path}-${state.completedAt}`}
                  src={resultsUrl(`/results/${path}`, state.completedAt ?? undefined)}
                  alt={alt}
                />
              ))}
            </div>
          </Panel>
          <details>
            <summary>Processing log</summary>
            <pre className="od-log">{state.result?.output}</pre>
          </details>
        </>
      )}
    </section>
  );
}
