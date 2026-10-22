import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei/core/Gltf.js';
import { useProgress } from '@react-three/drei/core/Progress.js';
import {
  ACESFilmicToneMapping,
  Box3,
  PCFShadowMap,
  SRGBColorSpace,
  Vector3,
} from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import {
  assertModelContract,
  modelUrl,
  requiredNodeNames,
} from '../../lib/glb-contract';
import { getFramingPoints } from '../../lib/camera';
import type { CanvasProps } from './scene-types';
import { useModelMaterials } from './useModelMaterials';
import { CameraControls } from './CameraControls';
import { usePointerDrag } from './usePointerDrag';
import { SceneBenchmark } from './SceneBenchmark';
import { SceneLighting } from './SceneLighting';
import { SceneRendering } from './SceneRendering';
import { CookingEffects } from './CookingEffects';
import { BerlinEnvironment } from './BerlinEnvironment';
import { chooseSceneQuality, getRendererName } from './scene-quality';

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
  active,
  reducedMotion,
  cameraActions,
  sceneRevealed,
  onReady,
}: Pick<
  CanvasProps,
  'active' | 'reducedMotion' | 'cameraActions' | 'sceneRevealed' | 'onReady'
>) {
  const { scene } = useGLTF(modelUrl);
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
  const framingPoints = useMemo(() => getFramingPoints(scene), [scene]);
  useModelMaterials(scene, invalidate);
  useEffect(() => () => cancelAnimationFrame(readyFrame.current), []);
  useFrame((_, delta) => {
    if (active && sceneRevealed && !reducedMotion && trompo)
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
        bounds={bounds}
        framingPoints={framingPoints}
        active={active}
        reducedMotion={reducedMotion}
        cameraActions={cameraActions}
        sceneRevealed={sceneRevealed}
      />
      <primitive
        object={scene}
        dispose={null}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          if (
            event.button === 0 &&
            !dragged.current &&
            event.object.name === 'HIT_WORK_CRT_SCREEN'
          )
            window.location.assign('/work');
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
