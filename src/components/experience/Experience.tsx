import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from 'react';
import { SceneErrorBoundary } from './SceneErrorBoundary';
import { useSceneActivity } from './useSceneActivity';
import type { CanvasProps, SceneMetrics } from './scene-types';
import styles from './Experience.module.css';

type SceneState =
  | { status: 'loading' }
  | { status: 'ready'; metrics: SceneMetrics }
  | { status: 'failed'; message: string };

export default function Experience() {
  const container = useRef<HTMLDivElement>(null);
  const [CanvasComponent, setCanvasComponent] =
    useState<ComponentType<CanvasProps> | null>(null);
  const [state, setState] = useState<SceneState>({ status: 'loading' });
  const [progress, setProgress] = useState('Preparing the stand…');
  const [debug, setDebug] = useState(false);
  const { visible, reducedMotion } = useSceneActivity(container);
  const onFailure = useCallback(
    (message: string) => setState({ status: 'failed', message }),
    [],
  );
  const onReady = useCallback(
    (metrics: SceneMetrics) =>
      setState((previous) =>
        previous.status === 'failed' ? previous : { status: 'ready', metrics },
      ),
    [],
  );
  useEffect(() => {
    let disposed = false;
    if (typeof WebGL2RenderingContext === 'undefined') {
      onFailure(
        'Your browser does not support this 3D scene. You can still explore the portfolio.',
      );
      return;
    }
    setDebug(new URLSearchParams(location.search).has('debug'));
    performance.mark('taqueria:scene-import');
    void import('./ExperienceCanvas')
      .then(({ ExperienceCanvas }) => {
        if (!disposed) setCanvasComponent(() => ExperienceCanvas);
      })
      .catch(() => {
        if (!disposed)
          onFailure(
            'The interactive scene could not download. You can still explore the portfolio.',
          );
      });
    return () => {
      disposed = true;
    };
  }, [onFailure]);
  useEffect(() => {
    if (state.status !== 'loading') return;
    const timeout = window.setTimeout(
      () =>
        onFailure(
          'The stand is taking too long to load. You can explore the portfolio now and try the scene later.',
        ),
      20000,
    );
    return () => clearTimeout(timeout);
  }, [state.status, onFailure]);
  return (
    <div ref={container}>
      <div
        className={styles.stage}
        data-scene-status={state.status}
        data-scene-metrics={
          state.status === 'ready' ? JSON.stringify(state.metrics) : undefined
        }
      >
        {CanvasComponent && state.status !== 'failed' && (
          <div
            className={styles.canvas}
            data-visible={state.status === 'ready'}
          >
            <SceneErrorBoundary onFailure={onFailure}>
              <CanvasComponent
                active={visible}
                reducedMotion={reducedMotion}
                onReady={onReady}
                onFailure={onFailure}
                onProgress={setProgress}
              />
            </SceneErrorBoundary>
          </div>
        )}
        {state.status !== 'ready' && (
          <div className={styles.loading} role="status">
            {state.status === 'loading' && (
              <div className={styles.loader} aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            )}
            <p>
              {state.status === 'failed'
                ? 'The portfolio is still open.'
                : progress}
            </p>
            <span>
              {state.status === 'failed'
                ? state.message
                : 'Your work navigation is ready while the stand loads.'}
            </span>
            {state.status === 'failed' && (
              <a className="button" href="/work">
                View work
              </a>
            )}
          </div>
        )}
        {state.status === 'ready' && (
          <span className={styles.sceneNote}>
            Explore the stand · the CRT opens Work
          </span>
        )}
        <noscript>
          <p>
            The interactive scene needs JavaScript. Use the page navigation to
            view the portfolio.
          </p>
        </noscript>
      </div>
      {debug && state.status === 'ready' && (
        <output className={styles.diagnostics} aria-label="Scene diagnostics">
          Ready {state.metrics.readyMs} ms · {state.metrics.calls} draw calls ·{' '}
          {state.metrics.triangles} triangles · DPR {state.metrics.dpr}
        </output>
      )}
    </div>
  );
}
