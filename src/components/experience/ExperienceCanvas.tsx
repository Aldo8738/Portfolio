import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei/core/Gltf.js';
import { useProgress } from '@react-three/drei/core/Progress.js';
import { Box3, PerspectiveCamera, Vector3 } from 'three';
import {
  assertModelContract,
  modelUrl,
  requiredNodeNames,
} from '../../lib/glb-contract';
import { fitCamera, getFramingPoints } from '../../lib/camera';
import type { CanvasProps } from './scene-types';
import { useModelMaterials } from './useModelMaterials';

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
  onReady,
}: Pick<CanvasProps, 'active' | 'reducedMotion' | 'onReady'>) {
  const { scene } = useGLTF(modelUrl);
  const { camera, size, gl, invalidate } = useThree();
  const reported = useRef(false);
  const readyFrame = useRef(0);
  const parsedAt = useRef(performance.now());
  const bounds = useMemo(() => {
    assertModelContract(scene);
    return new Box3().setFromObject(scene);
  }, [scene]);
  const trompo = useMemo(
    () => scene.getObjectByName('TROMPO_ROTATING'),
    [scene],
  );
  const framingPoints = useMemo(() => getFramingPoints(scene), [scene]);
  useModelMaterials(scene, size.width < 700, invalidate);
  useLayoutEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;
    const fit = fitCamera(
      bounds,
      size.width / size.height,
      camera.fov,
      framingPoints,
    );
    camera.position.copy(fit.position);
    camera.lookAt(fit.target);
    camera.updateProjectionMatrix();
    invalidate();
  }, [bounds, framingPoints, camera, size.width, size.height, invalidate]);
  useEffect(() => () => cancelAnimationFrame(readyFrame.current), []);
  useFrame((_, delta) => {
    if (active && !reducedMotion && trompo)
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
        renderer: (() => {
          const context = gl.getContext();
          const extension = context.getExtension('WEBGL_debug_renderer_info');
          return extension
            ? String(context.getParameter(extension.UNMASKED_RENDERER_WEBGL))
            : 'Unavailable';
        })(),
        quality: size.width < 700 ? 'mobile' : 'standard',
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
    <primitive
      object={scene}
      dispose={null}
      onClick={(event: { object: { name: string } }) => {
        if (event.object.name === 'HIT_WORK_CRT_SCREEN')
          window.location.assign('/work');
      }}
    />
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
      frameloop={props.active && !props.reducedMotion ? 'always' : 'demand'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      fallback={
        <span>
          Your browser cannot display the 3D stand. Use the page navigation to
          explore the portfolio.
        </span>
      }
    >
      <hemisphereLight args={['#9baed5', '#392024', 1.7]} />
      <directionalLight position={[2, 7, 5]} color="#ffce98" intensity={3.2} />
      <directionalLight
        position={[-4, 4, -3]}
        color="#7299ff"
        intensity={2.4}
      />
      <pointLight
        position={[0, 2.7, 0.6]}
        color="#ffac62"
        intensity={12}
        distance={5}
        decay={2}
      />
      <ContextLifecycle onFailure={props.onFailure} />
      <LoadingProgress onProgress={props.onProgress} />
      <Suspense fallback={null}>
        <Model {...props} />
      </Suspense>
    </Canvas>
  );
}
