import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from 'react';
import { photos, type MediaItem } from '../../content/media';
import { PhotoControls } from './PhotoControls';
import { AmpAudio, type AmpAudioActions } from './AmpAudio';
import { SceneErrorBoundary } from './SceneErrorBoundary';
import { useSceneActivity } from './useSceneActivity';
import type { CameraActions, CanvasProps, SceneMetrics } from './scene-types';
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
  const [photoView, setPhotoView] = useState<{
    photo: MediaItem;
    phase: 'zooming' | 'focused';
  } | null>(null);
  const photoOpener = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState('Preparing the stand…');
  const [debug, setDebug] = useState(false);
  const [loaderDismissed, setLoaderDismissed] = useState(false);
  const cameraActions = useRef<CameraActions | null>(null);
  const ampAudio = useRef<AmpAudioActions | null>(null);
  const toggleMusic = useCallback(() => ampAudio.current?.toggle(), []);
  const pauseMusic = useCallback(() => ampAudio.current?.pause(), []);
  const playSalsa = useCallback(() => ampAudio.current?.splat(), []);
  const cameraMotion = useCallback(
    (moving: boolean) => ampAudio.current?.cameraMotion(moving),
    [],
  );
  const { visible, reducedMotion } = useSceneActivity(container);
  const onFailure = useCallback((message: string) => {
    setState({ status: 'failed', message });
    setPhotoView(null);
  }, []);
  const onReady = useCallback(
    (metrics: SceneMetrics) =>
      setState((previous) =>
        previous.status === 'failed' ? previous : { status: 'ready', metrics },
      ),
    [],
  );
  const onPhotoRequest = useCallback(
    (id: string) => {
      const photo = photos.find((item) => item.id === id);
      if (!photo || state.status !== 'ready') return;
      if (!photoView && document.activeElement instanceof HTMLElement)
        photoOpener.current = document.activeElement;
      setPhotoView({
        photo,
        phase: 'zooming',
      });
    },
    [photoView, state.status],
  );
  const onPhotoSettled = useCallback((completed: boolean) => {
    setPhotoView((previous) =>
      previous && completed ? { ...previous, phase: 'focused' } : null,
    );
  }, []);
  const closePhoto = useCallback(() => {
    setPhotoView(null);
    cameraActions.current?.resetView();
    requestAnimationFrame(() =>
      photoOpener.current?.focus({ preventScroll: true }),
    );
  }, []);
  useEffect(() => {
    const reveal = () => setLoaderDismissed(true);
    window.addEventListener('taqueria:loader-dismissed', reveal);
    if (!document.getElementById('ascii-taco-loader')) reveal();
    return () =>
      window.removeEventListener('taqueria:loader-dismissed', reveal);
  }, []);
  useEffect(() => {
    if (state.status !== 'loading')
      window.dispatchEvent(
        new CustomEvent('taqueria:scene-settled', { detail: state.status }),
      );
  }, [state.status]);
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
        data-photo-id={photoView?.photo.id}
        data-photo-state={photoView?.phase}
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
                onCameraMotion={cameraMotion}
                onSalsaPress={playSalsa}
                onMusicToggle={toggleMusic}
                onMusicPause={pauseMusic}
                photoId={photoView?.photo.id ?? null}
                onPhotoRequest={onPhotoRequest}
                onPhotoSettled={onPhotoSettled}
                active={visible && photoView?.phase !== 'focused'}
                reducedMotion={reducedMotion}
                cameraActions={cameraActions}
                sceneRevealed={state.status === 'ready' && loaderDismissed}
                onReady={onReady}
                onFailure={onFailure}
                onProgress={setProgress}
              />
            </SceneErrorBoundary>
          </div>
        )}
        <AmpAudio ref={ampAudio} />
        <details
          className={styles.photoPicker}
          data-photo-picker
          hidden={Boolean(photoView)}
        >
          <summary>Photos</summary>
          <nav aria-label="Photos">
            {photos.map((photo) => (
              <a
                key={photo.id}
                href={photo.original ?? photo.preview}
                onClick={(event) => {
                  if (state.status !== 'ready') return;
                  event.preventDefault();
                  onPhotoRequest(photo.id);
                }}
              >
                {photo.title}
              </a>
            ))}
          </nav>
        </details>
        {state.status !== 'ready' && (
          <div className={styles.loading} role="status">
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
        {photoView && (
          <PhotoControls
            photo={photoView.photo}
            moving={photoView.phase === 'zooming'}
            onClose={closePhoto}
            onSelect={onPhotoRequest}
          />
        )}
        {state.status === 'ready' && !photoView && (
          <div className={styles.cameraTools} data-camera-tools>
            <span>Drag to explore · Scroll to zoom</span>
            <button
              type="button"
              onClick={() => cameraActions.current?.resetView()}
            >
              Reset view
            </button>
          </div>
        )}
        {state.status === 'ready' && (
          <p className="sr-only" role="status">
            The interactive stand is ready. Drag with the left mouse button to
            explore, or focus the canvas and use arrow keys. Scroll or use plus
            and minus to zoom. Press Home to reset. Click the CRT or use the
            View work link.
          </p>
        )}
        <noscript>
          <p>
            The interactive scene needs JavaScript. Use the page navigation to
            view the portfolio.
          </p>
        </noscript>
      </div>
      {debug && state.status === 'ready' && (
        <output
          className={styles.diagnostics}
          aria-label="Scene diagnostics"
          data-scene-debug
        >
          Ready {state.metrics.readyMs} ms · {state.metrics.calls} draw calls ·{' '}
          {state.metrics.triangles} triangles · DPR {state.metrics.dpr}
        </output>
      )}
    </div>
  );
}
