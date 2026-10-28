import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { useProgress } from '@react-three/drei/core/Progress.js';
import {
  ACESFilmicToneMapping,
  Box3,
  Mesh,
  PCFShadowMap,
  SRGBColorSpace,
  Vector3,
  type Object3D,
} from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import {
  assertModelContract,
  modelUrl,
  requiredNodeNames,
} from '../../lib/glb-contract';
import { getFramingPoints } from '../../lib/camera';
import { photos } from '../../content/media';
import { themes } from '../../lib/theme';
import { useSalsaInteraction } from './useSalsaInteraction';
import { isInteractiveObject } from '../../lib/interactive-object';
import type { CanvasProps } from './scene-types';
import { useModelMaterials } from './useModelMaterials';
import { usePortfolioTransition } from './usePortfolioTransition';
import { CameraControls } from './CameraControls';
import { usePointerDrag } from './usePointerDrag';
import { usePhotoSway } from './usePhotoSway';
import { PhotoLighting } from './PhotoLighting';
import { SceneBenchmark } from './SceneBenchmark';
import { SceneLighting } from './SceneLighting';
import { SceneRendering } from './SceneRendering';
import { CookingEffects } from './CookingEffects';
import { BerlinEnvironment } from './BerlinEnvironment';
import { chooseSceneQuality, getRendererName } from './scene-quality';

function reportDownloadProgress(event: ProgressEvent) {
  if (!event.lengthComputable || event.total <= 0) return;
  window.dispatchEvent(
    new CustomEvent('taqueria:scene-progress', {
      detail: { loaded: event.loaded, total: event.total },
    }),
  );
}

function LoadingProgress({ onProgress }: Pick<CanvasProps, 'onProgress'>) {
  const { active, item } = useProgress();
  useEffect(() => {
    onProgress(
      active && item.endsWith('.glb')
        ? 'Loading the stand…'
        : 'Finishing setup…',
    );
  }, [active, item, onProgress]);
  return null;
}
function Model({
  guitarPhase,
  onCameraMotion,
  onGuitarOpen,
  onMusicPause,
  photoId,
  onPhotoRequest,
  onPhotoSettled,
  active,
  reducedMotion,
  cameraActions,
  sceneRevealed,
  onReady,
}: Pick<
  CanvasProps,
  | 'guitarPhase'
  | 'onCameraMotion'
  | 'onGuitarOpen'
  | 'onMusicPause'
  | 'photoId'
  | 'onPhotoRequest'
  | 'onPhotoSettled'
  | 'active'
  | 'reducedMotion'
  | 'cameraActions'
  | 'sceneRevealed'
  | 'onReady'
>) {
  // The frozen GLB needs no Draco or Meshopt decoder.
  const { scene } = useLoader(
    GLTFLoader,
    modelUrl,
    undefined,
    reportDownloadProgress,
  );
  const { camera, size, gl, invalidate } = useThree();
  const quality = useMemo(
    () =>
      chooseSceneQuality(
        size.width,
        getRendererName(gl),
        new URLSearchParams(location.search).get('quality'),
        matchMedia('(pointer: coarse)').matches,
      ),
    [size.width, gl],
  );
  const reported = useRef(false);
  const readyFrame = useRef(0);
  const parsedAt = useRef(performance.now());
  const dragged = usePointerDrag(gl.domElement);
  const bounds = useMemo(() => {
    assertModelContract(scene);
    return new Box3().setFromObject(scene);
  }, [scene]);
  const trompo = useMemo(
    () => scene.getObjectByName('TROMPO_ROTATING'),
    [scene],
  );
  const amp = useMemo(() => {
    const node = scene.getObjectByName('AMP_INTERACTION');
    if (!node) throw new Error('Required amplifier group missing');
    return node;
  }, [scene]);
  const framingPoints = useMemo(() => getFramingPoints(scene), [scene]);
  const notebook = useMemo(() => {
    const node = scene.getObjectByName('SKETCHBOOK_INTERACTION');
    if (!node) throw new Error('Required sketchbook group missing');
    return node;
  }, [scene]);
  useModelMaterials(scene, invalidate);
  const portfolio = usePortfolioTransition(
    scene,
    reducedMotion,
    active,
    onCameraMotion,
  );
  useEffect(() => {
    if (portfolio.phase === 'portfolio') onMusicPause();
  }, [portfolio.phase, onMusicPause]);
  const salsa = useSalsaInteraction(
    scene,
    active &&
      sceneRevealed &&
      !photoId &&
      guitarPhase === 'idle' &&
      portfolio.phase === 'idle',
    reducedMotion,
  );
  usePhotoSway(
    scene,
    active &&
      sceneRevealed &&
      !reducedMotion &&
      !photoId &&
      guitarPhase === 'idle' &&
      portfolio.phase === 'idle',
    reducedMotion,
  );
  useEffect(() => {
    if (!photoId) return;
    const index = photos.findIndex((photo) => photo.id === photoId);
    const image = scene.getObjectByName(`HIT_PHOTOS_POLAROID_${index}`);
    if (!(image instanceof Mesh))
      throw new Error(`Photo surface missing: ${photoId}`);
    let current = true;
    const actions = cameraActions.current;
    if (!actions) {
      onPhotoSettled(false);
      return;
    }
    actions.focusOn(image, (completed) => {
      if (current) onPhotoSettled(completed);
    });
    return () => {
      current = false;
    };
  }, [photoId, scene, cameraActions, onPhotoSettled]);
  const closeOverlays = useCallback(() => {
    onPhotoSettled(false);
  }, [onPhotoSettled]);
  useEffect(() => () => cancelAnimationFrame(readyFrame.current), []);
  useEffect(() => {
    delete gl.domElement.dataset.interactive;
    return () => {
      delete gl.domElement.dataset.interactive;
    };
  }, [gl, active]);
  useFrame((_, delta) => {
    if (
      active &&
      portfolio.phase === 'idle' &&
      sceneRevealed &&
      !reducedMotion &&
      trompo
    )
      trompo.rotation.y += (Math.min(delta, 0.05) * Math.PI * 2) / 13;
    if (reported.current) return;
    reported.current = true;
    readyFrame.current = requestAnimationFrame(() => {
      performance.mark('taqueria:scene-ready');
      const targets: Record<string, { x: number; y: number }> = {};
      for (const name of requiredNodeNames.filter(
        (name) => name.startsWith('HIT_') || name.startsWith('SALSA_'),
      )) {
        const node = scene.getObjectByName(name);
        if (!node) continue;
        const center = new Box3().setFromObject(node).getCenter(new Vector3());
        center.project(camera);
        targets[name] = { x: center.x, y: center.y };
      }
      onReady({
        readyMs: Math.round(performance.now()),
        modelParsedMs: Math.round(parsedAt.current),
        calls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
        textures: gl.info.memory.textures,
        dpr: gl.getPixelRatio(),
        renderer: getRendererName(gl),
        quality: quality.name,
        rendering: {
          toneMapping: gl.toneMapping,
          exposure: gl.toneMappingExposure,
          outputColorSpace: gl.outputColorSpace,
          shadows: gl.shadowMap.enabled,
          shadowMapType: gl.shadowMap.type,
        },
        modelDownloadMs: (() => {
          const resource = performance
            .getEntriesByName(new URL(modelUrl, location.origin).href)
            .find((entry) => entry instanceof PerformanceResourceTiming);
          return resource instanceof PerformanceResourceTiming
            ? Math.round(resource.duration)
            : null;
        })(),
        targets,
      });
    });
  });
  return (
    <>
      <SceneRendering quality={quality} />
      <BerlinEnvironment />
      <SceneLighting scene={scene} quality={quality} />
      <PhotoLighting scene={scene} photoId={photoId} />
      <CookingEffects
        scene={scene}
        quality={quality}
        active={active}
        sceneRevealed={sceneRevealed}
        reducedMotion={reducedMotion}
      />
      {new URLSearchParams(location.search).has('benchmark') && (
        <SceneBenchmark />
      )}
      <CameraControls
        amp={amp}
        guitarPhase={guitarPhase}
        notebook={notebook}
        onCameraMotion={onCameraMotion}
        onReset={closeOverlays}
        bounds={bounds}
        framingPoints={framingPoints}
        active={active && portfolio.phase === 'idle'}
        reducedMotion={reducedMotion}
        cameraActions={cameraActions}
        sceneRevealed={sceneRevealed}
      />
      {portfolio.effect}
      <primitive
        object={scene}
        dispose={null}
        onPointerMove={(event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation();
          salsa.hover(dragged.current ? null : event.object);
          gl.domElement.dataset.interactive = String(
            isInteractiveObject(event.object),
          );
        }}
        onPointerOut={() => {
          salsa.hover(null);
          delete gl.domElement.dataset.interactive;
        }}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          if (
            event.button !== 0 ||
            dragged.current ||
            portfolio.phase !== 'idle' ||
            guitarPhase !== 'idle'
          )
            return;
          for (
            let node: Object3D | null = event.object;
            node;
            node = node.parent
          ) {
            if (!photoId && node.name === 'AMP_INTERACTION') {
              event.stopPropagation();
              onGuitarOpen();
              return;
            }
            const match = /^POLAROID_(\d)_SWING_PIVOT$/.exec(node.name);
            const photo = match ? photos[Number(match[1])] : undefined;
            if (photo) {
              event.stopPropagation();
              if (photo.id !== photoId) onPhotoRequest(photo.id);
              return;
            }
          }
          if (photoId) return;
          for (
            let node: Object3D | null = event.object;
            node;
            node = node.parent
          ) {
            if (node === notebook) {
              event.stopPropagation();
              cameraActions.current?.focusDrawings();
              return;
            }
            const theme = themes.find((theme) => theme.node === node.name);
            if (!theme) continue;
            event.stopPropagation();
            salsa.select(theme.id);
            return;
          }
          if (event.object.name === 'HIT_WORK_CRT_SCREEN') {
            event.stopPropagation();
            void portfolio.enterPortfolio();
          }
        }}
      />
    </>
  );
}
function ContextLifecycle({ onFailure }: Pick<CanvasProps, 'onFailure'>) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onFailure(
        'The 3D connection was interrupted. You can still explore the portfolio.',
      );
    };
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, onFailure]);
  return null;
}
export function ExperienceCanvas(props: CanvasProps) {
  return (
    <Canvas
      aria-label="Interactive Taquería Aldo. Use the HTML controls for keyboard navigation."
      camera={{ fov: 38, near: 0.1, far: 100, position: [0, 3, 10] }}
      dpr={[1, 1.5]}
      frameloop={
        props.active && props.sceneRevealed && !props.reducedMotion
          ? 'always'
          : 'demand'
      }
      shadows={{ type: PCFShadowMap, autoUpdate: false }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1,
        outputColorSpace: SRGBColorSpace,
      }}
      fallback={
        <span>
          Your browser cannot display the 3D stand. Use the page navigation to
          explore the portfolio.
        </span>
      }
    >
      <ContextLifecycle onFailure={props.onFailure} />
      <LoadingProgress onProgress={props.onProgress} />
      <Suspense fallback={null}>
        <Model {...props} />
      </Suspense>
    </Canvas>
  );
}
