import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from 'react';
import { photos, type MediaItem } from '../../content/media';
import {
  GuitarVideoExperience,
  type GuitarVideoActions,
} from './GuitarVideoExperience';
import { SceneAnnotations } from './SceneAnnotations';
import { restoreSceneFocus } from './annotation-focus';
import type { AnnotationElements } from '../../lib/scene-annotations';
import { PhotoControls } from './PhotoControls';
import { BackToStandButton } from './BackToStandButton';
import photoControlsStyles from './PhotoControls.module.css';
import type { PhotoControlsLayout } from '../../lib/photo-controls-layout';
import { AmpAudio, type AmpAudioActions } from './AmpAudio';
import { SceneErrorBoundary } from './SceneErrorBoundary';
import { useSceneActivity } from './useSceneActivity';
import type {
  CameraActions,
  CanvasProps,
  SceneMetrics,
  GuitarPhase,
} from './scene-types';
import styles from './Experience.module.css';

type SceneState =
  | { status: 'loading' }
  | { status: 'ready'; metrics: SceneMetrics }
  | { status: 'failed'; message: string };

export default function Experience() {
  const container = useRef<HTMLDivElement>(null);
  const annotationLayer = useRef<HTMLDivElement>(null);
  const annotationElements = useRef<AnnotationElements>({
    work: null,
    photos: null,
    drawings: null,
    guitar: null,
  });
  const [hasExplored, setHasExplored] = useState(false);
  const [viewChanged, setViewChanged] = useState(false);
  const onCameraExplore = useCallback(() => {
    setHasExplored(true);
    setViewChanged(true);
  }, []);
  const onCameraReset = useCallback(() => setViewChanged(false), []);
  const [CanvasComponent, setCanvasComponent] =
    useState<ComponentType<CanvasProps> | null>(null);
  const [state, setState] = useState<SceneState>({ status: 'loading' });
  const [photoView, setPhotoView] = useState<{
    photo: MediaItem;
    phase: 'zooming' | 'focused';
  } | null>(null);
  const [guitarPhase, setGuitarPhase] = useState<GuitarPhase>('idle');
  const [drawingsView, setDrawingsView] = useState(false);
  const drawingsTrigger = useRef<HTMLButtonElement>(null);
  const [photoLayout, setPhotoLayout] = useState<PhotoControlsLayout | null>(
    null,
  );
  const guitar = useRef<GuitarVideoActions | null>(null);
  const guitarTrigger = useRef<HTMLButtonElement>(null);
  const photoOpener = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState('Preparing the stand…');
  const [debug, setDebug] = useState(false);
  const [loaderDismissed, setLoaderDismissed] = useState(false);
  const cameraActions = useRef<CameraActions | null>(null);
  const ampAudio = useRef<AmpAudioActions | null>(null);
  const openGuitar = useCallback(() => guitar.current?.open(), []);
  const pauseMusic = useCallback(() => ampAudio.current?.pause(), []);
  const cameraMotion = useCallback(
    (moving: boolean) => ampAudio.current?.cameraMotion(moving),
    [],
  );
  const { visible, reducedMotion } = useSceneActivity(container);
  const onFailure = useCallback((message: string) => {
    guitar.current?.close(true, false);
    setState({ status: 'failed', message });
    setPhotoView(null);
    setDrawingsView(false);
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
    restoreSceneFocus(photoOpener.current);
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
        onPointerDownCapture={() => setHasExplored(true)}
        onClickCapture={() => setHasExplored(true)}
        data-scene-status={state.status}
        data-guitar-phase={guitarPhase}
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
                annotationLayer={annotationLayer}
                annotationElements={annotationElements}
                onCameraExplore={onCameraExplore}
                onCameraReset={onCameraReset}
                onCameraMotion={cameraMotion}
                guitarPhase={guitarPhase}
                onGuitarOpen={openGuitar}
                onMusicPause={pauseMusic}
                photoId={photoView?.photo.id ?? null}
                onPhotoRequest={onPhotoRequest}
                onPhotoSettled={onPhotoSettled}
                onPhotoLayout={setPhotoLayout}
                onDrawingsView={setDrawingsView}
                active={
                  visible &&
                  photoView?.phase !== 'focused' &&
                  guitarPhase !== 'open'
                }
                reducedMotion={reducedMotion}
                cameraActions={cameraActions}
                sceneRevealed={state.status === 'ready' && loaderDismissed}
                onReady={onReady}
                onFailure={onFailure}
                onProgress={setProgress}
              />
            </SceneErrorBoundary>
            {state.status === 'ready' && (
              <div className={styles.film} data-scene-film aria-hidden="true" />
            )}
          </div>
        )}
        <AmpAudio ref={ampAudio} />
        <GuitarVideoExperience
          ref={guitar}
          cameraActions={cameraActions}
          audio={ampAudio}
          phase={guitarPhase}
          onPhaseChange={setGuitarPhase}
          reducedMotion={reducedMotion}
          trigger={guitarTrigger}
        />
        <SceneAnnotations
          available={
            state.status === 'ready' &&
            !photoView &&
            !drawingsView &&
            guitarPhase === 'idle'
          }
          layer={annotationLayer}
          elements={annotationElements}
          drawingsTrigger={drawingsTrigger}
          guitarTrigger={guitarTrigger}
          onDrawings={() => cameraActions.current?.focusDrawings()}
          onGuitar={openGuitar}
          onPhoto={onPhotoRequest}
        />
        {state.status === 'failed' && (
          <details className={styles.photoPicker} data-photo-picker>
            <summary>Photos</summary>
            <nav aria-label="Photos">
              {photos.map((photo) => (
                <a key={photo.id} href={photo.original ?? photo.preview}>
                  {photo.title}
                </a>
              ))}
            </nav>
          </details>
        )}
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
            layout={photoLayout}
            photo={photoView.photo}
            moving={photoView.phase === 'zooming'}
            onClose={closePhoto}
            onSelect={onPhotoRequest}
          />
        )}
        {state.status === 'ready' &&
          drawingsView &&
          !photoView &&
          guitarPhase === 'idle' && (
            <nav
              className={photoControlsStyles.controls}
              aria-label="Drawing navigation"
            >
              <BackToStandButton
                autoFocus
                onClick={() => {
                  cameraActions.current?.resetView();
                  restoreSceneFocus(drawingsTrigger.current);
                }}
              />
            </nav>
          )}
        {state.status === 'ready' &&
          !drawingsView &&
          !photoView &&
          guitarPhase === 'idle' && (
            <div
              className={styles.cameraTools}
              data-camera-tools
              data-view-changed={viewChanged}
            >
              <span data-used={hasExplored}>
                Drag or use arrow keys · Scroll / pinch to zoom
              </span>
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
            and minus to zoom. Press Home to reset. Click the CRT or use Work in
            the stand interactions or header navigation.
          </p>
        )}
        {state.status === 'failed' && guitarPhase === 'idle' && (
          <button
            ref={guitarTrigger}
            className={styles.guitarFallback}
            type="button"
            onClick={openGuitar}
          >
            Play Aldo's guitar video
          </button>
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
